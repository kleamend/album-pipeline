import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.connection import engine, Base

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


class TestAlbumsAPI:
    def test_create_and_list_albums(self):
        resp = client.post("/api/albums", json={
            "theme": "关于离开的概念",
            "track_count": 3,
            "language": "chinese",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["id"]
        assert data["slug"].startswith("album-")
        assert data["track_count"] == 3
        assert data["status"] == "draft"

        # List
        resp2 = client.get("/api/albums")
        assert resp2.status_code == 200
        assert len(resp2.json()) == 1

    def test_get_album_404(self):
        resp = client.get("/api/albums/nonexistent")
        assert resp.status_code == 404

    def test_delete_album(self):
        resp = client.post("/api/albums", json={"theme": "测试专辑"})
        album_id = resp.json()["id"]

        resp2 = client.delete(f"/api/albums/{album_id}")
        assert resp2.status_code == 204

        resp3 = client.get(f"/api/albums/{album_id}")
        assert resp3.status_code == 404

    def test_provider_status(self):
        resp = client.get("/api/providers/status")
        assert resp.status_code == 200
        data = resp.json()
        assert "minimax" in data
        assert "netease" in data

    def test_start_phase1(self):
        resp = client.post("/api/albums", json={"theme": "概念专辑测试", "track_count": 5})
        album_id = resp.json()["id"]

        resp2 = client.post(f"/api/albums/{album_id}/phases/phase1/start")
        assert resp2.status_code == 200
        data = resp2.json()
        assert data["status"] == "running"
        assert data["phase_run_id"]

        # Verify project status updated
        album = client.get(f"/api/albums/{album_id}").json()
        assert album["status"] == "concept_running"

    def test_confirm_concept(self):
        resp = client.post("/api/albums", json={"theme": "确认测试"})
        album_id = resp.json()["id"]

        client.post(f"/api/albums/{album_id}/phases/phase1/start")

        resp2 = client.post(f"/api/albums/{album_id}/decisions/concept", json={"approved": True})
        assert resp2.status_code == 200
        assert resp2.json()["status"] == "concept_confirmed"
