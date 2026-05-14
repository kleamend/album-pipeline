from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.connection import get_db
from ..db.models import AlbumProject, PhaseRun, ExpertRun, Track
from ..core.orchestrator import Orchestrator
from ..schemas import PhaseRunResponse
import json
from ..services.executor import run_track_agents_parallel
from ..services.agents.definitions.phase2_lyrics import LYRICS_AGENT
from ..services.agents.definitions.phase2_arrangement import ARRANGEMENT_AGENT
from ..services.agents.definitions.phase2_rhyme import RHYME_AGENT
from ..services.agents.definitions.phase2_market import MARKET_SONG_AGENT
from ..services.agents.definitions.phase2_scoring import SCORING_AGENT
from ..services.config_manager import load_config

router = APIRouter(tags=["workflow"])


@router.post("/albums/{album_id}/phases/phase2/start")
def start_phase2(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    orch = Orchestrator(db)
    try:
        run = orch.start_phase(album, "phase2")
    except ValueError as e:
        raise HTTPException(400, str(e))

    # Create expert runs for each track × 5 agents (round 1)
    tracks = db.query(Track).filter_by(album_id=album_id).all()
    agent_keys = ["phase2_lyrics", "phase2_arrangement", "phase2_rhyme", "phase2_market", "phase2_scoring"]

    for track in tracks:
        for agent_key in agent_keys:
            db.add(ExpertRun(
                phase_run_id=run.id,
                album_id=album.id,
                track_id=track.id,
                agent_key=agent_key,
                round=1,
                status="pending",
            ))

    db.commit()
    return {"phase_run_id": run.id, "status": "running", "tracks": len(tracks), "experts_per_track": len(agent_keys)}


@router.get("/albums/{album_id}/tracks/{track_id}/rounds")
def get_track_rounds(album_id: str, track_id: str, db: Session = Depends(get_db)):
    track = db.query(Track).filter_by(id=track_id, album_id=album_id).first()
    if not track:
        raise HTTPException(404, "Track not found")

    runs = (
        db.query(ExpertRun)
        .filter_by(track_id=track_id)
        .order_by(ExpertRun.round, ExpertRun.agent_key)
        .all()
    )

    rounds = {}
    for run in runs:
        r = run.round or 1
        if r not in rounds:
            rounds[r] = {"round": r, "agents": {}, "final_score": None}
        rounds[r]["agents"][run.agent_key] = {
            "status": run.status,
            "score": run.score,
            "output_json": run.output_json,
        }

    return {"track_id": track_id, "rounds": list(rounds.values())}


@router.post("/albums/{album_id}/tracks/{track_id}/next-round")
def advance_track_round(album_id: str, track_id: str, db: Session = Depends(get_db)):
    track = db.query(Track).filter_by(id=track_id, album_id=album_id).first()
    if not track:
        raise HTTPException(404, "Track not found")

    # Get the latest round
    latest = (
        db.query(ExpertRun)
        .filter_by(track_id=track_id)
        .order_by(ExpertRun.round.desc())
        .first()
    )
    current_round = (latest.round or 1) if latest else 1

    if current_round >= 6:
        raise HTTPException(400, "Max rounds (6) reached")

    if track.status == "finalized":
        raise HTTPException(400, "Track already finalized")

    next_round = current_round + 1
    phase_run = db.query(PhaseRun).filter_by(album_id=album_id, phase="phase2").first()

    agent_keys = ["phase2_lyrics", "phase2_arrangement", "phase2_rhyme", "phase2_market", "phase2_scoring"]
    for agent_key in agent_keys:
        db.add(ExpertRun(
            phase_run_id=phase_run.id,
            album_id=album_id,
            track_id=track_id,
            agent_key=agent_key,
            round=next_round,
            status="pending",
        ))

    track.status = "round_running"
    db.commit()
    return {"track_id": track_id, "round": next_round, "status": "started"}


PHASE2_AGENTS = {
    "phase2_lyrics": LYRICS_AGENT,
    "phase2_arrangement": ARRANGEMENT_AGENT,
    "phase2_rhyme": RHYME_AGENT,
    "phase2_market": MARKET_SONG_AGENT,
    "phase2_scoring": SCORING_AGENT,
}
PHASE2_AGENT_ORDER = ["phase2_lyrics", "phase2_arrangement", "phase2_rhyme", "phase2_market", "phase2_scoring"]


def _build_phase2_context(track, prev_outputs: dict, agent_key: str) -> dict:
    base = {
        "track_name": track.title or f"T{track.index}",
        "language": track.language,
        "round": 1,
    }
    lyrics_out = prev_outputs.get("phase2_lyrics", {})
    arrangement_out = prev_outputs.get("phase2_arrangement", {})

    if agent_key == "phase2_lyrics":
        base.update({
            "core_hook": track.core_hook or "",
            "core_paradox": "",
            "core_imagery": "",
            "emotional_arc": track.emotional_arc or "",
        })
    elif agent_key == "phase2_arrangement":
        base.update({
            "emotional_arc": track.emotional_arc or "",
            "arrangement_style": track.arrangement_style or "",
            "lyrics_sections": lyrics_out.get("sections", []),
            "estimated_duration": "3:30",
        })
    elif agent_key == "phase2_rhyme":
        base.update({
            "lyrics_sections": lyrics_out.get("sections", []),
            "arrangement_sections": arrangement_out.get("sections", []),
        })
    elif agent_key == "phase2_market":
        base.update({
            "core_hook": track.core_hook or "",
            "album_context": track.narrative_axis or "",
            "lyrics_summary": str(lyrics_out.get("sections", [])[:3]),
            "arrangement_style": track.arrangement_style or "",
        })
    elif agent_key == "phase2_scoring":
        base.update({
            "previous_scores": [],
            "lyrics_summary": str(lyrics_out)[:500],
            "arrangement_summary": str(arrangement_out)[:500],
            "rhyme_summary": "",
            "market_summary": "",
        })
    return base


@router.post("/albums/{album_id}/phases/phase2/execute")
def execute_phase2(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    orch = Orchestrator(db)
    try:
        run = orch.start_phase(album, "phase2")
    except ValueError as e:
        raise HTTPException(400, str(e))

    config = load_config()
    max_workers = config.get("max_workers", 2)

    tracks = (
        db.query(Track)
        .filter_by(album_id=album_id)
        .filter(Track.status != "finalized")
        .all()
    )
    if not tracks:
        raise HTTPException(400, "All tracks already finalized")

    results = run_track_agents_parallel(
        tracks=tracks,
        agent_keys=PHASE2_AGENT_ORDER,
        agent_defs=PHASE2_AGENTS,
        build_context=_build_phase2_context,
        phase_run_id=run.id,
        album_id=album_id,
        max_workers=max_workers,
    )

    remaining = (
        db.query(Track)
        .filter_by(album_id=album_id)
        .filter(Track.status != "finalized")
        .count()
    )
    if remaining == 0:
        orch.complete_phase(run)

    return {
        "phase_run_id": run.id,
        "results": {
            tid: (
                {"status": "completed"}
                if not r["error"]
                else {"status": "failed", "error": r["error"]}
            )
            for tid, r in results.items()
        },
        "tracks_remaining": remaining,
    }
