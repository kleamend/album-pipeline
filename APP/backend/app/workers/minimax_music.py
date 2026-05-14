import subprocess
import shutil
from pathlib import Path
from typing import Optional


class MiniMaxMusicWorker:
    """Wraps MiniMax CLI music generation commands."""

    def __init__(self, cli_path: Optional[str] = None):
        self.cli_path = cli_path or shutil.which("minimax") or shutil.which("mmx")
        if not self.cli_path:
            raise RuntimeError("MiniMax CLI not found. Install minimax or mmx.")

    def generate(
        self,
        prompt_file: Path,
        lyrics_file: Optional[Path],
        output_file: Path,
        model: str = "music-2.6",
    ) -> dict:
        """Generate music from prompt and lyrics files."""
        if not prompt_file.exists():
            raise FileNotFoundError(f"Prompt file not found: {prompt_file}")

        output_file.parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            self.cli_path, "music", "generate",
            "--model", model,
            "--prompt-file", str(prompt_file),
            "--output", str(output_file),
        ]
        if lyrics_file and lyrics_file.exists():
            cmd.extend(["--lyrics-file", str(lyrics_file)])

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            if result.returncode != 0:
                return {"status": "failed", "error": result.stderr, "output_file": str(output_file)}

            if output_file.exists() and output_file.stat().st_size > 100_000:
                return {
                    "status": "completed",
                    "output_file": str(output_file),
                    "file_size": output_file.stat().st_size,
                    "duration": None,
                }
            return {"status": "failed", "error": "Output file missing or too small", "output_file": str(output_file)}

        except subprocess.TimeoutExpired:
            return {"status": "failed", "error": "Generation timed out (300s)", "output_file": str(output_file)}
        except Exception as e:
            return {"status": "failed", "error": str(e), "output_file": str(output_file)}

    def is_available(self) -> bool:
        try:
            result = subprocess.run([self.cli_path, "--version"], capture_output=True, text=True, timeout=10)
            return result.returncode == 0
        except Exception:
            return False
