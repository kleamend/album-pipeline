import subprocess
import shutil


def check_minimax_status() -> dict:
    """Returns dict with cli_installed, cli_authenticated, api_connected."""
    result = {"cli_installed": False, "cli_authenticated": False, "api_connected": False}

    cli_path = shutil.which("mmx") or shutil.which("minimax")
    if not cli_path:
        return result
    result["cli_installed"] = True

    # Check if CLI is authenticated
    try:
        auth = subprocess.run([cli_path, "auth", "status"], capture_output=True, text=True, timeout=10)
        if auth.returncode == 0:
            result["cli_authenticated"] = True
    except Exception:
        pass

    # Check real API connectivity via quota (free read-only call)
    if result["cli_authenticated"]:
        try:
            quota = subprocess.run([cli_path, "quota"], capture_output=True, text=True, timeout=15)
            if quota.returncode == 0:
                result["api_connected"] = True
        except Exception:
            pass

    return result
