import subprocess
import shutil
from pathlib import Path
from typing import Optional


class MiniMaxMusicWorker:
    """Wraps MiniMax CLI (mmx) music generation commands."""

    def __init__(self, cli_path: Optional[str] = None, api_key: Optional[str] = None):
        self.cli_path = cli_path or shutil.which("mmx") or shutil.which("minimax")
        if not self.cli_path:
            raise RuntimeError("MiniMax CLI not found. Install: npm install -g mmx-cli")
        self._api_key = api_key

    def _ensure_auth(self) -> bool:
        """Ensure CLI is authenticated. Returns True if ready."""
        # Check current auth status
        result = subprocess.run(
            [self.cli_path, "auth", "status"], capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            return True

        # Try to login if we have an API key
        if self._api_key:
            login = subprocess.run(
                [self.cli_path, "auth", "login", "--api-key", self._api_key],
                capture_output=True, text=True, timeout=30,
            )
            if login.returncode == 0:
                return True

        return False

    def generate(
        self,
        prompt_file: Path,
        lyrics_file: Optional[Path],
        output_file: Path,
        model: str = "music-2.6",
    ) -> dict:
        """Generate music from prompt and lyrics using mmx CLI."""
        if not prompt_file.exists():
            raise FileNotFoundError(f"Prompt file not found: {prompt_file}")

        if not self._ensure_auth():
            return {
                "status": "failed",
                "error": "MiniMax CLI not authenticated. Run 'mmx auth login --api-key sk-xxx' or configure API key in settings.",
                "output_file": str(output_file),
            }

        # Read prompt from file (CLI only accepts inline --prompt, not --prompt-file)
        prompt_text = prompt_file.read_text(encoding="utf-8").strip()
        if not prompt_text:
            return {"status": "failed", "error": "Prompt file is empty", "output_file": str(output_file)}

        output_file.parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            self.cli_path, "music", "generate",
            "--prompt", prompt_text,
            "--out", str(output_file),
        ]

        if model:
            cmd.extend(["--model", model])

        if lyrics_file and lyrics_file.exists():
            cmd.extend(["--lyrics-file", str(lyrics_file)])

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

            if result.returncode != 0:
                stderr = result.stderr or ""
                # Extract the most relevant error line
                error_lines = [l for l in stderr.split("\n") if l.strip()]
                error_msg = error_lines[-1] if error_lines else stderr[:300]
                return {"status": "failed", "error": error_msg, "output_file": str(output_file)}

            if output_file.exists() and output_file.stat().st_size > 50_000:
                return {
                    "status": "completed",
                    "output_file": str(output_file),
                    "file_size": output_file.stat().st_size,
                }

            return {"status": "failed", "error": "Output file missing or too small (< 50KB)", "output_file": str(output_file)}

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
