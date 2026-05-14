# Album Pipeline 执行架构补全

> 目标：补全 Phase 2-6 的 Agent Runtime 真实调用链路，修复前端硬编码数据，
> 补全状态机，让 6 个 Phase 形成完整闭环。

---

## 1. 执行架构总览

每个 Phase 提供 `execute` 端点，真正调 Agent Runtime / Worker：

| Phase | 端点 | 执行模式 | 并发 |
|-------|------|----------|------|
| 1 | `POST .../phase1/execute` | 串行：3 并行 Agent → reviewer | ✅ 已实现 |
| 2 | `POST .../phase2/execute` | 歌曲级并行，歌曲内串行 | ThreadPoolExecutor(max=N) |
| 3 | `POST .../phase3/execute` | 逐首串行 | 无需并发 |
| 4 | 3 个端点（见 §4） | 分步：prompts → review → CLI generate | CLI 生成用 ThreadPoolExecutor |
| 5 | 前端选 Take + `POST .../phase5/transcode` | 选定后自动转码 | — |
| 6 | `POST .../phase6/execute` | 并行 Agent + Worker 按需触达 | ThreadPoolExecutor |

---

## 2. Phase 2 执行（单曲创作）

### API

```
POST /api/albums/{id}/phases/phase2/execute
```

### 执行流程

```
1. Orchestrator.can_start_phase("phase2") → 校验 Phase 1 已完成
2. 创建 PhaseRun(status=running)，更新 album.status = "songwriting_running"
3. 获取所有 status != "finalized" 的 tracks
4. ThreadPoolExecutor(max_workers=N, 默认 2) 并发执行每个 track：
   ┌─ 获取 ExpertRun 中该 track 上一轮的 issues
   ├─ 串行调用 AgentRuntime.run()：
   │   lyrics → arrangement → rhyme → market → scoring
   │   每个 Agent 的输出 JSON 作为下一个 Agent 输入的一部分
   ├─ scoring 完成后判断：
   │   score >= 80 且 round >= 3 → track.status = "finalized"
   │   score < 80 且 round < 6 → track.status = "needs_revision"，返回 issues
   │   round == 6 → track.status = "needs_review"（取最高分版本）
   └─ 写入 ExpertRun.output_json + DB
5. 单首失败处理：成功 track 保留，失败 track 的错误写入 ExpertRun.error_message
6. 所有 track finalized → Orchestrator.complete_phase(run)
   → album.status = "lyrics_ready"
```

### 并发控制

- `max_workers` 从 config.json 读取，默认值 2
- 设置页新增"Agent 并发数"输入框
- ThreadPoolExecutor 内部每个 worker 有独立的 DB session

### 相关数据更新

- Phase 1 的概念结果同步写入：
  - `album.title` = creative.album_name_cn
  - `album.title_en` = creative.album_name_en
  - 每首歌 `track.title` = creative.tracks[i].name
  - `track.core_hook` = creative.tracks[i].core_hook
  - `track.emotional_arc` = creative.tracks[i].emotional_arc

---

## 3. Phase 3 执行（歌词提取）

```
POST /api/albums/{id}/phases/phase3/execute
```

```
1. 校验 Phase 2 已完成 + 所有 track finalized
2. 创建 PhaseRun(status=running)
3. 对每首歌：读取 ExpertRun output_json（Phase 2 scoring 的结果包含 lyrics sections）
4. 调用 formatter Agent → 提取纯歌词 + 结构标签 + 字数校验
5. 写入 generate/lyrics/{cn|en}/T{N}-{name}.txt
6. 生成 metadata.json + validation.txt
7. Orchestrator.complete_phase → album.status = "lyrics_formatted"
```

---

## 4. Phase 4 执行（音乐生成）— 3 步

### Step 4.1: 生成 Prompt

```
POST /api/albums/{id}/phases/phase4/generate-prompts
```

```
1. 校验 Phase 3 已完成
2. 对每首歌调用 prompt_gen Agent → 产生 3 个 Prompt（p1/p2/p3）
3. 写入 generate/prompts/T{N}-{name}-prompt{N}.txt
4. 写入 generate/prompts/index.json
5. 返回所有 Prompt 供前端展示
```

### Step 4.2: 审查 Prompt

```
POST /api/albums/{id}/phases/phase4/review-prompts
```

```
1. 对每首歌的 3 个 Prompt 调用 prompt_review Agent
2. 6 项检查（字数/参数/无效信息/传输率/可读性/区分度）
3. 返回审查结果，前端展示通过/不通过
4. 不通过的 Prompt 等待用户重新生成或人工修改
```

### Step 4.3: CLI 生成

```
POST /api/albums/{id}/phases/phase4/generate-music
```

```
1. 仅处理审查通过的 Prompt
2. ThreadPoolExecutor(max_workers=N) 并发调 MiniMaxMusicWorker
   每首歌 × 3 个 Prompt 版本 → 3 个 mp3
3. 写入 generate/{cn|en}/T{N}-{name}-p{N}.mp3
4. 创建 Artifact 记录
5. Orchestrator.complete_phase → album.status = "music_generated"
```

---

## 5. Phase 5 执行（听选转码）

### 流程

```
前端：TakePlayer 展示 3 个 Take → 用户听选 → 点击确认
  → POST /api/albums/{id}/takes/select {track_id, version}
  → 后端标记选定版本，触发转码

后端转码：
POST /api/albums/{id}/phases/phase5/transcode
1. 对每首已选定 take 的歌曲调 AudioTranscodeWorker
   320kbps / 44.1kHz / -14 LUFS
2. 调 AudioVerifyWorker (ffprobe) 校验
3. 写入 generate/{cn|en}_320k/T{N}-{name}.mp3
4. 生成 loudness-report.txt
5. 全部通过 → complete_phase → album.status = "transcoding_done"
```

