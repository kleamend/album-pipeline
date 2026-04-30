<p align="center">
  <img src="assets/banner-hero.png" alt="Album Pipeline Banner" width="100%" />
</p>

<h1 align="center">Album Pipeline</h1>

<p align="center">
  <strong>AI music album production pipeline — from concept to release, fully automated</strong><br/>
  <em>Powered by <a href="https://github.com/MiniMax-AI/cli">MiniMax CLI</a></em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="version" />
  <img src="https://img.shields.io/badge/OpenClaw-Skill-FF6B35" alt="openclaw skill" />
  <img src="https://img.shields.io/badge/AI-MiniMax-8B5CF6" alt="ai minimax" />
  <img src="https://img.shields.io/badge/phases-6-green" alt="phases" />
</p>

<p align="center">
  <a href="#live-demo">Live Demo</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#phase-details">Phase Details</a> ·
  <a href="#directory-structure">Directory Structure</a> ·
  <a href="#file-contracts">File Contracts</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

---

## Overview

Album Pipeline is an **OpenClaw Skill** that automates the entire AI music album creation process — from an initial concept conversation to a fully packaged, release-ready album with cover art, promotional materials, and platform-compliant audio deliverables. It runs entirely inside OpenClaw, orchestrating specialized sub-agents through 6 sequential phases.

**Key numbers:**
- **6 Phases** — concept → songwriting → lyrics → generation → selection → packaging
- **5 Experts** per song — lyrics, arrangement, rhyme, market, scoring — each a dedicated sub-agent
- **3–6 Rounds** per song — minimum 3 rounds, maximum 6, score must reach ≥ 80 to pass
- **Bilingual** — Chinese + English albums produced in parallel
- **Parallel by song, serial by expert** — N songs run simultaneously; within each song, experts work one after another

---

## Live Demo

**Album:** 《赝品候鸟》 / Counterfeit Migrants — 9 tracks, ~45 min, AI-generated concept album

| Version | Platform | Link |
|---------|----------|------|
| Chinese | NetEase Cloud Music | http://music.163.com/album/370761076/ |
| English | NetEase Cloud Music | http://music.163.com/album/370788757/ |

