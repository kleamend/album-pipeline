# Execution Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 补全 Phase 2-6 Agent Runtime 调用链路 + 前端数据接入 + UI 美化

**Architecture:** 后端：每个 Phase 新增 execute 端点，ThreadPoolExecutor 管理并发；前端：替换硬编码为 API 数据

**Tech Stack:** Python FastAPI + SQLAlchemy + transitions + httpx, Next.js 14 + TypeScript + Tailwind

---

## P0 任务

### Task 1: 补全状态机 + Orchestrator

**Files:**
- Modify: `APP/backend/app/core/state_machine.py`
- Modify: `APP/backend/app/core/orchestrator.py`
- Modify: `APP/backend/tests/test_state_machine.py`

- [ ] **Step 1: 在 state_machine.py 的 PROJECT_TRANSITIONS 中追加新转移**

在现有 transitions 列表的 `archive` 之前插入：

```python
    {"trigger": "lyrics_extracted", "source": "lyrics_ready", "dest": "lyrics_formatted"},
    {"trigger": "music_gen_started", "source": "lyrics_formatted", "dest": "music_generating"},
    {"trigger": "music_gen_complete", "source": "music_generating", "dest": "music_generated"},
    {"trigger": "listening_started", "source": "music_generated", "dest": "listening_review"},
    {"trigger": "transcoding_started", "source": "listening_review", "dest": "transcoding"},
    {"trigger": "transcoding_complete", "source": "transcoding", "dest": "transcoding_done"},
    {"trigger": "packaging_started", "source": "transcoding_done", "dest": "packaging"},
    {"trigger": "packaging_complete", "source": "packaging", "dest": "completed"},
```

同时在 PROJECT_STATES 中添加 `"lyrics_formatted"`, `"music_generated"`, `"transcoding_done"`。

- [ ] **Step 2: 更新 orchestrator.py 的 status_map 和 complete_phase**

`status_map` 扩展为：

```python
status_map = {
    "phase1": "start_concept",
    "phase2": "confirm_concept",
    "phase3": "lyrics_extracted",
    "phase4": "music_gen_started",
    "phase5": "listening_started",
    "phase6": "packaging_started",
}
```

`complete_phase` 扩展为：

```python
def complete_phase(self, phase_run: PhaseRun):
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
```

- [ ] **Step 3: 在 test_state_machine.py 追加新状态转移的测试**

```python
class TestFullPipelineTransitions:
    def test_full_pipeline_flow(self):
        m = create_project_machine("draft")
        states = ["concept_running", "concept_review", "songwriting_running",
                   "lyrics_ready", "lyrics_formatted", "music_generating",
                   "music_generated", "listening_review", "transcoding",
                   "transcoding_done", "packaging", "completed"]
        triggers = ["start_concept", "concept_complete", "confirm_concept",
                    "songwriting_complete", "lyrics_extracted", "music_gen_started",
                    "music_gen_complete", "listening_started", "transcoding_started",
                    "transcoding_complete", "packaging_started", "packaging_complete"]
        for i, trigger in enumerate(triggers):
            assert can_transition(m.state, trigger) or m.state == states[i], \
                f"Cannot trigger {trigger} from {m.state}"
            if can_transition(m.state, trigger):
                m.trigger(trigger)
```

- [ ] **Step 4: 运行测试**

```bash
cd APP/backend && python -m pytest tests/test_state_machine.py -v
```
Expected: 所有测试通过，包括新的完整流水线测试。

- [ ] **Step 5: Commit**

```bash
git add APP/backend/app/core/state_machine.py APP/backend/app/core/orchestrator.py APP/backend/tests/test_state_machine.py
git commit -m "feat: complete state machine with Phase 3-6 transitions"
```

---

### Task 2: Phase 2 execute 端点（含并行调度）

**Files:**
- Create: `APP/backend/app/services/executor.py` — 并行执行引擎
- Modify: `APP/backend/app/api/workflow_phase2.py` — 添加 execute 端点
- Create: `APP/backend/tests/test_phase2_execute.py`

- [ ] **Step 1: 创建并行执行引擎 executor.py**

