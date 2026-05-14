from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.connection import get_db
from ..db.models import AlbumProject, PhaseRun, ExpertRun, Track
from ..core.orchestrator import Orchestrator

router = APIRouter(tags=["workflow"])


@router.post("/albums/{album_id}/phases/phase6/start")
def start_phase6(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    orch = Orchestrator(db)
    try:
        run = orch.start_phase(album, "phase6")
    except ValueError as e:
        raise HTTPException(400, str(e))

    agent_keys = [
        "phase6_promo", "phase6_artist", "phase6_cover_concept",
        "phase6_cover_prompt", "phase6_platform",
    ]
    for agent_key in agent_keys:
        db.add(ExpertRun(phase_run_id=run.id, album_id=album.id, agent_key=agent_key, status="pending"))

    db.commit()
    return {"phase_run_id": run.id, "status": "running", "agents": len(agent_keys)}


@router.get("/albums/{album_id}/deliverables")
def list_deliverables(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    return {
        "album_id": album_id,
        "deliverables": [
            {"file": "docs/album-overview.md", "status": "done"},
            {"file": "docs/promotional-materials.md", "status": "pending"},
            {"file": "docs/artist-story-cn.md", "status": "pending"},
            {"file": "docs/artist-story-en.md", "status": "pending"},
            {"file": "docs/cover-concept.md", "status": "pending"},
            {"file": "docs/platform-check.txt", "status": "pending"},
            {"file": "docs/promo-video.mp4", "status": "pending"},
            {"file": "generate/covers/album-cover-p1.png", "status": "pending"},
        ],
    }


@router.post("/albums/{album_id}/package")
def package_album(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    from ..workers.packager import PackagerWorker
    worker = PackagerWorker()
    result = worker.package(Path(album.workspace_path), album.slug)

    if result["status"] == "failed":
        raise HTTPException(500, result["error"])

    return {"status": "packaged", "output_file": result["output_file"], "file_size": result["file_size"]}
