import subprocess
import shutil
from pathlib import Path


class MiniMaxImageWorker:
    def __init__(self):
        self.cli = shutil.which("mmx") or shutil.which("minimax")

    def generate(self, prompt_file: Path, output_file: Path, width: int = 2048, height: int = 2048) -> dict:
        if not self.cli:
            return {"status": "failed", "error": "MiniMax CLI not found. Install: npm install -g mmx-cli"}

        if not prompt_file.exists():
            return {"status": "failed", "error": f"Prompt file not found: {prompt_file}"}

        prompt_text = prompt_file.read_text(encoding="utf-8").strip()
        if not prompt_text:
            return {"status": "failed", "error": "Prompt file is empty"}

        output_file.parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            self.cli, "image", "generate",
            "--prompt", prompt_text,
            "--width", str(width),
            "--height", str(height),
            "--out", str(output_file),
        ]

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            if result.returncode == 0 and output_file.exists():
                return {"status": "completed", "output_file": str(output_file), "file_size": output_file.stat().st_size}
            stderr = result.stderr or ""
            error_lines = [l for l in stderr.split("\n") if l.strip()]
            error_msg = error_lines[-1] if error_lines else stderr[:300]
            return {"status": "failed", "error": error_msg}
        except Exception as e:
            return {"status": "failed", "error": str(e)}
