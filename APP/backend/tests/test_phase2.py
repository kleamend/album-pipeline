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


class TestPhase2Workflow:
    def test_start_phase2_requires_phase1_completed(self):
        # Create album, try phase2 without phase1
        resp = client.post("/api/albums", json={"theme": "Phase2 测试专辑", "track_count": 3})
        assert resp.status_code == 201
        album_id = resp.json()["id"]

        # Phase2 should fail without phase1 completed
        resp2 = client.post(f"/api/albums/{album_id}/phases/phase2/start")
        assert resp2.status_code == 400

    def test_full_phase1_then_phase2(self):
        resp = client.post("/api/albums", json={"theme": "完整流程测试", "track_count": 3})
        assert resp.status_code == 201
        album_id = resp.json()["id"]

        # Complete phase1
        client.post(f"/api/albums/{album_id}/phases/phase1/start")
        client.post(f"/api/albums/{album_id}/decisions/concept", json={"approved": True})

        # Start phase2
        resp2 = client.post(f"/api/albums/{album_id}/phases/phase2/start")
        assert resp2.status_code == 200
        data = resp2.json()
        assert data["tracks"] == 3
        assert data["experts_per_track"] == 5
        assert data["status"] == "running"

    def test_advance_track_round(self):
        resp = client.post("/api/albums", json={"theme": "轮次测试", "track_count": 1})
        assert resp.status_code == 201
        album_id = resp.json()["id"]

        client.post(f"/api/albums/{album_id}/phases/phase1/start")
        client.post(f"/api/albums/{album_id}/decisions/concept", json={"approved": True})
        client.post(f"/api/albums/{album_id}/phases/phase2/start")

        # Verify phases exist
        phases = client.get(f"/api/albums/{album_id}/phases").json()
        assert len(phases) >= 2  # phase1 + phase2

        # Verify phase2 is running
        phase2 = [p for p in phases if p["phase"] == "phase2"][0]
        assert phase2["status"] == "running"

    def test_song_design_renderer(self):
        from app.renderers.song_design import render_song_design

        md = render_song_design(
            basic_info={
                "index": 1, "track_name": "测试", "language": "chinese",
                "direction": "Narrative A", "core_hook": "hook",
                "core_paradox": "para", "core_imagery": "img",
                "physicality": "phys", "emotional_arc": "A→B",
                "estimated_duration": "3:30",
            },
            lyrics={
                "sections": [{"tag": "Verse", "lines": ["第一行", "第二行"]}],
                "char_count": 12, "english_lyrics": None,
            },
            arrangement={
                "bpm": 78, "key": "Am", "style": "Pop",
                "sections": [], "sound_design": [],
            },
            rhyme={
                "rhyme_distribution": [],
                "hook_rhyme_design": "",
                "coordination_rating": [],
            },
            market={
                "core_competitiveness": [],
                "target_audience_analysis": [],
                "cover_highlight_copy": "test",
            },
            scoring={
                "rhythm_score": 16, "market_score": 17,
                "structure_score": 18, "philosophy_score": 19,
                "arrangement_score": 15, "total": 85,
                "status": "✅ Finalized",
            },
        )
        assert "T1《测试》" in md
        assert "## Basic Info" in md
        assert "## Lyrics" in md
        assert "[Verse]" in md
        assert "第一行" in md
        assert "第二行" in md
        assert "## Data" in md
        assert "85/100" in md
        assert "## Full Arrangement Design" in md
        assert "## Cover Highlight Copy" in md
        assert "> **\"test\"**" in md

    def test_renderer_english_lyrics_skipped_when_none(self):
        from app.renderers.song_design import render_song_design

        md = render_song_design(
            basic_info={"index": 2, "track_name": "NoEN", "language": "chinese",
                        "direction": "X", "core_hook": "h", "core_paradox": "p",
                        "core_imagery": "i", "physicality": "ph", "emotional_arc": "B→A",
                        "estimated_duration": "4:00"},
            lyrics={"sections": [], "english_lyrics": None},
            arrangement={"bpm": 120, "key": "C", "style": "Rock", "sections": [], "sound_design": []},
            rhyme={"rhyme_distribution": [], "hook_rhyme_design": "", "coordination_rating": []},
            market={"core_competitiveness": [], "target_audience_analysis": [], "cover_highlight_copy": ""},
            scoring={"rhythm_score": 10, "market_score": 10, "structure_score": 10,
                     "philosophy_score": 10, "arrangement_score": 10, "total": 50, "status": "In Progress"},
        )
        assert "English Lyrics" not in md
        assert "T2《NoEN》" in md

    def test_renderer_issues_rendering(self):
        from app.renderers.song_design import render_song_design

        empty = render_song_design(
            basic_info={"index": 3, "track_name": "Empty", "language": "chinese",
                        "direction": "X", "core_hook": "h", "core_paradox": "p",
                        "core_imagery": "i", "physicality": "ph", "emotional_arc": "C→D",
                        "estimated_duration": "2:00"},
            lyrics={"sections": []},
            arrangement={"bpm": 100, "key": "G", "style": "Jazz", "sections": [], "sound_design": []},
            rhyme={"rhyme_distribution": [], "hook_rhyme_design": "", "coordination_rating": []},
            market={"core_competitiveness": [], "target_audience_analysis": [], "cover_highlight_copy": ""},
            scoring={"rhythm_score": 10, "market_score": 10, "structure_score": 10,
                     "philosophy_score": 10, "arrangement_score": 10, "total": 50,
                     "status": "In Progress", "issues": []},
        )
        assert "None" in empty  # no issues section shows "None"

        with_issues = render_song_design(
            basic_info={"index": 4, "track_name": "Issues", "language": "chinese",
                        "direction": "X", "core_hook": "h", "core_paradox": "p",
                        "core_imagery": "i", "physicality": "ph", "emotional_arc": "E→F",
                        "estimated_duration": "3:00"},
            lyrics={"sections": []},
            arrangement={"bpm": 90, "key": "Dm", "style": "Folk", "sections": [], "sound_design": []},
            rhyme={"rhyme_distribution": [], "hook_rhyme_design": "", "coordination_rating": []},
            market={"core_competitiveness": [], "target_audience_analysis": [], "cover_highlight_copy": ""},
            scoring={"rhythm_score": 8, "market_score": 8, "structure_score": 8,
                     "philosophy_score": 8, "arrangement_score": 8, "total": 40,
                     "status": "Needs Revision",
                     "issues": [
                         {"priority": "P0", "module": "Lyrics", "description": "Broken rhyme"},
                         {"priority": "P1", "module": "Arrangement", "description": "Too sparse"},
                     ]},
        )
        assert "P0" in with_issues
        assert "P1" in with_issues
        assert "Broken rhyme" in with_issues
        assert "Too sparse" in with_issues
