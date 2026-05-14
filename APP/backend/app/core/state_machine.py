from types import SimpleNamespace

from transitions import Machine

PROJECT_STATES = [
    "draft", "concept_running", "concept_review",
    "songwriting_running", "lyrics_ready", "music_generating",
    "listening_review", "transcoding", "packaging",
    "lyrics_formatted", "music_generated", "transcoding_done",
    "completed", "failed", "archived",
]

PROJECT_TRANSITIONS = [
    {"trigger": "start_concept", "source": "draft", "dest": "concept_running"},
    {"trigger": "concept_complete", "source": "concept_running", "dest": "concept_review"},
    {"trigger": "confirm_concept", "source": "concept_review", "dest": "songwriting_running"},
    {"trigger": "reject_concept", "source": "concept_review", "dest": "concept_running"},
    {"trigger": "songwriting_complete", "source": "songwriting_running", "dest": "lyrics_ready"},
    {"trigger": "lyrics_extracted", "source": "lyrics_ready", "dest": "lyrics_formatted"},
    {"trigger": "music_gen_started", "source": "lyrics_formatted", "dest": "music_generating"},
    {"trigger": "music_gen_complete", "source": "music_generating", "dest": "music_generated"},
    {"trigger": "listening_started", "source": "music_generated", "dest": "listening_review"},
    {"trigger": "transcoding_started", "source": "listening_review", "dest": "transcoding"},
    {"trigger": "transcoding_complete", "source": "transcoding", "dest": "transcoding_done"},
    {"trigger": "packaging_started", "source": "transcoding_done", "dest": "packaging"},
    {"trigger": "packaging_complete", "source": "packaging", "dest": "completed"},
    {"trigger": "mark_failed", "source": "*", "dest": "failed"},
    {"trigger": "archive", "source": ["completed", "failed"], "dest": "archived"},
]

PHASE_STATES = ["pending", "running", "waiting_user", "completed", "failed", "skipped"]

PHASE_TRANSITIONS = [
    {"trigger": "start_phase", "source": "pending", "dest": "running"},
    {"trigger": "phase_waiting", "source": "running", "dest": "waiting_user"},
    {"trigger": "phase_complete", "source": ["running", "waiting_user"], "dest": "completed"},
    {"trigger": "phase_fail", "source": "running", "dest": "failed"},
    {"trigger": "phase_retry", "source": "failed", "dest": "running"},
    {"trigger": "phase_skip", "source": "pending", "dest": "skipped"},
]


def create_project_machine(album_status: str = "draft"):
    """Create a fresh state machine instance for a project.

    Returns a model object with .state, trigger methods, and .get_triggers() attached.
    """
    model = SimpleNamespace()
    m = Machine(
        model=model,
        states=PROJECT_STATES,
        transitions=PROJECT_TRANSITIONS,
        initial=album_status,
        send_event=True,
    )
    model.get_triggers = lambda s: m.get_triggers(s)
    return model


def create_phase_machine(phase_status: str = "pending"):
    """Create a fresh state machine instance for a phase.

    Returns a model object with .state, trigger methods, and .get_triggers() attached.
    """
    model = SimpleNamespace()
    m = Machine(
        model=model,
        states=PHASE_STATES,
        transitions=PHASE_TRANSITIONS,
        initial=phase_status,
        send_event=True,
    )
    model.get_triggers = lambda s: m.get_triggers(s)
    return model


def can_transition(current_status: str, trigger: str) -> bool:
    """Check if a transition is valid from current status without executing it."""
    for t in PROJECT_TRANSITIONS:
        if t["trigger"] != trigger:
            continue
        source = t["source"]
        if source == "*":
            return True
        if isinstance(source, list):
            if current_status in source:
                return True
        elif source == current_status:
            return True
    return False
