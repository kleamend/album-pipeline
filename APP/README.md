> Status: this in-repo app copy is deprecated for active development after the external repo migration.
> Use the standalone app repo for ongoing implementation work.

# Album Pipeline App 实现文档

> 目标：在不依赖 OpenClaw 的前提下，实现一个可独立运行的专辑生产 App。  
> 当前策略：先绑定 MiniMax 生态，优先通过 MiniMax CLI 调度音乐、图片、视频生成能力。  
> 文档用途：作为后续 AI 编程、产品拆解、架构实现、UI 设计的主参考文档。

---

## 1. 产品定位

这个 App 不是一个简单的“生成音乐”工具，而是一个完整的 **AI 专辑生产工作台**。

它要把当前仓库中由 OpenClaw Skill 驱动的专辑流水线，转化成一个独立产品：

```text
专辑概念
  -> 曲目策划
  -> 单曲歌词/编曲/押韵/市场/评分
  -> 标准歌词提取
  -> MiniMax 音乐生成
  -> 用户听选 Take
  -> 音频转码和平台校验
  -> 封面/宣传视频/宣传文案/艺人故事
  -> 发布物料打包
```

App 的核心价值有三点：

1. **把复杂专辑生产过程产品化**  
   用户不需要理解 `SKILL.md`、文件契约、CLI 参数、ffmpeg 校验、版本命名等底层细节。

2. **把 AI 生产变成可追踪的项目流程**  
   每首歌、每一轮、每个 Agent、每个 prompt、每个音频 take 都有版本、有状态、有来源、有验收结果。

3. **保留人的审美决策**  
   用户需要在关键节点参与确认：专辑概念、单曲方向、音乐 take、封面方案、最终发行包。

---

## 2. 独立于 OpenClaw 的实现原则

当前仓库中的 `SKILL.md` 文件本质上是“业务 SOP + Agent Prompt + 文件契约”。  
独立 App 不应该直接依赖 OpenClaw 的 `sessions_spawn`、`sessions_yield` 或子 Agent 机制。

App 自己实现三层能力即可：

```text
Workflow Orchestrator
  负责阶段状态、任务编排、重试、用户等待点

Role Agents
  负责文字生产、审核、评分、结构化输出

Tool Workers
  负责 MiniMax CLI、ffmpeg、ffprobe、zip、文件处理
```

### 2.1 不复刻 OpenClaw

不要做一个通用 Agent 平台。  
第一版只做“专辑流水线专用的轻量 Agent Runtime”。

错误方向：

```text
让 Agent 自己决定读什么文件、改什么文件、下一步做什么
```

推荐方向：

```text
后端代码决定流程
Agent 只接收明确输入
Agent 只返回结构化输出
后端负责校验、保存和进入下一步
```

### 2.2 App 内 Agent 的最小定义

```ts
type AgentDefinition = {
  key: string
  name: string
  phase: string
  rolePrompt: string
  inputSchema: JsonSchema
  outputSchema: JsonSchema
  allowedArtifactKinds: ArtifactKind[]
  maxRetries: number
}
```

Agent 的运行流程：

```text
1. Orchestrator 创建 ExpertRun
2. Agent Runtime 读取 AgentDefinition
3. 组装输入上下文
4. 调用 LLM
5. 解析结构化输出
6. 运行 validator
7. 保存 Artifact 和 ExpertRun 结果
8. Orchestrator 决定下一步
```

---

## 3. 当前范围和非目标

### 3.1 当前范围

第一阶段 App 要覆盖：

- 主页面
- 新建专辑
- 回顾过往专辑
- MiniMax API/CLI 配置提醒
- 网易云音乐账号连接入口
- Phase 1 到 Phase 6 的完整产品流程设计
- 独立轻量 Agent Runtime
- MiniMax CLI 调用封装
- 本地文件夹和数据库混合存储
- 项目产物导出

### 3.2 非目标

第一版不做以下内容：

- 不做通用工作流平台
- 不做多租户 SaaS 计费系统
- 不做完全自动上传网易云音乐
- 不保存用户网易云明文密码
- 不依赖非官方逆向接口作为核心发布链路
- 不要求一开始支持 Suno、Udio、OpenAI 等多生态音乐模型

### 3.3 网易云能力边界

主页面需要有“登录网易云音乐账号”的能力，但这部分必须设计为可替换 Adapter。

原因：

- 公开可见的网易云音乐 API 资料大量来自第三方或逆向项目，不应默认视作稳定官方发布能力。
- App 可以先实现“账号连接状态、用户信息展示、跳转网易云音乐人平台、生成上传清单”。
- 真正的自动登录、自动上传、自动发布，必须在确认官方授权 API 或可合法使用的接入方式后再启用。

MVP 的网易云策略：

```text
登录入口存在
  -> 支持账号连接状态
  -> 支持保存用户昵称/UID/主页链接
  -> 支持打开网易云音乐人发布后台
  -> 支持生成上传清单
  -> 暂不自动提交专辑
```

如果后续确认官方 API：

```text
NeteaseProvider
  -> OAuth/QR 登录
  -> 获取用户信息
  -> 获取音乐人身份
  -> 上传音频/歌词/封面
  -> 创建专辑草稿
  -> 提交审核
```

---

## 4. 推荐技术路线

### 4.1 默认推荐：Local-first Web App

推荐先做成本地运行的 Web App：

```text
Browser UI
  -> Local Backend API
  -> Local Worker Queue
  -> Local File Workspace
  -> MiniMax CLI
  -> ffmpeg / ffprobe
```

优点：