**Install this skill:** `openclaw skills install album-pipeline` ([ClawHub](https://clawhub.ai/skill/album-pipeline))

---

## Features

| | |
|---|---|
| 🎵 **End-to-End Automation** | 6 phases cover every step from concept to release |
| 🧠 **5-Expert Iteration** | Lyrics / Arrangement / Rhyme / Market / Scoring — each a dedicated sub-agent |
| 🔄 **Quality Gate** | Every song must score ≥ 80 before advancing; 3–6 automatic rounds |
| 📐 **Absolute File Contracts** | Inspired by Claude Code's design — strict input/output path and format contracts per phase; any deviation is a bug, not a feature |
| 📝 **High Skill Compliance** | Every phase is a self-contained SKILL.md with explicit read/write/deny scopes — designed for agents with strong instruction-following capability |
| 🌐 **Bilingual Albums** | Chinese + English lyrics, music, and promotional materials produced in parallel |
| 🎨 **AI Cover Generation** | 3 visual strategy prompts × MiniMax image-01 → album + track cover art |
| 🎬 **Promo Video Generation** | MiniMax video model → 6s promotional video with cover-frame reference |
| 📦 **One-Click Packaging** | Cover art, artist story, promo docs, videos, and platform compliance checks |

---

## Architecture

```
Phase 1: Album Concept         → Narrative arc + track lineup + tonal definition
           ↓
Phase 2: Song Writing           → 5 experts × 3–6 rounds per song (N songs in parallel)
           ↓
Phase 3: Lyrics Formatter       → Structure tagging (Verse/Chorus/Bridge) + char limit check
           ↓
Phase 4: Music Generator        → MiniMax CLI multi-Take parallel generation
           ↓
Phase 5: Audio Transcoder       → Listener selection + 320kbps / 44.1kHz transcoding
           ↓
Phase 6: Album Packager         → Cover concept → AI cover generation → Promo video → Packaging
```

---

## Phase Details

### Phase 1 — Album Concept

**Input:** User-provided core theme or creative direction  
**Output:** `docs/album-overview.md` — narrative arc + track positioning + tonal definition

Four creative experts run in parallel, then a chief reviewer consolidates:

| Expert | Role |
|---|---|
| 🎭 Creative Director | Narrative arc and emotional arc |
| 📊 Market Analyst | Target audience and competitive landscape |
| 🎼 Music Director | Genre positioning and tonal direction |
| ⭐ Chief Reviewer | Composite score and consistency check |

### Phase 2 — Song Writing

Each song runs through **5 experts in serial order**, repeated for **3–6 rounds**:

```
Lyrics Expert → Arrangement Expert → Rhyme Expert → Market Expert → Scoring Expert
                                                                              ↓
                                                                        Score ≥ 80?
                                              ├─ Yes + Round ≥ 3 → ✅ Pass
                                              └─ No → Targeted revision → Next Round
```

| Rule | Value |
|---|---|
| Minimum rounds | 3 (even if Round 1 scores 95) |
| Maximum rounds | 6 (take the highest-scoring version) |
| Between songs | **Parallel** (N songs run simultaneously) |
| Within a song | **Serial** (5 experts operate on the same file in sequence) |

### Phase 3 — Lyrics Formatter

- Extracts structural tags (Verse / Chorus / Bridge / Intro / Outro)
- Validates character limit (≤ 3,500 characters)
- Outputs a validation report + metadata

### Phase 4 — Music Generator

| Step | Description |
|---|---|
| 4.1 Prompt Generation | 3 versions of generation prompts per song |
| 4.2 Prompt Review | Review and optimize prompt quality |
| 4.3 CLI Execution | MiniMax CLI parallel generation of multiple Takes |

### Phase 5 — Audio Transcoder

- 👂 **Listener Selection** — user picks the final Take from multiple candidates
- ✅ **Quality Verification** — post-transcode validation at 320kbps / 44.1kHz

### Phase 6 — Album Packager

| Sub-module | Responsibility |
|---|---|
| 📋 Album Overview Updater | Updates the album master document |
| 📢 Promotional Writer | Album press release and marketing copy |
| 🎤 Artist Story Writer | Creative journey and backstory |
| 🎨 Cover Designer | Album cover concept and design suggestions |
| 🖼️ Cover Prompt Generator | Translates cover concepts into image-generation prompts (3 visual strategies) |
| 🖼️ Cover Executor | MiniMax image-01 → album + track cover art (PNG, 2048×2048) |
| 🔍 Platform Checker | Format compliance check for each music platform |
| 🎬 Promo Video Executor | MiniMax video model → promotional video (6s) |
| 📦 Final Packager | Archives all deliverables (docs + covers + videos + audio) |

---

## Directory Structure

```
album-pipeline/
├── SKILL.md                              ← Master entry point
├── FILE_CONTRACTS.md                     ← Absolute file contracts
├── album-concept/                        ← Phase 1: Concept design
├── song-writer/                          ← Phase 2: Orchestrator
├── song-expert-lyrics/                   ← Phase 2: Lyrics expert
├── song-expert-arrangement/              ← Phase 2: Arrangement expert
├── song-expert-rhyme/                    ← Phase 2: Rhyme expert
├── song-expert-market/                   ← Phase 2: Market expert
├── song-expert-scoring/                  ← Phase 2: Scoring expert
├── lyrics-formatter/                     ← Phase 3: Lyrics formatter
├── phase4-prompt-generator/              ← Phase 4.1: Prompt generation
├── phase4-prompt-reviewer/               ← Phase 4.2: Prompt review
├── phase4-music-executor/                ← Phase 4.3: MiniMax CLI execution
├── phase5-listener-selector/            ← Phase 5.1: Listener selection
├── phase5-quality-verifier/             ← Phase 5.2: Quality verification
├── phase6-album-overview-updater/       ← Phase 6.1: Album overview updater
├── phase6-promotional-writer/           ← Phase 6.2: Promotional copy
├── phase6-artist-story-writer/         ← Phase 6.3: Artist story
├── phase6-cover-designer/               ← Phase 6.4: Cover concept
├── phase6-cover-prompt-generator/      ← Phase 6.4.5: Cover prompt generation
├── phase6-cover-executor/               ← Phase 6.4.6: MiniMax image generation
├── phase6-platform-checker/             ← Phase 6.8: Platform compliance
├── phase6-promo-video-executor/         ← Phase 6.7: Promo video generation
├── phase6-packager/                     ← Phase 6.9: Final packager
├── audio-transcoder/                    ← Phase 5: Transcoder orchestrator
├── album-packager/                      ← Phase 6: Packager orchestrator
├── assets/                              ← Banner hero image
├── docs/
│   └── production-pipeline-review.md    ← Full production pipeline retrospective
└── examples/
    ├── songs/T1-出发.md                ← Example song (98-point final draft)
    ├── lyrics/cn/                       ← Example Chinese lyrics
    └── album-overview.md               ← Example album overview
```

---

## File Contracts

All Phase input/output file paths, formats, and required fields are strictly defined in `FILE_CONTRACTS.md`.

> **This is the pipeline's constitution. No expert or sub-agent may deviate.**

| Rule | Description |
|---|---|
| Read/write routes strictly per contract | Each expert knows exactly what to read and what to write |
| File formats strictly per contract | Block order, field validation, required fields — no exceptions |
| Any deviation = bug, must be fixed | Contracting is mandatory; violations are treated as defects |

See [`FILE_CONTRACTS.md`](FILE_CONTRACTS.md) for the full specification.

---

## Usage

### How to Trigger

```
User: 做一张专辑
User: album pipeline
User: AI 音乐专辑
```

Any of the above phrases starts the pipeline.

### Example Flow

```
You: Make an album about the concept of "Departure" — 3 songs
         ↓
Phase 1: Concept complete — narrative arc + 3-track positioning
         ↓
Phase 2: 5 experts × 6 rounds — lyrics + arrangement + market evaluation per song
         ↓
Phase 3: Lyrics standardized — structural tags + character validation
         ↓
Phase 4: MiniMax CLI generation — multiple Takes per song in parallel
         ↓
Phase 5: Listener selects final Take → Transcoding + quality verification
         ↓
Phase 6: Packaging — cover + artist story + promotional docs + platform checks
         ↓
✅ A complete, release-ready album
```

### Instrumental Support

Even for fully instrumental albums, all 6 phases run. Instrumental tracks are marked during Phase 1, skip the lyrics step in Phase 2 (replaced by instrumental descriptions), and the rest of the pipeline remains unchanged.

---

## Documentation

| Document | Description |
|---|---|
| [Production Pipeline Review](docs/production-pipeline-review.md) | Full process retrospective and lessons learned |
| [File Contracts](FILE_CONTRACTS.md) | Input/output paths, formats, and field definitions |
| [Example Song](examples/songs/T1-出发.md) | A 98-point final-draft song example |
| [Lyrics Examples](examples/lyrics/cn/) | Standardized Chinese lyrics output examples |

---

## Roadmap

- [x] **Phase 1–6 Core Architecture** — full chain from concept to packaging
- [x] **Multi-Expert Parallelism** — 5 independent sub-agents per song
- [x] **Bilingual Albums** — Chinese + English produced in parallel
- [ ] **Quality Tuning Experiments** — data collection on MiniMax generation quality vs. duration
- [ ] **More Genre Templates** — Pop / Electronic / Folk / Classical presets
- [ ] **Visual Dashboard** — real-time pipeline progress and score tracking

---

## License

MIT License — See [LICENSE](LICENSE)

---

## Acknowledgments

- 🎵 **MiniMax Music** — high-quality music generation engine
- 🛠️ **OpenClaw** — agent orchestration framework and sub-agent infrastructure
