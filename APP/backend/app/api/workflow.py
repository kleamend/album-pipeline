import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.connection import get_db
from ..db.models import AlbumProject, PhaseRun, ExpertRun, Track
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


@router.post("/albums/{album_id}/phases/phase1/execute")
def execute_phase1(album_id: str, db: Session = Depends(get_db)):
    """Actually run Phase 1 agents via LLM and return results."""
    from ..services.agents.runtime import AgentRuntime
    from ..services.agents.definitions.phase1_creative import CREATIVE_DIRECTOR_AGENT
    from ..services.agents.definitions.phase1_market import MARKET_EXPERT_AGENT
    from ..services.agents.definitions.phase1_music import MUSIC_DIRECTOR_AGENT
    from ..services.agents.definitions.phase1_reviewer import REVIEWER_AGENT

    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    # Start Phase 1
    orch = Orchestrator(db)
    try:
        run = orch.start_phase(album, "phase1")
    except ValueError as e:
        raise HTTPException(400, str(e))

    runtime = AgentRuntime()

    # Common input context for all agents
    base_context = {
        "theme": album.theme or "",
        "notes": album.notes or "",
        "track_count": album.track_count,
        "language": album.language_mode,
        "reference_style": album.reference_style or "",
        "target_audience": album.target_audience or "",
    }

    results = {}
    errors = []

    # Run 3 parallel agents
    for agent_def, key in [
        (CREATIVE_DIRECTOR_AGENT, "creative"),
        (MARKET_EXPERT_AGENT, "market"),
        (MUSIC_DIRECTOR_AGENT, "music"),
    ]:
        try:
            expert_run = ExpertRun(
                phase_run_id=run.id, album_id=album.id,
                agent_key=agent_def["key"], status="running"
            )
            db.add(expert_run)
            db.commit()

            # Build agent-specific context
            if key == "market":
                ctx = {**base_context, "tracks": results.get("creative", {}).get("tracks", [])}
            elif key == "music":
                ctx = {**base_context, "tracks": results.get("creative", {}).get("tracks", [])}
            else:
                ctx = base_context

            output = runtime.run(agent_def, ctx, expert_run)
            results[key] = output
            expert_run.status = "completed"
            expert_run.output_json = json.dumps(output, ensure_ascii=False)
            db.commit()
        except Exception as e:
            errors.append(f"{key}: {str(e)}")

    # Run reviewer with all previous outputs
    reviewer_output = None
    if "creative" in results:
        try:
            reviewer_ctx = {
                "core_concept": results["creative"].get("core_concept", ""),
                "core_paradox": results["creative"].get("core_paradox", ""),
                "narrative_axes": results["creative"].get("narrative_axes", []),
                "tracks": results["creative"].get("tracks", []),
                "album_name_cn": results["creative"].get("album_name_cn", ""),
            }
            if "market" in results:
                reviewer_ctx["market_positioning"] = results["market"].get("market_positioning", "")
                reviewer_ctx["core_communication_concept"] = results["market"].get("core_communication_concept", "")
            if "music" in results:
                reviewer_ctx["primary_tonal"] = results["music"].get("primary_tonal", "")
                reviewer_ctx["tonal_logic"] = results["music"].get("tonal_logic", "")

            expert_run = ExpertRun(
                phase_run_id=run.id, album_id=album.id,
                agent_key=REVIEWER_AGENT["key"], status="running"
            )
            db.add(expert_run)
            db.commit()

            reviewer_output = runtime.run(REVIEWER_AGENT, reviewer_ctx, expert_run)
            expert_run.status = "completed"
            expert_run.output_json = json.dumps(reviewer_output, ensure_ascii=False)
            db.commit()
        except Exception as e:
            errors.append(f"reviewer: {str(e)}")

    # Sync Phase 1 results to album and track fields
    creative = results.get("creative", {})
    if creative:
        if creative.get("album_name_cn"):
            album.title = creative["album_name_cn"]
        if creative.get("album_name_en"):
            album.title_en = creative["album_name_en"]

        # Update track names and metadata from creative output
        for t_data in creative.get("tracks", []):
            idx = t_data.get("index")
            track = db.query(Track).filter_by(album_id=album.id, index=idx).first()
            if track:
                if t_data.get("name"):
                    track.title = t_data["name"]
                if t_data.get("english_name"):
                    track.title_en = t_data["english_name"]
                if t_data.get("core_hook"):
                    track.core_hook = t_data["core_hook"]
                if t_data.get("emotional_arc"):
                    track.emotional_arc = t_data["emotional_arc"]
                if t_data.get("arrangement_style"):
                    track.arrangement_style = t_data["arrangement_style"]
                if t_data.get("direction"):
                    track.narrative_axis = t_data["direction"]
        db.commit()

    # Write album-overview.md to workspace
    try:
        from ..renderers.album_overview import render_album_overview
        market = results.get("market", {})
        music = results.get("music", {})
        md_content = render_album_overview(creative, market, music, reviewer_output or {}, round_num=1)
        overview_path = Path(album.workspace_path) / "docs" / "album-overview.md"
        overview_path.parent.mkdir(parents=True, exist_ok=True)
        overview_path.write_text(md_content, encoding="utf-8")
    except Exception:
        pass  # Don't fail the whole request if file writing fails

    orch.complete_phase(run)

    return {
        "phase_run_id": run.id,
        "results": results,
        "review": reviewer_output,
        "errors": errors,
    }


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