```python
"""ThreadPool-based parallel agent executor."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from sqlalchemy.orm import Session
from ..db.connection import SessionLocal
from ..db.models import ExpertRun, Track


def run_track_agents_parallel(
    tracks: list[Track],
    agent_keys: list[str],
    agent_defs: dict[str, dict],
    build_context: callable,
    phase_run_id: str,
    album_id: str,
    max_workers: int = 2,
) -> dict[str, dict]:
    """Execute agents for each track in parallel. Returns {track_id: {agent_key: output}}.

    Each track runs its agents serially internally (they depend on each other's output).
    Different tracks run in parallel via ThreadPoolExecutor.
    """
    results = {}

    def execute_track(track: Track) -> tuple[str, dict, str | None]:
        """Execute all agents for one track, serially."""
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
                # Check round count from expert_runs
                round_count = db.query(ExpertRun).filter_by(
                    track_id=track.id, agent_key="phase2_scoring"
                ).count()
                if round_count >= 3:
                    track.status = "finalized"
                else:
                    track.status = "needs_revision"
            else:
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
```

- [ ] **Step 2: 在 workflow_phase2.py 添加 execute 端点**

```python
import json
from ..services.executor import run_track_agents_parallel
from ..services.agents.definitions.phase2_lyrics import LYRICS_AGENT
from ..services.agents.definitions.phase2_arrangement import ARRANGEMENT_AGENT
from ..services.agents.definitions.phase2_rhyme import RHYME_AGENT
from ..services.agents.definitions.phase2_market import MARKET_SONG_AGENT
from ..services.agents.definitions.phase2_scoring import SCORING_AGENT
from ..services.config_manager import load_config

PHASE2_AGENTS = {
    "phase2_lyrics": LYRICS_AGENT,
    "phase2_arrangement": ARRANGEMENT_AGENT,
    "phase2_rhyme": RHYME_AGENT,
    "phase2_market": MARKET_SONG_AGENT,
    "phase2_scoring": SCORING_AGENT,
}
PHASE2_AGENT_ORDER = ["phase2_lyrics", "phase2_arrangement", "phase2_rhyme", "phase2_market", "phase2_scoring"]


def _build_phase2_context(track: Track, prev_outputs: dict, agent_key: str) -> dict:
    """Build input context for a Phase 2 agent based on previous agent outputs."""
    lyrics = prev_outputs.get("phase2_lyrics", {})
    arrangement = prev_outputs.get("phase2_arrangement", {})
    # ... build per-agent context from spec's input_schema
    base = {
        "track_name": track.title or f"T{track.index}",
        "language": track.language,
        "round": (track.round or 1),
    }
    if agent_key == "phase2_lyrics":
        base.update({"core_hook": track.core_hook or "", "emotional_arc": track.emotional_arc or ""})
    elif agent_key == "phase2_arrangement":
        base.update({"lyrics_sections": lyrics.get("sections", []), "arrangement_style": track.arrangement_style or "",
                      "estimated_duration": "3:30"})
    elif agent_key == "phase2_rhyme":
        base.update({"lyrics_sections": lyrics.get("sections", []),
                      "arrangement_sections": arrangement.get("sections", [])})
    elif agent_key == "phase2_market":
        base.update({"album_context": track.narrative_axis or "", "lyrics_summary": str(lyrics.get("sections", [])[:3])})
    elif agent_key == "phase2_scoring":
        base.update({"previous_scores": [], "lyrics_summary": "", "arrangement_summary": "",
                      "rhyme_summary": "", "market_summary": ""})
    return base


@router.post("/albums/{album_id}/phases/phase2/execute")
def execute_phase2(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")

    orch = Orchestrator(db)
    try:
        run = orch.start_phase(album, "phase2")
    except ValueError as e:
        raise HTTPException(400, str(e))

    config = load_config()
    max_workers = config.get("max_workers", 2)

    tracks = db.query(Track).filter_by(album_id=album_id).filter(Track.status != "finalized").all()
    if not tracks:
        raise HTTPException(400, "All tracks already finalized")

    results = run_track_agents_parallel(
        tracks=tracks,
        agent_keys=PHASE2_AGENT_ORDER,
        agent_defs=PHASE2_AGENTS,
        build_context=_build_phase2_context,
        phase_run_id=run.id,
        album_id=album_id,
        max_workers=max_workers,
    )

    # Check if all tracks finalized
    remaining = db.query(Track).filter_by(album_id=album_id).filter(Track.status != "finalized").count()
    if remaining == 0:
        orch.complete_phase(run)

    return {
        "phase_run_id": run.id,
        "results": {tid: {"error": r["error"]} if r["error"] else {"status": "completed"}
                    for tid, r in results.items()},
        "tracks_remaining": remaining,
    }
```

- [ ] **Step 3: 写 Phase 2 execute 测试**

