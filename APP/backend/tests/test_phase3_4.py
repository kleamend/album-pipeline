import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.connection import engine, Base, SessionLocal
from app.db.models import PhaseRun, Track

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def _create_album_and_complete_phases(client, theme: str, track_count: int = 2, up_to_phase: str = "phase3") -> str:
    """Helper: create album + complete phases up to the specified one."""
    resp = client.post("/api/albums", json={"theme": theme, "track_count": track_count})
    album_id = resp.json()["id"]

    # Phase 1 — start concept generation, then approve it (completes phase1)
    client.post(f"/api/albums/{album_id}/phases/phase1/start")
    client.post(f"/api/albums/{album_id}/decisions/concept", json={"approved": True})

    if up_to_phase == "phase1":
        return album_id

    # Phase 2 — start expert analysis, then manually complete it and finalize tracks
    client.post(f"/api/albums/{album_id}/phases/phase2/start")
    _complete_phase2_and_finalize_tracks(album_id)

    if up_to_phase == "phase2":
        return album_id

    # Phase 3 — auto-completes immediately
    client.post(f"/api/albums/{album_id}/phases/phase3/start")

    return album_id


def _complete_phase2_and_finalize_tracks(album_id: str):
    """Direct DB update: mark phase2 as completed and all tracks as finalized."""
    db = SessionLocal()
    try:
        phase2_run = db.query(PhaseRun).filter_by(album_id=album_id, phase="phase2").first()
        if phase2_run:
            phase2_run.status = "completed"
        tracks = db.query(Track).filter_by(album_id=album_id).all()
        for t in tracks:
            t.status = "finalized"
        db.commit()
    finally:
        db.close()


class TestPhase3Workflow:
    def test_phase3_auto_completes(self):
        album_id = _create_album_and_complete_phases(client, "Phase3 测试", 2, "phase3")
        resp = client.post(f"/api/albums/{album_id}/phases/phase3/start")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "completed"
        assert "Lyrics extraction completed" in data["message"]

    def test_phase3_requires_phase2_completed(self):
        resp = client.post("/api/albums", json={"theme": "Phase3 跳过测试", "track_count": 1})
        album_id = resp.json()["id"]
        # Skip phase 1 and 2 — should fail
        resp2 = client.post(f"/api/albums/{album_id}/phases/phase3/start")
        assert resp2.status_code == 400

    def test_formatter_agent_schema(self):
        from app.services.agents.definitions.phase3_formatter import FORMATTER_AGENT
        assert FORMATTER_AGENT["key"] == "phase3_formatter"
        schema = FORMATTER_AGENT["output_schema"]
        assert "has_lyrics" in schema["properties"]
        assert "char_count" in schema["properties"]
        assert "structure_tags" in schema["properties"]
        assert "tags_valid" in schema["properties"]


class TestPhase4Workflow:
    def test_phase4_start_creates_expert_runs(self):
        album_id = _create_album_and_complete_phases(client, "Phase4 测试", 2, "phase4")
        resp = client.post(f"/api/albums/{album_id}/phases/phase4/start")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "running"
        assert data["tracks"] == 2
        assert data["prompts_per_track"] == 3

    def test_phase4_requires_phase3_completed(self):
        resp = client.post("/api/albums", json={"theme": "Phase4 跳过测试", "track_count": 1})
        album_id = resp.json()["id"]
        resp2 = client.post(f"/api/albums/{album_id}/phases/phase4/start")
        assert resp2.status_code == 400

    def test_generation_queue(self):
        album_id = _create_album_and_complete_phases(client, "队列测试", 3, "phase4")
        client.post(f"/api/albums/{album_id}/phases/phase4/start")

        resp = client.get(f"/api/albums/{album_id}/generation-queue")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["tracks"]) == 3
        for t in data["tracks"]:
            assert len(t["prompts"]) == 3
            assert t["prompts"][0]["version"] == "p1"

    def test_prompt_gen_agent_schema(self):
        from app.services.agents.definitions.phase4_prompt_gen import PROMPT_GENERATOR_AGENT
        assert PROMPT_GENERATOR_AGENT["key"] == "phase4_prompt_gen"
        prompts = PROMPT_GENERATOR_AGENT["output_schema"]["properties"]["prompts"]
        assert prompts["type"] == "array"

    def test_prompt_review_agent_schema(self):
        from app.services.agents.definitions.phase4_prompt_review import PROMPT_REVIEWER_AGENT
        assert PROMPT_REVIEWER_AGENT["key"] == "phase4_prompt_review"
        results = PROMPT_REVIEWER_AGENT["output_schema"]["properties"]["results"]
        assert results["type"] == "array"
