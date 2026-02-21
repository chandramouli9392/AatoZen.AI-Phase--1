import os
import subprocess
import shlex
import asyncio
import json
import google.generativeai as genai
from fastapi import HTTPException
from ..core.config import GEMINI_API_KEY, OUTPUT_FOLDER
from ..utils.ffmpeg_utils import validate_command
from ..utils.metadata_utils import get_video_metadata

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def generate_video(metadata_list: list, user_prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured.")
    
    # Prepare metadata with relative paths for Gemini
    formatted_metadata = []
    backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    for item in metadata_list:
        rel_path = os.path.relpath(item["path"], backend_root)
        formatted_metadata.append({
            "path": rel_path.replace("\\", "/"),
            "duration": item["metadata"].get("duration"),
            "resolution": f"{item['metadata'].get('width')}x{item['metadata'].get('height')}",
            "fps": item["metadata"].get("fps")
        })

    model = genai.GenerativeModel("gemini-flash-latest")
    prompt = f"""
    You are an expert cinematic editor.

    Metadata of uploaded clips:
    {json.dumps(formatted_metadata, indent=2)}

    User creative request:
    {user_prompt}

    STRICT RULES:

    1. Use the EXACT 'path' provided for each clip in your FFmpeg command (e.g., uploads/filename.mp4).
    2. Combine all uploaded clips sequentially in order.
    3. Do not remove any frames.
    4. Do not trim.
    5. Final output duration MUST equal sum of all input clip durations.
    6. Apply smooth 0.4 second crossfade transitions without reducing timeline length.
    7. Normalize resolution to 1920x1080 at 30fps.
    8. Preserve original audio.
    9. Never use -shortest.
   10. Output ONLY the raw FFmpeg command.
   11. Use -y flag.
   12. Save output as outputs/merged.mp4.
    """
    
    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            cmd = response.text.strip().replace("```bash", "").replace("```", "").strip()
            if not cmd.lower().startswith("ffmpeg"):
                continue
            
            print(f"Generated Command: {cmd}")
            is_safe, msg = validate_command(cmd)
            if not is_safe:
                raise Exception(f"Validation failed: {msg}")
            
            # Execute command from root as paths are 'uploads/' and 'outputs/'
            # We assume the server runs from the 'backend' folder
            working_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            
            process = subprocess.run(
                shlex.split(cmd), 
                check=True, 
                capture_output=True, 
                text=True,
                cwd=working_dir
            )
            print("FFmpeg command executed successfully.")
            return os.path.join(OUTPUT_FOLDER, "merged.mp4")
        except subprocess.CalledProcessError as e:
            error_msg = f"FFmpeg failed with exit code {e.returncode}. Stderr: {e.stderr}"
            print(error_msg)
            raise HTTPException(status_code=500, detail=f"Video generation failed: {error_msg}")
        except Exception as e:
            if "429" in str(e):
                await asyncio.sleep(5)
                continue
            print(f"Video Generation Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Video generation failed: {str(e)}")
    raise HTTPException(status_code=429, detail="Quota exceeded.")

def default_merge(metadata_list: list) -> str:
    """
    Robust fallback merge using FFmpeg filter_complex.
    Normalizes all clips to 1920x1080, 30fps, and 44.1kHz audio.
    """
    output_path = os.path.join(OUTPUT_FOLDER, "merged.mp4")
    
    v_chains = []
    a_chains = []
    concat_inputs = ""
    
    for i, item in enumerate(metadata_list):
        # Normalize Video: scale, pad to 1080p, set fps and sar
        v_chains.append(
            f"[{i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,"
            f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v{i}]"
        )
        
        # Normalize Audio: Check if input has audio, otherwise generate silent stream
        if item["metadata"].get("has_audio"):
            a_chains.append(f"[{i}:a]aresample=44100[a{i}]")
        else:
            duration = item["metadata"].get("duration") or 5.0
            a_chains.append(f"anullsrc=r=44100:cl=stereo:d={duration}[a{i}]")
            
        # Collect labels for concat
        concat_inputs += f"[v{i}][a{i}]"
    
    # Combine all video and audio chains followed by the concat filter
    filter_complex = ";".join(v_chains + a_chains) + f";{concat_inputs}concat=n={len(metadata_list)}:v=1:a=1[outv][outa]"
    
    command = ["ffmpeg", "-y"]
    for item in metadata_list:
        command.extend(["-i", os.path.abspath(item["path"])])
        
    command.extend([
        "-filter_complex", filter_complex,
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        output_path
    ])
    
    try:
        print(f"Executing robust merge with Filter Complexity: {filter_complex}")
        subprocess.run(command, check=True, capture_output=True)
        return output_path
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode() if e.stderr else str(e)
        print(f"Robust Merge Error Stderr: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Robust merge failed: {error_msg}")

def merge_audio_video(video_path: str, audio_path: str) -> str:
    final_path = os.path.join(OUTPUT_FOLDER, "final.mp4")
    
    # Check for audio in original video to decide filter
    meta = get_video_metadata(video_path)
    if meta.get("has_audio"):
        # Mix original audio with background music
        filter_complex = "[1:a]volume=0.3[bgm];[0:a][bgm]amix=inputs=2:duration=shortest[a]"
        map_args = ["-map", "0:v", "-map", "[a]"]
    else:
        # Just use the background music
        filter_complex = "[1:a]volume=0.3[a]"
        map_args = ["-map", "0:v", "-map", "[a]"]
        
    command = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", audio_path,
        "-filter_complex", filter_complex
    ] + map_args + [
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        final_path
    ]
    
    try:
        subprocess.run(command, check=True, capture_output=True)
        return final_path
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode() if e.stderr else str(e)
        print(f"Merge Error: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Merging failed: {error_msg}")