- MiniMax CLI 最容易被本地后端调度。
- 用户音频、封面、视频文件可以先留在本机。
- 不需要一开始做复杂的云端文件存储和安全合规。
- 未来可以包装成 Tauri/Electron 桌面 App。

### 4.2 技术栈建议

#### 前端

```text
Next.js
React
TypeScript
Tailwind CSS
Framer Motion
Zustand 或 TanStack Query
WaveSurfer.js 或自定义 audio player
```

#### 后端

两种可选：

```text
方案 A：Next.js API Routes / Server Actions
适合 MVP，前后端一体，开发快。

方案 B：FastAPI
适合更清晰地管理 worker、CLI、文件系统和长任务。
```

推荐第一版：

```text
Next.js 前端 + FastAPI 后端
```

原因：

- 前端交互复杂，Next.js 适合做漂亮 UI。
- 后端需要调用本地 CLI、ffmpeg、文件系统，FastAPI 更直接。
- 两者边界清晰，方便后续替换 Worker 层。

#### 数据库

```text
Postgres
```

MVP 可用：

```text
SQLite
```

但如果后续要做多人协作或云端版本，直接上 Postgres 更稳。

#### 队列

MVP：

```text
Redis + BullMQ
```

Python 后端：

```text
Redis + Celery
```

长期更稳：

```text
Temporal
```

第一版建议：

```text
Celery + Redis
```

原因：音频处理、CLI 调用、文件校验这类后台任务非常适合 Celery。

#### 文件存储

MVP：

```text
本地 workspace/projects/{albumId}/
```

未来：

```text
S3 / R2 / OSS / MinIO
```

#### 媒体工具

```text
MiniMax CLI
ffmpeg
ffprobe
zip
```

---

## 5. 推荐项目结构

未来 `APP/` 可以扩展成真实项目目录：

```text
APP/
├── README.md                         # 本实现文档
├── frontend/
│   ├── package.json
│   ├── app/
│   │   ├── page.tsx                  # 主页面
│   │   ├── albums/
│   │   │   ├── page.tsx              # 过往专辑列表
│   │   │   ├── new/page.tsx          # 新建专辑向导
│   │   │   └── [albumId]/
│   │   │       ├── page.tsx          # 专辑 Dashboard
│   │   │       ├── concept/page.tsx  # 概念阶段
│   │   │       ├── tracks/page.tsx   # 曲目工作台
│   │   │       ├── generate/page.tsx # 音乐生成
│   │   │       ├── listen/page.tsx   # 听选
│   │   │       ├── assets/page.tsx   # 封面/视频/宣传
│   │   │       └── release/page.tsx  # 打包发布
│   │   ├── settings/
│   │   │   ├── page.tsx              # 全局设置
│   │   │   └── providers/page.tsx    # MiniMax / 网易云连接
│   │   └── components/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── stores/
│       └── styles/
├── backend/
│   ├── pyproject.toml
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── workflow/
│   │   │   ├── agents/
│   │   │   ├── providers/
│   │   │   ├── artifacts/
│   │   │   └── validation/
│   │   └── workers/
│   ├── prompts/
│   │   ├── phase1/
│   │   ├── phase2/
│   │   ├── phase3/
│   │   ├── phase4/
│   │   └── phase6/
│   └── tests/
├── workspace/
│   └── projects/
└── docker-compose.yml
```

---

## 6. 主页面设计

主页面是用户进入 App 的第一印象。  
它要传达：这是一个有创造力、有生产力、有仪式感的音乐工作台。

### 6.1 主页面目标

主页面必须完成以下任务：

1. 展示品牌感和情绪氛围。
2. 引导用户制作新专辑。
3. 允许用户回顾过往专辑。
4. 显示 MiniMax API/CLI 配置状态。
5. 显示网易云音乐账号连接状态。
6. 用漂亮动画展示文案：

```text
HELLO，今天你想要如何用音乐改变世界呢
```

### 6.2 主页面信息架构

```text
顶部区域
  Logo / App Name
  MiniMax 状态
  网易云状态
  设置入口

Hero 区域
  动画问候语
  简短副标题
  主操作：制作新专辑
  次操作：回顾过往专辑

状态提示区
  MiniMax API 未配置提醒
  MiniMax CLI 未检测到提醒
  网易云未连接提醒

最近项目区
  最近 3 到 6 张专辑
  每张显示封面/进度/最近更新时间/当前阶段

底部辅助区
  当前工作目录
  版本号
  帮助文档入口
```

### 6.3 视觉风格

建议风格：

```text
深色舞台背景
高质感音频波形
细线网格
动态歌词粒子
轻微唱片旋转元素
霓虹但克制
```

不要做成普通后台管理系统。  
它应该像一个“夜间录音棚 + 专辑制作控制台”。

### 6.4 主页面动画

动画要求：

```text
打开 App
  -> 背景出现缓慢流动的音频波形
  -> 中央文字逐字出现：HELLO
  -> 停顿 300ms
  -> 继续出现：今天你想要如何用音乐改变世界呢
  -> 下方两个主按钮淡入
```

动画细节：

- `HELLO` 可以使用较大字号，像舞台灯亮起。
- 后半句用中文，节奏像歌词逐字浮现。
- 背景波形不应遮挡文字。
- 动画结束后文字保持静止，不循环打扰用户。
- 背景可以保持低幅度运动，暗示音乐正在流动。

文案：

```text
HELLO，
今天你想要如何用音乐改变世界呢
```

副标题：

```text
从一个念头开始，完成一张可发布的 AI 专辑。
```

主按钮：

```text
制作新专辑
```

次按钮：