---

## 6. Phase 6 执行（发布物料）

```
POST /api/albums/{id}/phases/phase6/execute
```

```
1. ThreadPoolExecutor 并行执行 5 个文字 Agent：
   宣传文案 / 艺人故事 / 封面概念 / 封面 Prompt / 平台检查
2. 封面 Prompt 生成后 → MiniMaxImageWorker 生成封面 PNG
3. 宣传视频 → MiniMaxVideoWorker 生成 promo-video.mp4
4. 写入 docs/ 下各文件 + generate/covers/
5. 更新 album-overview.md（Phase 2 的 5 维评分替换 Phase 1 的 4 维评分）
6. PackagerWorker 打包 zip
7. complete_phase → album.status = "completed"
```

---

## 7. 状态机补全

当前状态机缺失 Phase 3-6 的转移。补全：

```python
PROJECT_TRANSITIONS += [
    {"trigger": "lyrics_extracted", "source": "lyrics_ready", "dest": "lyrics_formatted"},
    {"trigger": "music_gen_started", "source": "lyrics_formatted", "dest": "music_generating"},
    {"trigger": "music_gen_complete", "source": "music_generating", "dest": "music_generated"},
    {"trigger": "listening_started", "source": "music_generated", "dest": "listening_review"},
    {"trigger": "transcoding_started", "source": "listening_review", "dest": "transcoding"},
    {"trigger": "transcoding_complete", "source": "transcoding", "dest": "transcoding_done"},
    {"trigger": "packaging_started", "source": "transcoding_done", "dest": "packaging"},
    {"trigger": "packaging_complete", "source": "packaging", "dest": "completed"},
]
```

Orchestrator.complete_phase 也需要补全对所有 phase 的状态推进逻辑。

---

## 8. 前端数据接入

### Phase 1 概念结果回显

- ConceptReview 已接入（✅ 上次实现）
- Phase 1 执行后 album.title 等字段自动更新
- Dashboard 不再显示 `title: null`

### SongDetail 接入真实数据

- 页面加载时调 `GET /api/albums/{id}/tracks/{tid}/rounds`
- 渲染最新一轮的 Agent 输出 JSON（歌词/编曲/押韵/市场/评分）
- 去掉所有硬编码数据

### 其他 Phase 页面

- MusicGenPanel：从 `/generation-queue` 获取实时 prompt 状态
- TakePlayer：从 `/takes` 获取 Take 列表，展示真实文件信息
- ReleasePanel：从 `/deliverables` 获取交付物状态

### 通用改进

- 专辑列表筛选按钮：前端 `filter()` 过滤（非后端）
- 统一的 Loading / Empty / Error 状态组件

---

## 9. 执行计划

| # | 任务 | 优先级 |
|---|------|--------|
| 1 | 补全状态机 + Orchestrator 的 Phase 3-6 转移 | P0 |
| 2 | Phase 2 execute 端点（含并行调度） | P0 |
| 3 | Phase 1 结果写回 album.title / track 字段 | P0 |
| 4 | Phase 3 execute 端点（歌词提取） | P1 |
| 5 | Phase 4 三步骤端点 + CLI Worker 集成 | P1 |
| 6 | Phase 5 转码端点 + 前端 Take 选择联动 | P1 |
| 7 | Phase 6 execute 端点 + 打包 | P1 |
| 8 | SongDetail 接入真实 API 数据 | P0 |
| 9 | Dashboard 数据刷新 + Phase 时间线修复 | P1 |
| 10 | 其他前端页面接入真实数据 | P1 |
| 11 | 并发数配置 + 筛选按钮修复 + 杂项 | P2 |
| 12 | UI 全面美化（ui-ux-pro-max） | P1 |

---

## 10. 非目标

- 不做 Phase 2 的多轮自动循环（前端手动点"下一轮"）
- 不做 Phase 4 的队列持久化（服务重启队列丢失）
- 不做实时 WebSocket 推送（用轮询代替）

---

## 11. UI 全面美化（ui-ux-pro-max）

当前 UI 已经经过一次 frontend-design skill 美化，但仍有提升空间：
- 部分页面视觉层次不够分明
- 微交互和动效细节偏少
- 部分组件的状态反馈不够精致（loading/empty/error）

本轮使用 `ui-ux-pro-max` skill 对所有 11 个页面/组件进行二次精修，
涵盖：色彩系统微调、字体层级优化、阴影和光泽细节、过渡动效、
hover/active 状态反馈、loading skeleton、空状态插画、错误状态提示。

### 范围

所有前端页面和组件，重点是：
- 主页面（Hero 动画、卡片交互）
- 侧栏导航（活跃状态光泽、logo 动画）
- 新建专辑向导（步骤切换动效、表单微交互）
- 专辑 Dashboard（Phase 时间线动画、曲目列表 hover）
- 单曲详情页（Tab 切换、评分动效）
- Phase 1 概念页（生成进度展示、结果卡片）
- Phase 4 音乐生成页（队列动画、审查状态）
- Phase 5 听选页（播放器 UI、波形动画）
- Phase 6 发布页（预览卡片、导出动画）
- 设置页（表单验证反馈、保存状态）

### 调用方式

```text
调用 ui-ux-pro-max skill，对 APP/frontend/ 下所有组件进行审查和美化管理
```

### 约束

- 保持现有暖色模拟唱片风格基调不变
- 保持现有字体系统不变（Playfair Display + Inter + Noto Sans SC + JetBrains Mono）
- 不改变现有组件功能和 API 接口
- 所有改动仅限于 CSS/Tailwind 类和 Framer Motion 动画参数
