import subprocess
import shutil
from pathlib import Path


class AudioTranscodeWorker:
    """Wraps ffmpeg for audio transcoding to platform standards."""

    def __init__(self):
        self.ffmpeg = shutil.which("ffmpeg")
        if not self.ffmpeg:
            raise RuntimeError("ffmpeg not found")

    def transcode(self, input_file: Path, output_file: Path, bitrate: str = "320k", sample_rate: int = 44100) -> dict:
        """Transcode audio to 320kbps MP3, normalize loudness to -14 LUFS."""
        if not input_file.exists():
            return {"status": "failed", "error": f"Input file not found: {input_file}"}

        output_file.parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            self.ffmpeg, "-y",
            "-i", str(input_file),
            "-codec:a", "libmp3lame",
            "-b:a", bitrate,
            "-ar", str(sample_rate),
            "-af", "loudnorm=I=-14:LRA=11:TP=-1",
            str(output_file),
        ]

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            if result.returncode != 0:
                return {"status": "failed", "error": result.stderr[:500], "output_file": str(output_file)}

            if output_file.exists() and output_file.stat().st_size > 100_000:
                return {"status": "completed", "output_file": str(output_file), "file_size": output_file.stat().st_size}
            return {"status": "failed", "error": "Output file too small or missing"}

        except subprocess.TimeoutExpired:
            return {"status": "failed", "error": "Transcoding timed out"}
        except Exception as e:
            return {"status": "failed", "error": str(e)}
