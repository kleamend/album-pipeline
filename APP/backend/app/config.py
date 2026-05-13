import os
from pathlib import Path

WORKSPACE_ROOT = Path(os.getenv("ALBUM_WORKSPACE", Path(__file__).parent.parent / "workspace"))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{WORKSPACE_ROOT}/album_pipeline.db")
