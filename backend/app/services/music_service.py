import os
import httpx
from fastapi import HTTPException
from ..core.config import STABILITY_API_KEY, UPLOAD_FOLDER

def select_local_music(prompt: str) -> str:
    """
    Selects a fallback track from backend/local_music based on the prompt.
    """
    # Assuming the app runs from within backend/ or the parent, 
    # we use a relative path that works with the structure.
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    local_music_dir = os.path.join(base_dir, "local_music")
    
    prompt_lower = prompt.lower()
    
    if "calm" in prompt_lower or "soft" in prompt_lower:
        music_file = "calm.mp3"
    elif "cinematic" in prompt_lower or "epic" in prompt_lower:
        music_file = "cinematic.mp3"
    else:
        music_file = "default.mp3"
        
    music_path = os.path.join(local_music_dir, music_file)
    
    # Check if file exists, if not, we should handle it gracefully
    if not os.path.exists(music_path):
        print(f"Warning: Fallback music {music_path} not found. Returning None.")
        return None
        
    return music_path

async def generate_music(prompt: str, duration: float) -> str:
    """
    Tries to generate music via Stability AI. Falls back to local music on failure.
    """
    if not STABILITY_API_KEY:
        print("Stability API key not configured. Falling back to local music.")
        return select_local_music(prompt)
    
    output_path = os.path.join(UPLOAD_FOLDER, "generated_bgm.mp3")
    url = "https://api.stability.ai/v2beta/audio/stable-audio-2/text-to-audio"
    
    headers = {
        "authorization": f"Bearer {STABILITY_API_KEY}",
        "accept": "audio/*"
    }
    
    data = {
        "prompt": prompt,
        "seconds_total": int(duration),
        "model": "stable-audio-2.5",
        "output_format": "mp3"
    }
    
    # Force multipart/form-data
    files = {"none": ""}
    
    async with httpx.AsyncClient(timeout=300.0) as client:
        try:
            print(f"Requesting music from Stability AI (Duration: {duration}s)...")
            res = await client.post(url, headers=headers, data=data, files=files)
            
            if res.status_code != 200:
                print(f"Stability API Error: {res.status_code}. Falling back to local music.")
                return select_local_music(prompt)
            
            with open(output_path, "wb") as f:
                f.write(res.content)
            
            print("Music generated successfully!")
            return output_path
        except Exception as e:
            print(f"Music Generation failed with error: {str(e)}. Falling back to local music.")
            return select_local_music(prompt)