```text
回顾过往专辑
```

### 6.5 MiniMax 配置提醒

主页面必须显示 MiniMax 当前状态。

状态枚举：

```ts
type MiniMaxStatus =
  | "not_configured"
  | "api_key_missing"
  | "cli_missing"
  | "cli_not_authenticated"
  | "ready"
  | "error"
```

UI 文案：

```text
MiniMax API 尚未配置
要生成音乐、封面和视频，需要先写入 MiniMax API 配置。
```

操作：

```text
去配置
检测 CLI
查看配置指南
```

检测项：

```text
minimax CLI 是否存在
mmx CLI 是否存在
API Key 是否存在
能否执行简单 health check
当前模型是否可用
```

注意：

- 不在前端明文展示完整 API Key。
- 只显示脱敏形式，例如 `mk-****-A9F2`。
- API Key 应存储在后端安全存储中，本地版可用系统 keychain 或加密配置文件。

### 6.6 网易云登录入口

主页面必须有网易云账号连接入口。

UI 状态：

```ts
type NeteaseStatus =
  | "not_connected"
  | "connected_manual"
  | "connected_verified"
  | "expired"
  | "unsupported"
  | "error"
```

MVP 文案：

```text
网易云音乐账号未连接
连接后可生成更完整的上传清单，并快速进入发布流程。
```

连接方式：

```text
手动填写昵称/UID/主页链接
打开网易云音乐人平台
未来接入官方授权登录
```

安全要求：

- 不保存网易云明文密码。
- 不鼓励用户粘贴 Cookie 作为默认方案。
- 如果未来支持 Cookie/QR 登录，必须放在高级设置，并明确风险。
- 自动发布能力必须等官方授权接入确认后再开启。

---

## 7. 制作专辑流程

点击“制作新专辑”后，进入一个清晰的分步向导。

### 7.1 新建专辑向导

页面路径：

```text
/albums/new
```

表单字段：

```text
专辑主题
曲目数量
语言
是否包含英文版
是否包含纯音乐曲目
目标听众
参考风格
预计总时长
是否需要封面
是否需要宣传视频
是否准备发布到网易云
```

语言选项：

```text
中文
英文
中文+英文
纯音乐
混合
```

创建后生成：

```text
AlbumProject
Project Workspace
Phase 1 pending
docs/album-overview.md skeleton
songs/T{N}-placeholder.md skeleton
```

### 7.2 专辑 Dashboard

页面路径：

```text
/albums/{albumId}
```

Dashboard 要显示：

- 专辑名
- 当前阶段
- 总进度
- 曲目数量
- 已完成曲目
- 当前阻塞点
- 最近生成的产物
- 下一步推荐操作
- 当前 MiniMax/网易云状态

阶段进度：

```text
Phase 1 概念设计
Phase 2 单曲创作
Phase 3 歌词标准化
Phase 4 音乐生成
Phase 5 听选与转码
Phase 6 发布物料
```

每个 Phase 状态：

```ts
type PhaseStatus =
  | "pending"
  | "running"
  | "waiting_user"
  | "failed"
  | "completed"
  | "skipped"
```

---

## 8. App 内流水线设计

### 8.1 Phase 1：专辑概念

目标：

```text
从用户输入的主题生成专辑核心概念、叙事轴、曲目表、市场定位和音乐调性主线。
```

输入：

```text
Album Brief
用户补充说明
参考风格
曲目数
语言
```

Agent：

```text
ConceptCreativeAgent
ConceptMarketAgent
ConceptMusicAgent
ConceptReviewerAgent
```

执行策略：

```text
ConceptCreativeAgent
ConceptMarketAgent
ConceptMusicAgent
  三者可并行

ConceptReviewerAgent
  等前三者完成后运行
```

输出：

```text
docs/album-overview.md
AlbumConcept artifact
TrackPlan artifacts
Phase 1 score
```

用户等待点：

```text
用户必须确认专辑概念后，才能进入 Phase 2。
```

UI：

- 左侧：专辑概念
- 中间：曲目表
- 右侧：评分和修改建议
- 底部操作：接受方案 / 定向修改 / 重新生成

### 8.2 Phase 2：单曲创作

目标：

```text
为每首歌生成完整的歌词、编曲、Sound Design、押韵分析、市场评估和评分。
```

每首歌 Agent 顺序：

```text
LyricsAgent
  -> ArrangementAgent
  -> RhymeAgent
  -> MarketAgent
  -> ScoringAgent
```

多首歌并行：

```text
T1 group
T2 group
T3 group
...
```

单首歌内部串行：

```text
同一首歌内，五个 Agent 必须按顺序运行。
```

轮次规则：

```text
最少 3 轮
最多 6 轮
Round >= 3 且 score >= 80 才能定稿
Round 6 仍未达标，则取最高分版本，但标记为 needs_review
```

输出：

```text
songs/T{N}-{track-name}.md
TrackDraft artifact
TrackScore artifact
```

UI：

- 曲目列表
- 每首歌当前轮次
- 当前 Agent
- 分数趋势
- 问题清单
- 歌词/编曲/押韵/市场/评分 Tab
- “继续下一轮”或“人工接受当前版本”

### 8.3 Phase 3：歌词标准化

目标：

```text
从 song markdown 中提取干净歌词，供 MiniMax 音乐生成使用。
```

Agent：

```text
LyricsFormatterAgent
```

输出：

```text
generate/lyrics/cn/T{N}-{track}.txt
generate/lyrics/en/T{N}-{track}.txt
generate/lyrics/metadata.json
generate/lyrics/validation.txt
```

校验：

