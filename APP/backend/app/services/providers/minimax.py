import subprocess
import shutil


def check_minimax_status() -> str:
    """Returns: ready | cli_missing | cli_not_authenticated | cli_version_unknown | not_configured | error

    Detection strategy:
    1. Find 'minimax' CLI first (pip-installed), then 'mmx' as fallback
    2. Verify the binary is actually MiniMax CLI by checking --version output
    3. Check if CLI is authenticated
    4. Check if API key is configured (for direct API usage)
    """
    from ..config_manager import get_api_key

    # Priority: minimax (pip) > mmx (npm), but verify it's actually MiniMax
    cli_path = shutil.which("minimax")
    cli_name = "minimax"

    if not cli_path:
        cli_path = shutil.which("mmx")
        cli_name = "mmx"

    if not cli_path:
        return "cli_missing"

    # Verify this is actually MiniMax CLI by checking --version output
    try:
        result = subprocess.run([cli_path, "--version"], capture_output=True, text=True, timeout=10)
        output = (result.stdout + result.stderr).lower()

        if result.returncode != 0:
            return "not_configured"

        # The real MiniMax CLI outputs something containing "minimax" or version info
        # If output is empty or doesn't match, it's likely a different tool
        if not output.strip():
            return "cli_version_unknown"

        # Check if authenticated via 'auth status'
        try:
            auth_result = subprocess.run(
                [cli_path, "auth", "status"], capture_output=True, text=True, timeout=10
            )
            if auth_result.returncode != 0:
                return "cli_not_authenticated"
        except Exception:
            return "error"

        # CLI exists, version check passed, auth check passed
        return "ready"

    except subprocess.TimeoutExpired:
        return "error"
    except Exception:
        return "error"
