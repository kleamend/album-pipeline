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


class TestPhase5Workflow:
    def test_list_takes(self):
        resp = client.post("/api/albums", json={"theme": "听选测试", "track_count": 2})
        album_id = resp.json()["id"]
        resp2 = client.get(f"/api/albums/{album_id}/takes")
        assert resp2.status_code == 200
        data = resp2.json()
        assert len(data["tracks"]) == 2
        assert len(data["tracks"][0]["versions"]) == 3

    def test_select_take(self):
        resp = client.post("/api/albums", json={"theme": "选择测试", "track_count": 1})
        album_id = resp.json()["id"]
        takes = client.get(f"/api/albums/{album_id}/takes").json()
        track_id = takes["tracks"][0]["track_id"]

        resp2 = client.post(f"/api/albums/{album_id}/takes/select?track_id={track_id}&version=p2")
        assert resp2.status_code == 200
        assert resp2.json()["selected_version"] == "p2"
