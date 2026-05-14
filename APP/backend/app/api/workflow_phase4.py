from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.connection import get_db
from ..db.models import AlbumProject, PhaseRun, ExpertRun, Track
from ..core.orchestrator import Orchestrator

router = APIRouter(tags=["workflow"])


@router.post("/albums/{album_id}/phases/phase4/start")
def start_phase4(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    orch = Orchestrator(db)
    try:
        run = orch.start_phase(album, "phase4")
    except ValueError as e:
        raise HTTPException(400, str(e))

    tracks = db.query(Track).filter_by(album_id=album_id).all()
    for track in tracks:
        for agent_key in ["phase4_prompt_gen", "phase4_prompt_review"]:
            db.add(ExpertRun(phase_run_id=run.id, album_id=album.id, track_id=track.id, agent_key=agent_key, status="pending"))

    db.commit()
    return {"phase_run_id": run.id, "status": "running", "tracks": len(tracks), "prompts_per_track": 3}


@router.get("/albums/{album_id}/generation-queue")
def get_generation_queue(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    tracks = db.query(Track).filter_by(album_id=album_id).order_by(Track.index).all()
    queue = []
    for t in tracks:
        queue.append({
            "track_id": t.id,
            "index": t.index,
            "title": t.title,
            "prompts": [
                {"version": "p1", "strategy": "编曲忠实型", "status": "pending"},
                {"version": "p2", "strategy": "情绪叙事型", "status": "pending"},
                {"version": "p3", "strategy": "听感质感型", "status": "pending"},
            ],
        })
    return {"album_id": album_id, "tracks": queue}
