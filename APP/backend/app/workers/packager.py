import zipfile
from pathlib import Path


class PackagerWorker:
    """Creates zip archives of all album deliverables."""

    def package(self, workspace: Path, output_name: str) -> dict:
        if not workspace.exists():
            return {"status": "failed", "error": f"Workspace not found: {workspace}"}

        output_file = workspace.parent / f"{output_name}-promo-materials.zip"

        try:
            with zipfile.ZipFile(output_file, "w", zipfile.ZIP_DEFLATED) as zf:
                for fp in workspace.rglob("*"):
                    if fp.is_file() and "__pycache__" not in str(fp) and ".db" not in str(fp):
                        zf.write(fp, fp.relative_to(workspace))

            return {
                "status": "completed",
                "output_file": str(output_file),
                "file_size": output_file.stat().st_size,
            }
        except Exception as e:
            return {"status": "failed", "error": str(e)}