```python
# tests/test_phase2_execute.py
class TestPhase2Execute:
    def test_execute_phase2_requires_phase1_completed(self):
        # Create album, no phase1 → should fail
        resp = client.post("/api/albums", json={"theme": "test", "track_count": 1})
        album_id = resp.json()["id"]
        resp2 = client.post(f"/api/albums/{album_id}/phases/phase2/execute")
        assert resp2.status_code == 400

    def test_execute_phase2_creates_expert_runs(self):
        # Setup: create album, complete phase1, then execute phase2
        # Assert ExpertRun records are created with status="completed"
        pass

    def test_executor_parallel_execution(self):
        from app.services.executor import run_track_agents_parallel
        # Test with mock agents that don't call real LLM
        pass
```

- [ ] **Step 4: 运行测试**

```bash
cd APP/backend && python -m pytest tests/test_phase2_execute.py -v
```

- [ ] **Step 5: Commit**

```bash
git add APP/backend/app/services/executor.py APP/backend/app/api/workflow_phase2.py APP/backend/tests/test_phase2_execute.py
git commit -m "feat: add Phase 2 execute endpoint with parallel track execution"
```

---

### Task 3: Phase 1 结果写回 album/track 字段

**Files:**
- Modify: `APP/backend/app/api/workflow.py` — execute_phase1 末尾添加字段同步

- [ ] **Step 1: 在 execute_phase1 的 orch.complete_phase(run) 之前添加**

```python
# Sync Phase 1 results to album and tracks
creative = results.get("creative", {})
if creative:
    album.title = creative.get("album_name_cn", "") or album.title
    album.title_en = creative.get("album_name_en", "") or album.title_en

    # Update track names
    for t_data in creative.get("tracks", []):
        idx = t_data.get("index")
        track = db.query(Track).filter_by(album_id=album.id, index=idx).first()
        if track:
            track.title = t_data.get("name", "") or track.title
            track.title_en = t_data.get("english_name", "") or track.title_en
            track.core_hook = t_data.get("core_hook", "") or track.core_hook
            track.emotional_arc = t_data.get("emotional_arc", "") or track.emotional_arc
            track.arrangement_style = t_data.get("arrangement_style", "") or track.arrangement_style
            track.narrative_axis = t_data.get("direction", "") or track.narrative_axis
    db.commit()

# Write album_overview.md
from ..renderers.album_overview import render_album_overview
market = results.get("market", {})
music = results.get("music", {})
md_content = render_album_overview(creative, market, music, reviewer_output or {}, round_num=1)
overview_path = Path(album.workspace_path) / "docs" / "album-overview.md"
overview_path.parent.mkdir(parents=True, exist_ok=True)
overview_path.write_text(md_content, encoding="utf-8")
```

- [ ] **Step 2: 添加测试验证字段同步**

在 test_api_albums.py 中添加：

```python
def test_phase1_execute_syncs_album_title(self):
    resp = client.post("/api/albums", json={"theme": "title sync test", "track_count": 2})
    album_id = resp.json()["id"]
    # Execute with a mock agent... or just verify the path exists
```

- [ ] **Step 3: Commit**

```bash
git add APP/backend/app/api/workflow.py APP/backend/tests/test_api_albums.py
git commit -m "feat: sync Phase 1 results to album.title and track fields"
```

---

### Task 4: SongDetail 接入真实 API 数据

**Files:**
- Modify: `APP/frontend/app/components/SongDetail.tsx`
- Modify: `APP/frontend/app/albums/[albumId]/tracks/[trackId]/page.tsx`
- Modify: `APP/frontend/app/components/RoundHistory.tsx`

- [ ] **Step 1: Update SongDetail props and data fetching**

```tsx
// SongDetail.tsx — 改为接收真实的 track data + rounds data
interface TrackData {
  id: string; index: number; title: string; score: number | null; status: string;
  core_hook?: string; emotional_arc?: string; arrangement_style?: string;
}
interface RoundData {
  round: number; agents: Record<string, {status: string; output_json: string | null}>; final_score: number | null;
}
interface Props { track: TrackData; rounds: RoundData[]; }

// 歌词 Tab: 解析 rounds[latest].agents.phase2_lyrics.output_json → sections
// 编曲 Tab: 解析 phase2_arrangement.output_json → bpm/key/style/sections
// 评分 Tab: 解析 phase2_scoring.output_json → 5 dimension scores
```

- [ ] **Step 2: Update track page to fetch real data**

```tsx
// [trackId]/page.tsx
useEffect(() => {
  api.getAlbum(albumId).then(album => {
    // find track by trackId in album context
    setTrack({ id: trackId, index: 1, title: '...', score: null, status: 'planned' });
  });
  api.getTrackRounds(albumId, trackId).then(data => setRounds(data.rounds));
}, [albumId, trackId]);
```

