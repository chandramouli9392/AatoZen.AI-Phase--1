import os
import shutil
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
from .core.config import UPLOAD_FOLDER, OUTPUT_FOLDER
from .services.video_service import generate_video, merge_audio_video, default_merge, apply_advanced_filters
from .services.music_service import generate_music
from .utils.metadata_utils import get_video_metadata, get_video_duration

app = FastAPI(title="AatoZen.AI API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to AatoZen.AI Backend API"}

@app.post("/process")
async def process_video(
    clips: List[UploadFile] = File(...),
    prompt: str = Form(...),
    music_prompt: Optional[str] = Form(None),
    music_file: Optional[UploadFile] = File(None),
    trim_start: Optional[str] = Form(None),
    trim_end: Optional[str] = Form(None),
    speed: Optional[float] = Form(1.0),
    overlay_text: Optional[str] = Form(None),
    text_position: Optional[str] = Form(None),
    resolution: Optional[str] = Form("original"),
    fade_in: bool = Form(False),
    fade_out: bool = Form(False),
    volume: Optional[int] = Form(100),
    output_name: Optional[str] = Form("final"),
    grayscale: Optional[bool] = Form(False)
):
    async def event_generator():
        try:
            # 1. Save clips and build metadata
            yield f"data: {json.dumps({'status': 'Uploading Source Material...', 'progress': 10})}\n\n"
            metadata_list = []
            for clip in clips:
                path = os.path.join(UPLOAD_FOLDER, clip.filename)
                with open(path, "wb") as buffer:
                    shutil.copyfileobj(clip.file, buffer)
                
                meta = get_video_metadata(path)
                metadata_list.append({
                    "filename": clip.filename,
                    "path": path,
                    "metadata": meta
                })
            
            # 2. Generate edited video
            yield f"data: {json.dumps({'status': 'AI Scripting & Orchestration...', 'progress': 40})}\n\n"
            is_meaningful = prompt and len(prompt.strip()) > 10
            
            if is_meaningful:
                try:
                    merged_video = await generate_video(metadata_list, prompt)
                except Exception as e:
                    print(f"Gemini failed: {str(e)}. Fallback.")
                    merged_video = default_merge(metadata_list)
            else:
                merged_video = default_merge(metadata_list)
                
            # 3. Handle Music Logic
            yield f"data: {json.dumps({'status': 'Synthesizing Sonic Atmosphere...', 'progress': 70})}\n\n"
            audio_path = None
            if music_prompt and music_prompt.strip():
                duration = get_video_duration(merged_video)
                audio_path = await generate_music(music_prompt, duration)
            elif music_file:
                audio_path = os.path.join(UPLOAD_FOLDER, music_file.filename)
                with open(audio_path, "wb") as buffer:
                    shutil.copyfileobj(music_file.file, buffer)
            
            # 4. Finalizing Production
            yield f"data: {json.dumps({'status': 'Finalizing Production...', 'progress': 90})}\n\n"
            
            import re
            safe_output_name = re.sub(r'[^a-zA-Z0-9_\-]', '', str(output_name)) if output_name else "final"
            if not safe_output_name:
                safe_output_name = "final"
                
            final_video = os.path.join(OUTPUT_FOLDER, f"{safe_output_name}.mp4")
            
            is_advanced = any([
                trim_start, trim_end, 
                speed != 1.0, 
                overlay_text, 
                resolution != "original", 
                fade_in, fade_out,
                volume != 100,
                grayscale
            ])
            
            if is_advanced:
                temp_output = os.path.join(OUTPUT_FOLDER, "temp_merged.mp4")
                if audio_path:
                    merge_audio_video(merged_video, audio_path, temp_output)
                else:
                    if os.path.exists(merged_video):
                        shutil.copy2(merged_video, temp_output)
                
                options = {
                    "trim_start": trim_start,
                    "trim_end": trim_end,
                    "speed": speed,
                    "overlay_text": overlay_text,
                    "text_position": text_position,
                    "resolution": resolution,
                    "fade_in": fade_in,
                    "fade_out": fade_out,
                    "volume": volume,
                    "grayscale": grayscale
                }
                apply_advanced_filters(temp_output, final_video, options)
                if os.path.exists(temp_output):
                    os.remove(temp_output)
            else:
                if audio_path:
                    # merge_audio_video handles generating the final video
                    merge_audio_video(merged_video, audio_path, final_video)
                else:
                    # Point 3: If merged exists but final doesn't, copy it
                    # merged_video should be outputs/merged.mp4 from generate_video or default_merge
                    if os.path.exists(merged_video):
                        shutil.copy2(merged_video, final_video)
            
            # Point 4: Safety Check
            if not os.path.exists(final_video):
                raise Exception("Final video generation failed.")
            
            # Signal completion with consistent filename
            yield f"data: {json.dumps({'status': 'Complete', 'progress': 100, 'filename': f'{safe_output_name}.mp4'})}\n\n"
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            yield f"data: {json.dumps({'status': 'Error', 'detail': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/download/{filename}")
async def download_video(filename: str):
    path = os.path.join(OUTPUT_FOLDER, filename)
    # Point 4: Safety check before returning FileResponse
    if os.path.exists(path):
        return FileResponse(path, media_type="video/mp4", filename=filename)
    raise HTTPException(status_code=404, detail="Final video generation failed.")
