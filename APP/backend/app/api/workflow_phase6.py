import json
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


@router.post("/albums/{album_id}/phases/phase6/execute")
def execute_phase6(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album: raise HTTPException(404, "Album not found")
    orch = Orchestrator(db)
    try: run = orch.start_phase(album, "phase6")
    except ValueError as e: raise HTTPException(400, str(e))

    from ..services.agents.runtime import AgentRuntime
    from ..services.agents.definitions.phase6_promo import PROMO_AGENT
    from ..services.agents.definitions.phase6_artist import ARTIST_STORY_AGENT
    from ..services.agents.definitions.phase6_cover_concept import COVER_CONCEPT_AGENT
    from ..services.agents.definitions.phase6_platform import PLATFORM_CHECK_AGENT

    agents = [
        ("phase6_promo", PROMO_AGENT, {"album_name": album.title or "Untitled", "core_concept": album.theme or ""}),
        ("phase6_artist", ARTIST_STORY_AGENT, {"album_name": album.title or "Untitled", "core_concept": album.theme or ""}),
        ("phase6_cover_concept", COVER_CONCEPT_AGENT, {"album_name": album.title or "Untitled", "core_concept": album.theme or "", "core_paradox": ""}),
        ("phase6_platform", PLATFORM_CHECK_AGENT, {"album_name": album.title or "Untitled", "track_count": album.track_count}),
    ]

    runtime = AgentRuntime()
    results = {}
    for agent_key, agent_def, ctx in agents:
        try:
            expert_run = ExpertRun(phase_run_id=run.id, album_id=album.id, agent_key=agent_key, status="running")
            db.add(expert_run); db.commit()
            output = runtime.run(agent_def, ctx, expert_run)
            expert_run.status = "completed"
            expert_run.output_json = json.dumps(output, ensure_ascii=False)
            db.commit()
            results[agent_key] = {"status": "ok"}
        except Exception as e:
            results[agent_key] = {"status": "error", "error": str(e)}

    orch.complete_phase(run)
    return {"phase_run_id": run.id, "results": results}
