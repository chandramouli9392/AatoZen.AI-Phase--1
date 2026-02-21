import subprocess
import json

def get_video_metadata(file_path):
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "stream=codec_type,width,height,avg_frame_rate,codec_name:format=duration",
        "-of", "json",
        file_path
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)
        streams = data.get("streams", [])
        format_info = data.get("format", {})
        video_stream = next((s for s in streams if s.get("codec_type") == "video"), {})
        audio_stream = next((s for s in streams if s.get("codec_type") == "audio"), {})
        return {
            "duration": format_info.get("duration"),
            "width": video_stream.get("width"),
            "height": video_stream.get("height"),
            "fps": video_stream.get("avg_frame_rate"),
            "video_codec": video_stream.get("codec_name"),
            "has_audio": bool(audio_stream)
        }
    except Exception:
        return {}

def get_video_duration(file_path: str) -> float:
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        file_path
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    except Exception:
        return 0.0