```text
结构标签合法
纯歌词长度 <= 3500
无编曲描述混入歌词
每首歌都有对应语言歌词
纯音乐曲目标记 has_lyrics = false
```

UI：

- 歌词文件列表
- 字数统计
- 结构标签检测
- 问题高亮
- 重新提取按钮

### 8.4 Phase 4：音乐生成

目标：

```text
生成每首歌的 3 个 MiniMax Prompt，并调用 MiniMax CLI 生成 3 个 Take。
```

Agent：

```text
MusicPromptGeneratorAgent
PromptReviewerAgent
```

Worker：

```text
MiniMaxMusicWorker
```

Prompt 版本：

```text
p1 编曲忠实型
p2 情绪叙事型
p3 听感质感型
```

输出：

```text
generate/prompts/T{N}-{track}-prompt1.txt
generate/prompts/T{N}-{track}-prompt2.txt
generate/prompts/T{N}-{track}-prompt3.txt
generate/prompts/index.json
generate/cn/T{N}-{track}-p1.mp3
generate/cn/T{N}-{track}-p2.mp3
generate/cn/T{N}-{track}-p3.mp3
generate/en/T{N}-{track}-p1.mp3
...
```

CLI 调用由 Worker 封装，不在 UI 或 Agent 中直接拼命令。

### 8.5 Phase 5：听选与转码

目标：

```text
用户听选每首歌最佳 Take，然后转码到平台标准。
```

用户决策：

```text
每首歌每种语言选择 p1/p2/p3 中一个
```

Worker：

```text
AudioTranscodeWorker
AudioQualityVerifyWorker
```

输出：

```text
generate/cn_320k/T{N}-{track}-pX.mp3
generate/en_320k/T{N}-{track}-pX.mp3
generate/loudness-report.txt
```

校验：

```text
bitrate = 320000
sample_rate = 44100
loudness = -14 LUFS ± 0.5
duration >= 60s
duration <= 360s
file_size >= 100KB
```

UI：

- 每首歌播放器
- p1/p2/p3 横向对比
- Prompt 策略标签
- 用户备注
- 一键选定
- 转码进度
- 校验报告

### 8.6 Phase 6：发布物料

目标：

```text
生成专辑发布所需的文档、封面、视频、平台检查和 zip 包。
```

Agent：

```text
AlbumOverviewUpdaterAgent
PromotionalWriterAgent
ArtistStoryWriterAgent
CoverConceptAgent
CoverPromptAgent
PlatformCheckAgent
```

Worker：

```text
MiniMaxImageWorker
MiniMaxVideoWorker
PackagingWorker
```

输出：

```text
docs/album-overview.md
docs/promotional-materials.md
docs/artist-story-cn.md
docs/artist-story-en.md
docs/artist-story-short.md
docs/artist-story-quotes.md
docs/cover-concept.md
docs/platform-check.txt
docs/promo-video.mp4
generate/covers/album-cover-p1.png
generate/covers/album-cover-p2.png
generate/covers/album-cover-p3.png
generate/covers/tracks/T{N}-{track}-p{1,2,3}.png
{album-name}-promotional-materials.zip
```

UI：

- 文案预览
- 封面方案对比
- 单曲封面对比
- 宣传视频预览
- 平台检查结果
- 导出 zip
- 打开网易云音乐人上传页

---

## 9. Agent 清单

### 9.1 Phase 1 Agents

#### ConceptCreativeAgent

职责：

- 生成专辑名称
- 生成核心概念
- 生成核心悖论
- 生成叙事轴
- 生成曲目表

输入：

```text
Album Brief
Track Count
Language
Reference Style
```

输出结构：

```json
{
  "album_name_cn": "string",
  "album_name_en": "string",
  "core_concept": "string",
  "core_paradox": "string",
  "narrative_axes": [],
  "tracks": []
}
```

#### ConceptMarketAgent

职责：

- 市场定位
- 目标人群
- 传播概念
- 风险和应对
- 英文专辑介绍

#### ConceptMusicAgent

职责：

- 音乐风格
- 调性主线
- 曲目间动态关系
- 相邻曲目疲劳检测
- 开头和结尾设计

#### ConceptReviewerAgent

职责：

- 4 维评分
- 低分项
- 修改建议

评分：

```text
概念原创性 25
叙事连贯性 25
市场潜力 25
音乐一致性 25
```

### 9.2 Phase 2 Agents

#### LyricsAgent

职责：

- 中文歌词
- 英文歌词
- 纯音乐描述
- 按上一轮问题清单定向修改

限制：

- 只能写 lyrics 类 artifact。
- 不能改编曲、市场、评分。

#### ArrangementAgent

职责：

- 完整编曲设计
- 段落时间轴
- 人声处理
- 乐器进入退出
- Sound Design

#### RhymeAgent

职责：

- 中文韵脚分析
- 英文押韵分析
- Hook 韵脚统一性
- 韵脚与编曲对齐
- 纯音乐节奏/音色分析

#### MarketAgent

职责：

- 单曲卖点
- 目标听众
- 平台适配
- 风险
- 封面高光文案

#### ScoringAgent

职责：

- 5 维评分
- 问题清单
- 是否进入下一轮
- 分数历史

评分：

```text
韵律/器乐表现力 20
市场 20
结构 20
哲学 20
编排 20
```

### 9.3 Phase 3 到 Phase 6 Agents

```text
LyricsFormatterAgent
MusicPromptGeneratorAgent
PromptReviewerAgent
AlbumOverviewUpdaterAgent
PromotionalWriterAgent
ArtistStoryWriterAgent
CoverConceptAgent
CoverPromptAgent
PlatformCheckAgent
```

