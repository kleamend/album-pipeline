from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.connection import get_db
from ..db.models import AlbumProject, PhaseRun, ExpertRun
from ..core.orchestrator import Orchestrator
from ..schemas import ConceptConfirmInput, PhaseRunResponse

router = APIRouter(tags=["workflow"])


@router.get("/albums/{album_id}/phases", response_model=list[PhaseRunResponse])
def list_phases(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")
    return db.query(PhaseRun).filter_by(album_id=album_id).order_by(PhaseRun.phase).all()


@router.post("/albums/{album_id}/phases/phase1/start")
def start_phase1(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    orch = Orchestrator(db)
    run = orch.start_phase(album, "phase1")

    # Create expert runs for the 3 parallel agents + 1 reviewer
    for agent_key in ["phase1_creative", "phase1_market", "phase1_music", "phase1_reviewer"]:
        db.add(ExpertRun(phase_run_id=run.id, album_id=album.id, agent_key=agent_key, status="pending"))

    db.commit()
    return {"phase_run_id": run.id, "status": "running"}


@router.post("/albums/{album_id}/decisions/concept")
def decide_concept(album_id: str, input: ConceptConfirmInput, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    phase_run = db.query(PhaseRun).filter_by(album_id=album_id, phase="phase1").first()
    if not phase_run:
        raise HTTPException(400, "No Phase 1 run found")

    orch = Orchestrator(db)

    if input.approved:
        orch.complete_phase(phase_run)
        return {"status": "concept_confirmed", "next": "phase2"}
    else:
        # Re-open Phase 1 for revision
        phase_run.status = "running"
        album.status = "concept_running"
        db.commit()
        return {"status": "concept_rejected", "next": "phase1_revision"}
