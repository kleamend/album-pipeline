import subprocess
import json
import shutil
from pathlib import Path


class AudioVerifyWorker:
    """Verifies audio file quality using ffprobe."""

    def __init__(self):
        self.ffprobe = shutil.which("ffprobe")
        if not self.ffprobe:
            raise RuntimeError("ffprobe not found")

    def verify(self, file_path: Path) -> dict:
        if not file_path.exists():
            return {"status": "failed", "error": "File not found"}

        try:
            result = subprocess.run(
                [self.ffprobe, "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", str(file_path)],
                capture_output=True, text=True, timeout=30,
            )
            if result.returncode != 0:
                return {"status": "failed", "error": result.stderr[:500]}

            data = json.loads(result.stdout)
            audio_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
            if not audio_stream:
                return {"status": "failed", "error": "No audio stream found"}

            fmt = data.get("format", {})
            bitrate = int(audio_stream.get("bit_rate", 0))
            sample_rate = int(audio_stream.get("sample_rate", 0))
            duration = float(fmt.get("duration", 0))
            file_size = int(fmt.get("size", 0))

            checks = {
                "bitrate_ok": 310_000 <= bitrate <= 330_000,
                "sample_rate_ok": sample_rate == 44100,
                "duration_ok": 60 <= duration <= 360,
                "file_size_ok": file_size >= 100_000,
            }
            all_ok = all(checks.values())

            return {
                "status": "passed" if all_ok else "failed",
                "bitrate": bitrate,
                "sample_rate": sample_rate,
                "duration": round(duration, 1),
                "file_size": file_size,
                "checks": checks,
            }

        except Exception as e:
            return {"status": "failed", "error": str(e)}