---

## 10. Tool Workers 清单

### 10.1 MiniMaxMusicWorker

职责：

- 检测 MiniMax CLI
- 调用 `minimax music generate`
- 处理限流
- 保存生成日志
- 校验 mp3 是否存在和非空

输入：

```json
{
  "track_id": "uuid",
  "language": "cn",
  "prompt_file": "path",
  "lyrics_file": "path | null",
  "output_file": "path",
  "model": "music-2.6"
}
```

输出：

```json
{
  "audio_take_id": "uuid",
  "output_file": "path",
  "duration": 204.3,
  "file_size": 7800000,
  "status": "completed"
}
```

### 10.2 MiniMaxImageWorker

职责：

- 调用 `mmx image generate`
- 输出 2048x2048 PNG
- 校验尺寸和文件大小

### 10.3 MiniMaxVideoWorker

职责：

- 调用 `mmx video generate`
- 使用专辑封面作为 first-frame
- 输出 6 秒宣传视频
- 校验文件大小和时长

### 10.4 AudioTranscodeWorker

职责：

- 调用 ffmpeg 转码
- 响度归一化
- 输出 320kbps / 44.1kHz / -14 LUFS

### 10.5 AudioQualityVerifyWorker

职责：

- 调用 ffprobe
- 读取 bitrate、sample_rate、duration
- 调用 ffmpeg loudnorm 输出响度数据
- 生成 `loudness-report.txt`

### 10.6 PackagingWorker

职责：

- 检查交付物齐全
- 生成 zip
- 生成上传清单
- 记录最终包路径

---

## 11. 数据模型

### 11.1 AlbumProject

```ts
type AlbumProject = {
  id: string
  title: string | null
  titleEn: string | null
  slug: string
  status: ProjectStatus
  languageMode: "chinese" | "english" | "bilingual" | "instrumental" | "mixed"
  trackCount: number
  currentPhase: PipelinePhase
  workspacePath: string
  createdAt: string
  updatedAt: string
}
```

### 11.2 Track

```ts
type Track = {
  id: string
  albumId: string
  index: number
  title: string
  titleEn: string | null
  language: "chinese" | "english" | "bilingual" | "instrumental"
  narrativeAxis: string
  coreHook: string
  coreParadox: string
  emotionalArc: string
  arrangementStyle: string
  estimatedDuration: string
  finalDuration: number | null
  status: TrackStatus
}
```

### 11.3 PhaseRun

```ts
type PhaseRun = {
  id: string
  albumId: string
  phase: PipelinePhase
  status: PhaseStatus
  startedAt: string | null
  completedAt: string | null
  errorMessage: string | null
  retryCount: number
}
```

### 11.4 ExpertRun

```ts
type ExpertRun = {
  id: string
  albumId: string
  trackId: string | null
  phaseRunId: string
  agentKey: string
  round: number | null
  status: "pending" | "running" | "failed" | "completed"
  inputArtifactIds: string[]
  outputArtifactIds: string[]
  score: number | null
  errorMessage: string | null
  startedAt: string | null
  completedAt: string | null
}
```

### 11.5 Artifact

```ts
type Artifact = {
  id: string
  albumId: string
  trackId: string | null
  phase: PipelinePhase
  kind: ArtifactKind
  version: number
  path: string
  mimeType: string
  title: string
  metadata: Record<string, unknown>
  createdBy: "agent" | "worker" | "user" | "system"
  createdAt: string
}
```

ArtifactKind：

```text
album_overview_md
song_design_md
lyrics_txt
lyrics_metadata_json
prompt_txt
prompt_index_json
audio_raw_mp3
audio_final_mp3
loudness_report_txt
cover_prompt_txt
cover_png
promo_video_mp4
promotional_materials_md
artist_story_md
platform_check_txt
package_zip
upload_checklist_md
```

### 11.6 AudioTake

```ts
type AudioTake = {
  id: string
  albumId: string
  trackId: string
  language: "cn" | "en" | "instrumental"
  promptVersion: 1 | 2 | 3
  strategy: "arrangement_faithful" | "emotional_narrative" | "sonic_texture"
  rawArtifactId: string
  finalArtifactId: string | null
  selected: boolean
  userNote: string | null
  duration: number | null
  fileSize: number | null
  qualityStatus: "unchecked" | "passed" | "failed"
}
```

### 11.7 ProviderCredential

```ts
type ProviderCredential = {
  id: string
  provider: "minimax" | "netease"
  status: "not_configured" | "ready" | "expired" | "error"
  displayName: string | null
  encryptedPayload: string
  createdAt: string
  updatedAt: string
}
```

---

## 12. 文件工作区设计

每个专辑项目保留一个可导出的文件夹。

```text
workspace/projects/{album-slug}/
├── album.json
├── docs/
│   ├── album-overview.md
│   ├── promotional-materials.md
│   ├── artist-story-cn.md
│   ├── artist-story-en.md
│   ├── artist-story-short.md
│   ├── artist-story-quotes.md
│   ├── cover-concept.md
│   ├── platform-check.txt
│   └── promo-video.mp4
├── songs/
│   ├── T1-track-name.md
│   └── ...
├── generate/
│   ├── lyrics/
│   ├── prompts/
│   ├── cn/
│   ├── en/
│   ├── cn_320k/
│   ├── en_320k/
│   ├── covers/
│   └── loudness-report.txt
├── assets/
├── logs/
└── packages/
```

原则：

- 数据库保存状态和索引。
- 文件夹保存真实产物。
- Artifact 表中记录文件路径。
- 用户可以随时导出整个项目文件夹。

