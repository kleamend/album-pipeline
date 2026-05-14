"""ThreadPool-based parallel agent executor for Phase 2."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from ..db.connection import SessionLocal
from ..db.models import ExpertRun, Track


def run_track_agents_parallel(
    tracks: list,
    agent_keys: list[str],
    agent_defs: dict,
    build_context,
    phase_run_id: str,
    album_id: str,
    max_workers: int = 2,
) -> dict:
    """Execute agents for each track in parallel.

    Each track runs its agents serially (they depend on each other's output).
    Different tracks run in parallel via ThreadPoolExecutor.

    Returns: {track_id: {"outputs": {agent_key: output_dict}, "error": str|None}}
    """
    results = {}

    def execute_track(track) -> tuple:
        from .agents.runtime import AgentRuntime
        runtime = AgentRuntime()
        db = SessionLocal()
        track_outputs = {}
        error = None

        try:
            for agent_key in agent_keys:
                agent_def = agent_defs[agent_key]
                ctx = build_context(track, track_outputs, agent_key)

                expert_run = ExpertRun(
                    phase_run_id=phase_run_id,
                    album_id=album_id,
                    track_id=track.id,
                    agent_key=agent_key,
                    status="running",
                )
                db.add(expert_run)
                db.commit()

                try:
                    output = runtime.run(agent_def, ctx, expert_run)
                    track_outputs[agent_key] = output
                    expert_run.status = "completed"
                except Exception as e:
                    expert_run.status = "failed"
                    expert_run.error_message = str(e)
                    error = str(e)
                    break
                finally:
                    db.commit()

            # Update track status based on scoring
            scoring_output = track_outputs.get("phase2_scoring")
            if scoring_output and scoring_output.get("total", 0) >= 80:
                round_count = (
                    db.query(ExpertRun)
                    .filter_by(track_id=track.id, agent_key="phase2_scoring")
                    .count()
                )
                if round_count >= 3:
                    track.status = "finalized"
                else:
                    track.status = "needs_revision"
            elif error is None and "phase2_scoring" in track_outputs:
                track.status = "needs_revision"
            db.commit()

            return (track.id, track_outputs, error)

        except Exception as e:
            return (track.id, {}, str(e))
        finally:
            db.close()

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(execute_track, t): t for t in tracks}
        for future in as_completed(futures):
            track_id, outputs, err = future.result()
            results[track_id] = {"outputs": outputs, "error": err}

    return results
