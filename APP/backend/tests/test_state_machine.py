from app.core.state_machine import create_project_machine, create_phase_machine, can_transition


class TestProjectMachine:
    def test_initial_state(self):
        m = create_project_machine("draft")
        assert m.state == "draft"

    def test_start_concept(self):
        m = create_project_machine("draft")
        m.trigger("start_concept")
        assert m.state == "concept_running"

    def test_concept_flow(self):
        m = create_project_machine("draft")
        m.trigger("start_concept")
        m.trigger("concept_complete")
        assert m.state == "concept_review"
        m.trigger("confirm_concept")
        assert m.state == "songwriting_running"

    def test_reject_concept_returns_to_running(self):
        m = create_project_machine("draft")
        m.trigger("start_concept")
        m.trigger("concept_complete")
        m.trigger("reject_concept")
        assert m.state == "concept_running"

    def test_cannot_skip_draft_to_songwriting(self):
        m = create_project_machine("draft")
        triggers = m.get_triggers("draft")
        assert "confirm_concept" not in triggers

    def test_can_transition_helper(self):
        assert can_transition("draft", "start_concept") is True
        assert can_transition("draft", "confirm_concept") is False
        assert can_transition("concept_review", "confirm_concept") is True


class TestPhaseMachine:
    def test_start_phase(self):
        m = create_phase_machine("pending")
        m.trigger("start_phase")
        assert m.state == "running"

    def test_complete_phase(self):
        m = create_phase_machine("pending")
        m.trigger("start_phase")
        m.trigger("phase_complete")
        assert m.state == "completed"

    def test_retry_on_failure(self):
        m = create_phase_machine("pending")
        m.trigger("start_phase")
        m.trigger("phase_fail")
        assert m.state == "failed"
        m.trigger("phase_retry")
        assert m.state == "running"


class TestFullPipelineTransitions:
    def test_full_pipeline_flow(self):
        m = create_project_machine("draft")
        flow = [
            ("start_concept", "concept_running"),
            ("concept_complete", "concept_review"),
            ("confirm_concept", "songwriting_running"),
            ("songwriting_complete", "lyrics_ready"),
            ("lyrics_extracted", "lyrics_formatted"),
            ("music_gen_started", "music_generating"),
            ("music_gen_complete", "music_generated"),
            ("listening_started", "listening_review"),
            ("transcoding_started", "transcoding"),
            ("transcoding_complete", "transcoding_done"),
            ("packaging_started", "packaging"),
            ("packaging_complete", "completed"),
        ]
        for trigger, expected_state in flow:
            assert can_transition(m.state, trigger), f"Cannot trigger {trigger} from state {m.state}"
            m.trigger(trigger)
            assert m.state == expected_state, f"After {trigger}, expected {expected_state}, got {m.state}"