---

## 13. API 设计

### 13.1 Project API

```text
GET    /api/albums
POST   /api/albums
GET    /api/albums/{albumId}
PATCH  /api/albums/{albumId}
DELETE /api/albums/{albumId}
```

### 13.2 Workflow API

```text
POST /api/albums/{albumId}/phases/{phase}/start
POST /api/albums/{albumId}/phases/{phase}/retry
POST /api/albums/{albumId}/phases/{phase}/cancel
GET  /api/albums/{albumId}/phases
GET  /api/albums/{albumId}/runs
```

### 13.3 User Decision API

```text
POST /api/albums/{albumId}/decisions/concept
POST /api/albums/{albumId}/decisions/track
POST /api/albums/{albumId}/decisions/audio-take
POST /api/albums/{albumId}/decisions/cover
```

### 13.4 Artifact API

```text
GET  /api/albums/{albumId}/artifacts
GET  /api/artifacts/{artifactId}
GET  /api/artifacts/{artifactId}/download
POST /api/artifacts/{artifactId}/restore
```

### 13.5 Provider API

```text
GET  /api/providers/minimax/status
POST /api/providers/minimax/configure
POST /api/providers/minimax/check

GET  /api/providers/netease/status
POST /api/providers/netease/connect-manual
POST /api/providers/netease/open-publisher
```

### 13.6 Realtime API

使用 SSE 或 WebSocket：

```text
GET /api/albums/{albumId}/events
```

事件类型：

```text
phase_started
phase_completed
expert_started
expert_completed
worker_started
worker_progress
worker_completed
artifact_created
validation_failed
waiting_user
error
```

---

## 14. Workflow Orchestrator 设计

### 14.1 状态机

Project 状态：

```text
draft
concept_running
concept_review
songwriting_running
lyrics_ready
music_generating
listening_review
transcoding
packaging
completed
failed
archived
```

Phase 状态：

```text
pending
running
waiting_user
failed
completed
skipped
```

Track 状态：

```text
planned
round_running
needs_revision
finalized
needs_review
music_generated
take_selected
transcoded
packaged
```

### 14.2 Orchestrator 规则

核心规则必须由代码控制：

```text
Phase 1 未完成，不允许进入 Phase 2
Phase 1 用户未确认，不允许进入 Phase 2
Phase 2 任一 Track 未定稿，不允许进入 Phase 3
Phase 3 歌词校验失败，不允许进入 Phase 4
Phase 4 任一 Take 缺失，不允许进入 Phase 5
Phase 5 任一 Track 未选定，不允许转码
Phase 5 音频校验失败，不允许进入 Phase 6
Phase 6 文件缺失，不允许打包完成
```

### 14.3 可重试性

每个任务必须能重试。

重试策略：

```text
LLM Agent 失败：最多自动重试 2 次
MiniMax CLI 失败：最多自动重试 2 次
429 限流：等待 3 到 10 秒后重试
ffmpeg 失败：不自动重试，提示用户查看源文件
校验失败：允许用户选择重新生成或人工接受
```

### 14.4 失败恢复

任何任务失败后，项目不能丢失。

失败后 UI 应显示：

- 失败阶段
- 失败任务
- 错误日志摘要
- 重试按钮
- 跳过按钮，如果允许
- 查看日志按钮
- 回滚到上一版本按钮

---

## 15. MiniMax CLI 集成

### 15.1 CLI 检测

App 启动时检查：

```bash
which minimax
which mmx
minimax --version
mmx --version
```

状态写入：

```text
MiniMax CLI: found / missing
MMX CLI: found / missing
Auth: ready / missing / unknown
```

### 15.2 API Key 配置

配置页面字段：

```text
MiniMax API Key
Group ID / Account ID（如果 CLI 需要）
默认音乐模型
默认图片模型
默认视频模型
输出目录
并发数
```

默认模型：

```text
music: music-2.6
image: image-01
video: MiniMax-Hailuo-2.3
```

注意：

具体认证字段以当前 MiniMax CLI 文档为准。App 内部应通过 Provider Config 抽象，不要在业务代码里写死认证字段名称。

### 15.3 Music CLI Wrapper

后端不要在业务流程里直接拼接 shell 字符串。  
必须通过 wrapper：

```python
class MiniMaxMusicProvider:
    def generate_music(
        self,
        prompt_file: Path,
        lyrics_file: Path | None,
        output_file: Path,
        model: str = "music-2.6",
        params: MusicParams
    ) -> MusicGenerationResult:
        ...
```

Wrapper 负责：

- 参数转义
- 路径校验
- 日志保存
- 超时控制
- 错误解析
- 429 限流处理
- 输出文件校验

### 15.4 Image CLI Wrapper

```python
class MiniMaxImageProvider:
    def generate_image(
        self,
        prompt_file: Path,
        output_dir: Path,
        output_prefix: str,
        width: int = 2048,
        height: int = 2048
    ) -> ImageGenerationResult:
        ...
```

### 15.5 Video CLI Wrapper

```python
class MiniMaxVideoProvider:
    def generate_video(
        self,
        prompt: str,
        output_file: Path,
        first_frame: Path | None,
        model: str = "MiniMax-Hailuo-2.3"
    ) -> VideoGenerationResult:
        ...
```

---

## 16. UI 页面详细说明

### 16.1 `/` 主页面

模块：

```text
AnimatedHero
PrimaryActions
ProviderStatusPanel
RecentAlbums
FooterStatus
```

组件：