- [ ] **Step 3: 添加 getTrackRounds 到 API client**

```typescript
// src/api/client.ts
getTrackRounds: (albumId: string, trackId: string) =>
  request<any>(`/albums/${albumId}/tracks/${trackId}/rounds`),
```

- [ ] **Step 4: Commit**

```bash
git add APP/frontend/app/components/SongDetail.tsx APP/frontend/app/albums/\[albumId\]/tracks/\[trackId\]/page.tsx APP/frontend/app/components/RoundHistory.tsx APP/frontend/src/api/client.ts
git commit -m "feat: connect SongDetail to real API data, remove hardcoded content"
```

---

## P1 任务

### Task 5: Phase 3 execute 端点

**Files:**
- Modify: `APP/backend/app/api/workflow_phase3.py`

在现有 `start_phase3` 旁添加 `execute_phase3`：

```python
@router.post("/albums/{album_id}/phases/phase3/execute")
def execute_phase3(album_id: str, db: Session = Depends(get_db)):
    album = db.query(AlbumProject).filter_by(id=album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")
    orch = Orchestrator(db)
    try:
        run = orch.start_phase(album, "phase3")
    except ValueError as e:
        raise HTTPException(400, str(e))

    tracks = db.query(Track).filter_by(album_id=album_id).all()
    from ..services.agents.runtime import AgentRuntime
    from ..services.agents.definitions.phase3_formatter import FORMATTER_AGENT
    runtime = AgentRuntime()

    results = []
    for track in tracks:
        # Get Phase 2 scoring output which contains lyrics sections
        scoring_run = db.query(ExpertRun).filter_by(
            track_id=track.id, agent_key="phase2_scoring", status="completed"
        ).order_by(ExpertRun.round.desc()).first()
        if not scoring_run:
            continue
        ctx = {"track_name": track.title or f"T{track.index}", "language": track.language}
        expert_run = ExpertRun(phase_run_id=run.id, album_id=album.id, track_id=track.id,
                               agent_key="phase3_formatter", status="running")
        db.add(expert_run); db.commit()
        try:
            output = runtime.run(FORMATTER_AGENT, ctx, expert_run)
            # Write lyrics file
            lyrics_path = Path(album.workspace_path) / "generate" / "lyrics" / "cn" / f"T{track.index}-{track.title}.txt"
            lyrics_path.parent.mkdir(parents=True, exist_ok=True)
            lyrics_path.write_text("\n".join(output.get("lyrics_lines", [])), encoding="utf-8")
            expert_run.status = "completed"
            results.append({"track_id": track.id, "status": "ok"})
        except Exception as e:
            expert_run.status = "failed"; expert_run.error_message = str(e)
            results.append({"track_id": track.id, "status": "error", "error": str(e)})
        db.commit()

    orch.complete_phase(run)
    return {"phase_run_id": run.id, "results": results}
```

- [ ] **Commit**

```bash
git add APP/backend/app/api/workflow_phase3.py
git commit -m "feat: add Phase 3 execute endpoint for lyrics extraction"
```

---

### Task 6: Phase 4 三步骤端点

**Files:**
- Modify: `APP/backend/app/api/workflow_phase4.py` — 添加 generate-prompts, review-prompts, generate-music 端点

三个端点代码按 spec §4 实现。关键点：
- `generate-prompts` 调用 `PROMPT_GENERATOR_AGENT`，写入 `generate/prompts/` 
- `review-prompts` 调用 `PROMPT_REVIEWER_AGENT`，6 项检查
- `generate-music` 用 `ThreadPoolExecutor` 并发调 `MiniMaxMusicWorker`

- [ ] **Commit**

```bash
git add APP/backend/app/api/workflow_phase4.py
git commit -m "feat: add Phase 4 three-step endpoints (prompts, review, generate)"
```

---

### Task 7: Phase 5 转码端点 + 前端联动

**Files:**
- Modify: `APP/backend/app/api/workflow_phase5.py` — 添加 transcode 端点
- Modify: `APP/frontend/app/components/TakePlayer.tsx` — 接入真实 takes 数据

- [ ] **Commit**

```bash
git add APP/backend/app/api/workflow_phase5.py APP/frontend/app/components/TakePlayer.tsx
git commit -m "feat: add Phase 5 transcode endpoint and connect TakePlayer to API"
```

---

### Task 8: Phase 6 execute 端点 + 打包

**Files:**
- Modify: `APP/backend/app/api/workflow_phase6.py` — 添加 execute 端点

- [ ] **Commit**

