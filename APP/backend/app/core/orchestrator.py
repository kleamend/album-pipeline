from typing import Optional
from sqlalchemy.orm import Session
from ..db.models import AlbumProject, PhaseRun, Track
from ..core.state_machine import create_project_machine, can_transition


class Orchestrator:
    """Central workflow orchestrator. Validates state transitions and manages phase execution."""

    def __init__(self, db: Session):
        self.db = db

    def can_start_phase(self, album: AlbumProject, phase: str) -> tuple[bool, Optional[str]]:
        """Check if a phase can be started. Returns (allowed, reason)."""
        # Phase 1 requires draft state
        if phase == "phase1":
            if not can_transition(album.status, "start_concept"):
                return False, f"Cannot start Phase 1 from status '{album.status}'"
            return True, None

        # Phase 2 requires phase1 completed
        if phase == "phase2":
            prev = self.db.query(PhaseRun).filter_by(album_id=album.id, phase="phase1").first()
            if not prev or prev.status != "completed":
                return False, "Phase 1 not completed"
            return True, None

        # Phase 3 requires phase2 completed + all tracks finalized
        if phase == "phase3":
            prev = self.db.query(PhaseRun).filter_by(album_id=album.id, phase="phase2").first()
            if not prev or prev.status != "completed":
                return False, "Phase 2 not completed"
            tracks = self.db.query(Track).filter_by(album_id=album.id).all()
            unfinalized = [t for t in tracks if t.status != "finalized"]
            if unfinalized:
                return False, f"{len(unfinalized)} tracks not finalized"
            return True, None

        # Phase 4 requires phase3 completed
        if phase == "phase4":
            prev = self.db.query(PhaseRun).filter_by(album_id=album.id, phase="phase3").first()
            if not prev or prev.status != "completed":
                return False, "Phase 3 not completed"
            return True, None

        # Phase 5 requires phase4 completed
        if phase == "phase5":
            prev = self.db.query(PhaseRun).filter_by(album_id=album.id, phase="phase4").first()
            if not prev or prev.status != "completed":
                return False, "Phase 4 not completed"
            return True, None

        # Phase 6 requires phase5 completed
        if phase == "phase6":
            prev = self.db.query(PhaseRun).filter_by(album_id=album.id, phase="phase5").first()
            if not prev or prev.status != "completed":
                return False, "Phase 5 not completed"
            return True, None

        return False, f"Unknown phase: {phase}"

    def start_phase(self, album: AlbumProject, phase: str) -> PhaseRun:
        """Start a phase run. Raises ValueError if transition is invalid."""
        allowed, reason = self.can_start_phase(album, phase)
        if not allowed:
            raise ValueError(reason)

        # Update project status based on phase
        status_map = {
            "phase1": "start_concept",
            "phase2": "confirm_concept",
            "phase3": "lyrics_extracted",
            "phase4": "music_gen_started",
            "phase5": "listening_started",
            "phase6": "packaging_started",
        }
        trigger = status_map.get(phase)
        if trigger:
            m = create_project_machine(album.status)
            m.trigger(trigger)
            album.status = m.state
            album.current_phase = phase

        run = PhaseRun(album_id=album.id, phase=phase, status="running")
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        return run

    def complete_phase(self, phase_run: PhaseRun):
        """Mark a phase run as completed and advance project state."""
        phase_run.status = "completed"
        album = self.db.query(AlbumProject).filter_by(id=phase_run.album_id).first()
        if not album:
            self.db.commit()
            return

        phase_to_trigger = {
            "phase1": "concept_complete",
            "phase2": "songwriting_complete",
            "phase3": "lyrics_extracted",
            "phase4": "music_gen_complete",
            "phase5": "transcoding_complete",
            "phase6": "packaging_complete",
        }
        trigger = phase_to_trigger.get(phase_run.phase)
        if trigger and can_transition(album.status, trigger):
            m = create_project_machine(album.status)
            m.trigger(trigger)
            album.status = m.state
        self.db.commit()

    def fail_phase(self, phase_run: PhaseRun, error: str):
        phase_run.status = "failed"
        phase_run.error_message = error
        self.db.commit()