```text
AnimatedGreeting
WaveformBackground
NewAlbumButton
PastAlbumsButton
MiniMaxStatusBadge
NeteaseStatusBadge
ProviderSetupCard
RecentAlbumTile
```

主操作：

```text
制作新专辑 -> /albums/new
回顾过往专辑 -> /albums
MiniMax 去配置 -> /settings/providers
网易云连接 -> /settings/providers?provider=netease
```

### 16.2 `/albums/new`

页面目标：

```text
收集 Concept Brief。
```

分步：

```text
Step 1: 核心主题
Step 2: 曲目和语言
Step 3: 风格和参考
Step 4: 发布目标
Step 5: 确认创建
```

创建成功后：

```text
跳转 /albums/{albumId}/concept
```

### 16.3 `/albums`

页面目标：

```text
查看历史项目。
```

展示：

- 封面缩略图
- 专辑名
- 当前阶段
- 进度
- 最后更新时间
- 是否已完成
- 是否有失败任务

筛选：

```text
全部
制作中
等待我确认
已完成
失败
归档
```

### 16.4 `/albums/{albumId}/concept`

页面目标：

```text
生成和确认专辑概念。
```

布局：

```text
左：Concept Brief
中：Album Overview Preview
右：Phase 1 Agent Runs 和评分
```

操作：

```text
开始概念生成
接受概念
局部修改
重新生成
进入单曲创作
```

### 16.5 `/albums/{albumId}/tracks`

页面目标：

```text
管理每首歌的多轮创作。
```

布局：

```text
左：Track List
中：当前 Track 文档
右：Round / Agent / Score / Issues
```

Tab：

```text
歌词
英文歌词
编曲
Sound Design
押韵
市场
评分
版本历史
```

### 16.6 `/albums/{albumId}/generate`

页面目标：

```text
生成 prompt 和音乐。
```

内容：

- prompt p1/p2/p3
- prompt 字数
- prompt 审查结果
- MiniMax 生成队列
- 当前并发数
- 失败重试
- 输出音频文件

### 16.7 `/albums/{albumId}/listen`

页面目标：

```text
听选最终 Take。
```

核心组件：

```text
TakeComparisonPlayer
PromptStrategyBadge
SelectionTable
TranscodePanel
QualityReport
```

### 16.8 `/albums/{albumId}/assets`

页面目标：

```text
制作封面、宣传视频、宣传文案、艺人故事。
```

Tab：

```text
封面概念
封面图片
宣传视频
宣传材料
艺人故事
```

### 16.9 `/albums/{albumId}/release`

页面目标：

```text
检查平台要求，导出最终发布包。
```

内容：

- 平台检查
- 音频文件清单
- 歌词文件清单
- 封面文件清单
- 视频文件
- 上传清单
- 导出 zip
- 打开网易云音乐人平台

---

## 17. Prompt 和结构化输出策略

### 17.1 Prompt 来源

当前仓库的 `SKILL.md` 内容应拆成：

```text
role prompt
input contract
output schema
validation checklist
```

不要把整份 `SKILL.md` 原样塞给模型。

### 17.2 结构化优先

Agent 输出必须尽量是 JSON，再由后端渲染成 Markdown。

例如 LyricsAgent 输出：

```json
{
  "round": 1,
  "language": "chinese",
  "lyrics": {
    "sections": [
      { "tag": "Intro", "lines": ["..."] },
      { "tag": "Verse", "lines": ["..."] },
      { "tag": "Hook", "lines": ["..."] }
    ],
    "char_count": 1200
  },
  "checklist": {
    "has_verse": true,
    "has_hook": true,
    "has_outro": true,
    "under_3500_chars": true
  }
}
```

后端负责渲染：

```markdown
## 歌词（Round1 · Draft）

...
```

### 17.3 Markdown 仍然是导出格式

即使内部使用结构化 JSON，也必须支持导出当前仓库约定的 Markdown 文件结构。

原因：

- 方便人工审阅。
- 方便继续复用当前流水线文档。
- 方便项目迁移。
- 方便 AI 调试。

---

## 18. 校验规则

### 18.1 通用校验

所有 Agent 输出都要校验：

```text
必填字段存在
字数限制
结构标签合法
枚举值合法
分数合计正确
引用的 track id 存在
输出语言符合项目语言设置
```

### 18.2 歌词校验

```text
纯歌词 <= 3500 字符
至少包含 Verse
至少包含 Hook 或 Chorus
建议包含 Outro
结构标签内不能包含描述性文字
和声只能用括号
```

### 18.3 Prompt 校验

音乐 Prompt：

```text
1500 <= 字符数 <= 2000
包含 Genre/Style/BPM/Key/Mood/Vocals/Instruments
不包含 dB 表格
不包含复杂时间戳
三版策略明显不同
```

封面 Prompt：

```text
字符数 <= 1000
包含 main visual
包含 color palette
包含 composition
包含 style/texture
包含 lighting
```

### 18.4 音频校验

```text
bit_rate = 320000
sample_rate = 44100
integrated loudness = -14 ± 0.5 LUFS
duration between 60 and 360 seconds
file size >= 100KB
```

---

## 19. 安全和隐私

### 19.1 MiniMax API Key

要求：

- 不在前端完整展示。
- 不写入 git。
- 本地存储时必须加密。
- 最好使用系统 keychain。
- 日志中必须脱敏。

### 19.2 网易云账号

要求：

- 不保存明文密码。
- 默认不要求 Cookie。
- 如果未来支持 Cookie，必须明确风险并放在高级设置。
- 上传行为必须有用户确认。

### 19.3 文件安全

要求：

