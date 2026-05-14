import subprocess
import shutil
from pathlib import Path


class MiniMaxVideoWorker:
    def __init__(self):
        self.cli = shutil.which("mmx") or shutil.which("minimax")

    def generate(self, prompt: str, output_file: Path, first_frame: Path | None = None, model: str = "MiniMax-Hailuo-2.3") -> dict:
        if not self.cli:
            return {"status": "failed", "error": "MiniMax CLI not found. Install: npm install -g mmx-cli"}

        output_file.parent.mkdir(parents=True, exist_ok=True)
        cmd = [self.cli, "video", "generate", "--model", model, "--prompt", prompt, "--download", str(output_file)]
        if first_frame and first_frame.exists():
            cmd.extend(["--first-frame", str(first_frame)])

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            if result.returncode == 0 and output_file.exists():
                return {"status": "completed", "output_file": str(output_file), "file_size": output_file.stat().st_size}
            stderr = result.stderr or ""
            error_lines = [l for l in stderr.split("\n") if l.strip()]
            error_msg = error_lines[-1] if error_lines else stderr[:300]
            return {"status": "failed", "error": error_msg}
        except Exception as e:
            return {"status": "failed", "error": str(e)}
