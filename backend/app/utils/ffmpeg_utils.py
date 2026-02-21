import re

def validate_command(command: str):
    dangerous_patterns = [
        r"&&", r"\|\|", r"&", r">", r"<", r"`", r"\$(?!\()",
        r"\brm\b", r"\bmv\b", r"\bcp\b", r"\bwget\b", r"\bcurl\b",
        r"\bpython\b", r"\bsh\b", r"\bbash\b", r"\bcmd\b"
    ]
    for pattern in dangerous_patterns:
        if re.search(pattern, command):
            return False, f"Dangerous command pattern detected: {pattern}"
    if not command.lower().startswith("ffmpeg"):
        return False, "Command must start with 'ffmpeg'"
    return True, "Success"
