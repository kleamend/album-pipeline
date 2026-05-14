import subprocess
import shutil
from pathlib import Path


class MiniMaxImageWorker:
    def __init__(self):
        self.cli = shutil.which("minimax") or shutil.which("mmx")

    def generate(self, prompt_file: Path, output_file: Path, width: int = 2048, height: int = 2048) -> dict:
        if not self.cli:
            return {"status": "failed", "error": "MiniMax CLI not found"}

        output_file.parent.mkdir(parents=True, exist_ok=True)
        try:
            result = subprocess.run(
                [self.cli, "image", "generate", "--prompt-file", str(prompt_file),
                 "--width", str(width), "--height", str(height), "--output", str(output_file)],
                capture_output=True, text=True, timeout=120,
            )
            if result.returncode == 0 and output_file.exists():
                return {"status": "completed", "output_file": str(output_file), "file_size": output_file.stat().st_size}
            return {"status": "failed", "error": result.stderr[:500]}
        except Exception as e:
            return {"status": "failed", "error": str(e)}
