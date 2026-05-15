"""Persistent configuration storage for API keys and app settings."""
import json
import os
from pathlib import Path
from ..config import WORKSPACE_ROOT

CONFIG_FILE = WORKSPACE_ROOT / "config.json"

DEFAULT_CONFIG = {
    "minimax_api_key": "",
    "llm_api_key": "",
    "llm_base_url": "https://api.minimaxi.com/v1",
    "llm_model": "gpt-4o",
    "music_model": "music-2.6",
    "max_workers": 2,
}


def load_config() -> dict:
    """Load config from file, falling back to env vars and defaults."""
    config = dict(DEFAULT_CONFIG)

    # Load from file
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE) as f:
                file_config = json.load(f)
            config.update(file_config)
        except Exception:
            pass

    # Env vars override file
    if os.getenv("MINIMAX_API_KEY"):
        config["minimax_api_key"] = os.getenv("MINIMAX_API_KEY")
    if os.getenv("LLM_API_KEY"):
        config["llm_api_key"] = os.getenv("LLM_API_KEY")
    if os.getenv("LLM_BASE_URL"):
        config["llm_base_url"] = os.getenv("LLM_BASE_URL")
    if os.getenv("LLM_MODEL"):
        config["llm_model"] = os.getenv("LLM_MODEL")

    return config


def save_config(updates: dict) -> dict:
    """Save config updates and return full config. Masks API keys in response."""
    config = load_config()
    config.update(updates)

    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)

    # Return config with masked keys
    response = dict(config)
    if response.get("minimax_api_key"):
        key = response["minimax_api_key"]
        response["minimax_api_key"] = key[:5] + "*" * (len(key) - 9) + key[-4:] if len(key) > 10 else "***"
    if response.get("llm_api_key"):
        key = response["llm_api_key"]
        response["llm_api_key"] = key[:5] + "*" * (len(key) - 9) + key[-4:] if len(key) > 10 else "***"
    return response


def get_api_key(provider: str = "minimax") -> str:
    """Get the actual API key for a provider (unmasked, for internal use)."""
    config = load_config()
    if provider == "llm":
        return config.get("llm_api_key", "")
    return config.get("minimax_api_key", "")
