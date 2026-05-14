import subprocess
import shutil


def check_minimax_status() -> str:
    """Returns: ready | cli_missing | api_key_missing | not_configured | error"""
    minimax_path = shutil.which("minimax")
    mmx_path = shutil.which("mmx")

    if not minimax_path and not mmx_path:
        return "cli_missing"

    cli = minimax_path or mmx_path
    try:
        result = subprocess.run([cli, "--version"], capture_output=True, text=True, timeout=10)
        if result.returncode != 0:
            return "not_configured"
        return "ready"
    except Exception:
        return "error"