- 所有项目路径必须限制在 workspace 下。
- 禁止用户输入路径穿越。
- 所有 shell 调用必须使用参数数组，不拼接未转义字符串。
- 删除文件前必须二次确认。

---

## 20. 日志和可观测性

每个任务要记录：

```text
task id
album id
track id
phase
agent/worker
start time
end time
status
input artifact ids
output artifact ids
model name
CLI command summary
error message
```

日志文件：

```text
workspace/projects/{album}/logs/workflow.log
workspace/projects/{album}/logs/minimax.log
workspace/projects/{album}/logs/ffmpeg.log
workspace/projects/{album}/logs/agent.log
```

UI 中至少提供：

- 最近运行日志
- 失败日志
- 下载完整日志

---

## 21. 测试计划

### 21.1 单元测试

- Agent output parser
- Markdown renderer
- File contract validator
- Workflow state transitions
- MiniMax command builder
- ffprobe output parser

### 21.2 集成测试

- 新建专辑到 Phase 1 完成
- 单首歌 3 轮创作
- 歌词提取
- prompt 生成和审查
- 假音频转码流程
- 打包流程

### 21.3 E2E 测试

使用一个 1 首歌的小专辑测试：

```text
创建项目
生成概念
确认概念
生成单曲
提取歌词
生成 prompt
模拟 MiniMax 输出音频
听选
转码
生成文案
打包
```

---

## 22. MVP 里程碑

### Milestone 1：主页面和项目系统

完成：

- 主页面
- 动画问候
- 新建专辑
- 过往专辑
- MiniMax 状态提示
- 网易云连接入口
- 本地 workspace 创建

### Milestone 2：Phase 1 概念生成

完成：

- Concept Brief 表单
- 4 个 Phase 1 Agents
- album-overview 生成
- 用户确认

### Milestone 3：Phase 2 单曲创作

完成：

- Track workspace
- 5 个单曲 Agents
- 3 到 6 轮状态机
- 分数和问题清单
- song markdown 导出

### Milestone 4：Phase 3/4 音乐生成

完成：

- 歌词提取
- prompt 生成
- prompt 审查
- MiniMax music CLI 调用
- raw mp3 管理

### Milestone 5：Phase 5 听选转码

完成：

- p1/p2/p3 播放器
- 用户选定
- ffmpeg 转码
- ffprobe 校验
- loudness report

### Milestone 6：Phase 6 发布物料

完成：

- 宣传文案
- 艺人故事
- 封面 prompt
- MiniMax image
- MiniMax video
- 平台检查
- zip 打包

---

## 23. 需要决策的问题

### 决策 1：App 形态

选项：

```text
A. 本地 Web App，浏览器打开 localhost
B. 桌面 App，Tauri/Electron 包装
C. 云端 SaaS
```

推荐：

```text
先做 A，后续包装成 B。
```

原因：

- MiniMax CLI 和 ffmpeg 本地调用最直接。
- 开发成本低。
- 用户数据留本地。

### 决策 2：数据库

选项：

```text
A. SQLite
B. Postgres
```

推荐：

```text
MVP SQLite，正式版 Postgres。
```

如果你确定未来要多人协作，则直接 Postgres。

### 决策 3：网易云登录深度

选项：

```text
A. 只做手动账号信息和上传清单
B. 接入第三方/逆向 API
C. 等官方授权能力确认后再自动上传
```

推荐：

```text
先做 A，保留 C 的 Adapter。
不建议 MVP 依赖 B。
```

### 决策 4：Agent 输出格式

选项：

```text
A. Agent 直接输出 Markdown
B. Agent 输出 JSON，后端渲染 Markdown
```

推荐：

```text
B。
```

原因：

- 更好校验。
- 更好版本管理。
- 更好做 UI 分块编辑。

### 决策 5：是否一开始完整实现 6 个 Phase

选项：

```text
A. 一次性做完整流水线
B. 先做 Phase 1/2，再做音乐生成
C. 先做主页面和 MiniMax 调度 Demo
```

推荐：

```text
B。
```

原因：

- 专辑概念和单曲文档是整个系统的源头。
- 先把文字生产和评分闭环跑顺，再接 MiniMax 生成更稳。

---

## 24. 后续 AI 编程时的硬规则

后续让 AI 根据本文档编程时，应遵守：

1. 不依赖 OpenClaw。
2. 不调用 `sessions_spawn` 或 `sessions_yield`。
3. Agent 不直接改任意文件。
4. 所有长任务通过 Worker/Queue 运行。
5. 所有生成结果必须保存 Artifact。
6. 所有用户关键决策必须落库。
7. MiniMax CLI 调用必须经过 Provider Wrapper。
8. ffmpeg/ffprobe 调用必须经过 Audio Worker。
9. 不保存网易云明文密码。
10. 主页面必须包含动画问候、制作新专辑、回顾过往专辑、MiniMax 配置提醒、网易云连接入口。

---

## 25. 第一版最小可交付定义

第一版做到下面这些，就可以算 App 骨架成立：

```text
1. 打开主页面，有漂亮动画问候。
2. 主页面可以进入新建专辑。
3. 主页面可以查看过往专辑。
4. 主页面显示 MiniMax 配置状态。
5. 主页面显示网易云连接入口。
6. 可以创建一个专辑项目。
7. 可以运行 Phase 1 生成专辑概念。
8. 可以确认概念并生成曲目工作区。
9. 可以对一首歌运行 Phase 2 的五个 Agent。
10. 可以导出 album-overview.md 和 songs/T1.md。
```

做到这里后，再继续接入 MiniMax 音乐生成。