```bash
git add APP/backend/app/api/workflow_phase6.py
git commit -m "feat: add Phase 6 execute endpoint with parallel agents and packaging"
```

---

### Task 9: Dashboard 数据刷新 + Phase 时间线修复

**Files:**
- Modify: `APP/frontend/app/components/AlbumDashboard.tsx`
- Modify: `APP/frontend/app/components/PhaseTimeline.tsx`

- 修复 `TrackList` 从 API 加载真实 tracks
- PhaseTimeline 根据 `PhaseRun` 数据正确渲染各 Phase 状态

- [ ] **Commit**

```bash
git add APP/frontend/app/components/AlbumDashboard.tsx APP/frontend/app/components/PhaseTimeline.tsx APP/frontend/app/components/TrackList.tsx
git commit -m "fix: Dashboard fetches real track data, PhaseTimeline reflects actual phase state"
```

---

### Task 10: 其他前端页面接入真实数据

**Files:**
- Modify: `APP/frontend/app/components/MusicGenPanel.tsx`
- Modify: `APP/frontend/app/components/ReleasePanel.tsx`
- Modify: `APP/frontend/app/components/RecentProjects.tsx` — 修复 title: null 显示

- [ ] **Commit**

```bash
git add APP/frontend/app/components/MusicGenPanel.tsx APP/frontend/app/components/ReleasePanel.tsx APP/frontend/app/components/RecentProjects.tsx
git commit -m "feat: connect MusicGen, Release, and RecentProjects to real API data"
```

---

### Task 11: UI 全面美化（ui-ux-pro-max）

**调用 ui-ux-pro-max skill 对所有前端组件进行视觉升级。**

范围：11 个组件/页面，保持暖色模拟唱片风格，字体系统不变

- [ ] **Step 1: 调用 ui-ux-pro-max skill**

```text
Use the ui-ux-pro-max skill to beautify all UI components in
APP/frontend/app/components/*.tsx and APP/frontend/app/**/page.tsx

Constraints:
- Keep warm analog vinyl style (#fb923c → #f472b6)
- Keep font system (Playfair Display + Inter + Noto Sans SC + JetBrains Mono)
- Only modify CSS/Tailwind classes and Framer Motion animation parameters
- Do not change component functionality or API interfaces
```

- [ ] **Commit**

```bash
git add APP/frontend/app/
git commit -m "style: comprehensive UI beautification via ui-ux-pro-max"
```

---

## P2 任务

### Task 12: 并发数配置 + 筛选按钮修复 + 杂项

**Files:**
- Modify: `APP/backend/app/services/config_manager.py` — DEFAULT_CONFIG 加 `max_workers: 2`
- Modify: `APP/frontend/app/settings/page.tsx` — 加"Agent 并发数"输入框
- Modify: `APP/frontend/app/albums/page.tsx` — 实现 filter 逻辑
- Modify: `APP/backend/app/main.py` — CORS 改用 allow_origin_regex

- [ ] **Step 1: Config 加 max_workers**

```python
DEFAULT_CONFIG = {
    ...
    "max_workers": 2,
}
```

- [ ] **Step 2: 设置页加并发数输入**

在 LLM API 配置 card 底部加：

```tsx
<div>
  <label className="block text-xs text-muted-dim mb-2 font-medium">Agent 并发数</label>
  <input className="input-field w-24" type="number" min={1} max={6}
    value={maxWorkers} onChange={(e) => setMaxWorkers(Number(e.target.value))} />
  <p className="text-[10px] text-muted-dim mt-1.5">同时执行的歌曲数量（Phase 2）</p>
</div>
```

- [ ] **Step 3: 筛选按钮实现**

```tsx
const filteredAlbums = albums.filter(a => {
  if (filter === '全部') return true;
  if (filter === '制作中') return !['completed','failed','archived'].includes(a.status);
  if (filter === '已完成') return a.status === 'completed';
  return a.status === filter;
});
```

- [ ] **Step 4: Commit**

```bash
git add APP/backend/app/services/config_manager.py APP/frontend/app/settings/page.tsx APP/frontend/app/albums/page.tsx
git commit -m "fix: add max_workers config, filter implementation, and misc fixes"
```

---

## 验证清单

- [ ] 状态机 12 步全流程 transition 测试通过
- [ ] Phase 2 execute 端点创建 ExpertRun 记录并成功执行
- [ ] Phase 1 执行后 album.title 非 null
- [ ] SongDetail 展示真实 API 数据
- [ ] Phase 3-6 execute 端点可用
- [ ] 前端所有页面无硬编码数据
- [ ] UI 美化后构建通过
