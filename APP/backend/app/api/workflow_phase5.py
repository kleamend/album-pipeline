import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.connection import get_db
from ..db.models import AlbumProject, PhaseRun, ExpertRun, Track
from ..core.orchestrator import Orchestrator

router = APIRouter(tags=["workflow"])


@router.post("/albums/{album_id}/phases/phase5/start")
def start_phase5(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    orch = Orchestrator(db)
    try:
        run = orch.start_phase(album, "phase5")
    except ValueError as e:
        raise HTTPException(400, str(e))

    db.commit()
    return {"phase_run_id": run.id, "status": "running"}


@router.get("/albums/{album_id}/takes")
def list_takes(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    tracks = db.query(Track).filter_by(album_id=album_id).order_by(Track.index).all()
    takes = []
    for t in tracks:
        takes.append({
            "track_id": t.id,
            "index": t.index,
            "title": t.title,
            "versions": [
                {"id": f"{t.id}-p1", "version": "p1", "strategy": "编曲忠实型", "selected": False},
                {"id": f"{t.id}-p2", "version": "p2", "strategy": "情绪叙事型", "selected": False},
                {"id": f"{t.id}-p3", "version": "p3", "strategy": "听感质感型", "selected": False},
            ],
        })
    return {"album_id": album_id, "tracks": takes}


@router.post("/albums/{album_id}/takes/select")
def select_take(album_id: str, track_id: str, version: str, db: Session = Depends(get_db)):
    track = db.query(Track).filter_by(id=track_id, album_id=album_id).first()
    if not track:
        raise HTTPException(404, "Track not found")

    if version not in ("p1", "p2", "p3"):
        raise HTTPException(400, "Version must be p1, p2, or p3")

    track.status = "take_selected"
    db.commit()
    return {"track_id": track_id, "selected_version": version, "status": "selected"}


@router.post("/albums/{album_id}/phases/phase5/transcode")
def transcode_selected_takes(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album: raise HTTPException(404, "Album not found")
    orch = Orchestrator(db)
    try: run = orch.start_phase(album, "phase5")
    except ValueError as e: raise HTTPException(400, str(e))

    from ..workers.audio_transcode import AudioTranscodeWorker
    from ..workers.audio_verify import AudioVerifyWorker
    tracks = db.query(Track).filter_by(album_id=album_id, status="take_selected").all()
    if not tracks:
        raise HTTPException(400, "No takes selected. Select takes first via /takes/select")

    transcoder = AudioTranscodeWorker()
    verifier = AudioVerifyWorker()
    results = []
    for track in tracks:
        lang = "cn" if track.language in ("chinese", "bilingual") else "en"
        src_dir = Path(album.workspace_path) / "generate" / lang
        out_dir = Path(album.workspace_path) / "generate" / f"{lang}_320k"
        src_files = sorted(src_dir.glob(f"T{track.index}-*.mp3"))
        if not src_files: continue
        src = src_files[0]
        out = out_dir / f"T{track.index}-{track.title}.mp3"
        r = transcoder.transcode(src, out)
        if r["status"] == "completed":
            v = verifier.verify(out)
            results.append({"track_id": track.id, "transcode": "ok", "verify": v["status"]})
            track.status = "transcoded"
        else:
            results.append({"track_id": track.id, "transcode": "failed", "error": r.get("error")})
    db.commit()
    orch.complete_phase(run)
    return {"phase_run_id": run.id, "results": results}
