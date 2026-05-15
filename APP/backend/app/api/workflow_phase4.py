import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

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


@router.post("/albums/{album_id}/phases/phase4/generate-prompts")
def generate_prompts(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album: raise HTTPException(404, "Album not found")
    orch = Orchestrator(db)
    try: run = orch.start_phase(album, "phase4")
    except ValueError as e: raise HTTPException(400, str(e))

    from ..services.agents.runtime import AgentRuntime
    from ..services.agents.definitions.phase4_prompt_gen import PROMPT_GENERATOR_AGENT
    runtime = AgentRuntime()
    tracks = db.query(Track).filter_by(album_id=album_id).order_by(Track.index).all()
    results = []

    for track in tracks:
        ctx = {"track_name": track.title or f"T{track.index}",
               "arrangement_design": track.arrangement_style or "",
               "style": track.arrangement_style or "pop",
               "bpm": 120, "key": "C"}
        try:
            expert_run = ExpertRun(phase_run_id=run.id, album_id=album.id, track_id=track.id,
                                   agent_key="phase4_prompt_gen", status="running")
            db.add(expert_run); db.commit()
            output = runtime.run(PROMPT_GENERATOR_AGENT, ctx, expert_run)
            expert_run.status = "completed"
            expert_run.output_json = json.dumps(output, ensure_ascii=False)
            db.commit()
            # Write prompt files
            prompts = output.get("prompts", [])
            for p in prompts:
                v = p.get("version", "p1")
                prompt_path = Path(album.workspace_path) / "generate" / "prompts" / f"T{track.index}-{track.title}-{v}.txt"
                prompt_path.parent.mkdir(parents=True, exist_ok=True)
                prompt_path.write_text(p.get("content", ""), encoding="utf-8")
            results.append({"track_id": track.id, "status": "ok", "prompts": len(prompts)})
        except Exception as e:
            results.append({"track_id": track.id, "status": "error", "error": str(e)})
    return {"phase_run_id": run.id, "results": results}


@router.post("/albums/{album_id}/phases/phase4/review-prompts")
def review_prompts(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album: raise HTTPException(404, "Album not found")
    from ..services.agents.runtime import AgentRuntime
    from ..services.agents.definitions.phase4_prompt_review import PROMPT_REVIEWER_AGENT
    runtime = AgentRuntime()
    tracks = db.query(Track).filter_by(album_id=album_id).order_by(Track.index).all()
    all_results = []
    for track in tracks:
        prompt_runs = db.query(ExpertRun).filter_by(track_id=track.id, agent_key="phase4_prompt_gen", status="completed").all()
        prompts_data = []
        for pr in prompt_runs:
            if pr.output_json:
                try: prompts_data.append(json.loads(pr.output_json))
                except: pass
        if not prompts_data: continue
        ctx = {"track_name": track.title or f"T{track.index}", "prompts": prompts_data}
        try:
            expert_run = ExpertRun(phase_run_id=prompt_runs[0].phase_run_id, album_id=album.id, track_id=track.id,
                                   agent_key="phase4_prompt_review", status="running")
            db.add(expert_run); db.commit()
            output = runtime.run(PROMPT_REVIEWER_AGENT, ctx, expert_run)
            expert_run.status = "completed"
            expert_run.output_json = json.dumps(output, ensure_ascii=False)
            db.commit()
            all_results.append({"track_id": track.id, "review": output})
        except Exception as e:
            all_results.append({"track_id": track.id, "error": str(e)})
    return {"album_id": album_id, "results": all_results}


@router.post("/albums/{album_id}/phases/phase4/generate-music")
def generate_music(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album: raise HTTPException(404, "Album not found")
    from ..workers.minimax_music import MiniMaxMusicWorker
    from ..services.config_manager import load_config
    config = load_config()
    max_workers = config.get("max_workers", 2)
    tracks = db.query(Track).filter_by(album_id=album_id).order_by(Track.index).all()
    results = []

    def generate_track(track):
        prompt_dir = Path(album.workspace_path) / "generate" / "prompts"
        track_files = sorted(prompt_dir.glob(f"T{track.index}-*.txt"))
        track_results = []
        for pf in track_files[:3]:
            worker = MiniMaxMusicWorker(api_key=config.get("minimax_api_key") or config.get("llm_api_key"))
            out_file = Path(album.workspace_path) / "generate" / "cn" / f"T{track.index}-{track.title}-{pf.stem.split('-')[-1]}.mp3"
            try:
                lyrics_file = None
                lyrics_dir = Path(album.workspace_path) / "generate" / "lyrics" / "cn"
                lf = lyrics_dir / f"T{track.index}-{track.title}.txt"
                if lf.exists(): lyrics_file = lf
                r = worker.generate(pf, lyrics_file, out_file, model=config.get("music_model", "music-2.6"))
                track_results.append({"file": str(out_file), "status": r["status"]})
            except Exception as e:
                track_results.append({"file": str(out_file), "status": "error", "error": str(e)})
        return (track.id, track_results)

    with ThreadPoolExecutor(max_workers=min(max_workers, len(tracks))) as executor:
        futures = {executor.submit(generate_track, t): t for t in tracks}
        for future in as_completed(futures):
            tid, tr = future.result()
            results.append({"track_id": tid, "results": tr})

    # Complete phase
    phase_run = db.query(PhaseRun).filter_by(album_id=album_id, phase="phase4", status="running").first()
    if phase_run:
        orch = Orchestrator(db)
        orch.complete_phase(phase_run)
    return {"album_id": album_id, "results": results}
