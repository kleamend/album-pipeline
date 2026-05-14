import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.connection import get_db
from ..db.models import AlbumProject, PhaseRun, Track, ExpertRun
from ..core.orchestrator import Orchestrator
from ..services.agents.runtime import AgentRuntime
from ..services.agents.definitions.phase3_formatter import FORMATTER_AGENT

router = APIRouter(tags=["workflow"])


@router.post("/albums/{album_id}/phases/phase3/start")
def start_phase3(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    orch = Orchestrator(db)
    try:
        run = orch.start_phase(album, "phase3")
    except ValueError as e:
        raise HTTPException(400, str(e))

    orch.complete_phase(run)
    return {"phase_run_id": run.id, "status": "completed", "message": "Lyrics extraction completed automatically"}


@router.post("/albums/{album_id}/phases/phase3/execute")
def execute_phase3(album_id: str, db: Session = Depends(get_db)):
    """Actually run Phase 3 lyrics extraction via Agent Runtime."""
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    orch = Orchestrator(db)
    try:
        run = orch.start_phase(album, "phase3")
    except ValueError as e:
        raise HTTPException(400, str(e))

    tracks = db.query(Track).filter_by(album_id=album_id).order_by(Track.index).all()
    runtime = AgentRuntime()
    results = []
    errors = []

    for track in tracks:
        try:
            # Get lyrics from Phase 2 scoring output
            scoring_runs = (
                db.query(ExpertRun)
                .filter_by(track_id=track.id, agent_key="phase2_scoring", status="completed")
                .order_by(ExpertRun.round.desc())
                .all()
            )

            ctx = {
                "track_name": track.title or f"T{track.index}",
                "language": track.language,
                "lyrics_text": "",
            }

            # Try to get lyrics from Phase 2 output
            lyrics_run = (
                db.query(ExpertRun)
                .filter_by(track_id=track.id, agent_key="phase2_lyrics", status="completed")
                .order_by(ExpertRun.round.desc())
                .first()
            )
            if lyrics_run and lyrics_run.output_json:
                try:
                    lyrics_data = json.loads(lyrics_run.output_json)
                    ctx["lyrics_text"] = json.dumps(lyrics_data.get("sections", []), ensure_ascii=False)
                except Exception:
                    pass

            expert_run = ExpertRun(
                phase_run_id=run.id, album_id=album.id, track_id=track.id,
                agent_key="phase3_formatter", status="running"
            )
            db.add(expert_run)
            db.commit()

            output = runtime.run(FORMATTER_AGENT, ctx, expert_run)

            # Write lyrics file
            lang_dir = "cn" if track.language in ("chinese", "bilingual") else "en"
            lyrics_dir = Path(album.workspace_path) / "generate" / "lyrics" / lang_dir
            lyrics_dir.mkdir(parents=True, exist_ok=True)
            lyrics_path = lyrics_dir / f"T{track.index}-{track.title}.txt"
            lyrics_path.write_text("\n".join(output.get("lyrics_lines", [])), encoding="utf-8")

            expert_run.status = "completed"
            expert_run.output_json = json.dumps(output, ensure_ascii=False)
            db.commit()
            results.append({"track_id": track.id, "status": "ok", "char_count": output.get("char_count", 0)})

        except Exception as e:
            errors.append(f"T{track.index}: {str(e)}")
            results.append({"track_id": track.id, "status": "error", "error": str(e)})

    orch.complete_phase(run)
    return {
        "phase_run_id": run.id,
        "results": results,
        "errors": errors,
    }
