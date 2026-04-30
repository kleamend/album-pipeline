# Album Pipeline — AI Music Album Production Pipeline Skill

> The master entry point for album production. From concept design to release packaging — 6 Phases, fully automated.

---

## Core Principles (Strictly Enforced Across All Phases)

### 1. Absolute File Contracts

All Phase input/output file paths, formats, and required fields are defined in `FILE_CONTRACTS.md`.

**This is the pipeline's constitution. No expert or sub-agent may deviate.**

- Read/write routes are strictly per contract (what to read, what to write, and what is forbidden)
- File formats are strictly per contract (block order, field validation, required fields)
- Any deviation = bug, must be fixed

### 2. Mandatory Sub-agent Isolation

**The main agent's sole responsibility: Phase 1 Step 0 (concept exploration dialogue with the user).**

All other work must be handled by independent sub-agents:

| Phase | # of Sub-agents | Notes |
|-------|----------------|-------|
| Phase 1 Step 1 | 4 | Creative Director / Market Expert / Music Director / Chief Reviewer (parallel 3 + serial 1) |
| Phase 2 per round | 5 | Lyrics / Arrangement / Rhyme / Market / Scoring Experts (serial) |
| Phase 3 | 1 | Lyrics standardization extractor |
| Phase 4.1 | 1 | 3-version Prompt generation |
| Phase 4.2 | 1 | Prompt review and optimization |
| Phase 4.3 | N | MiniMax CLI parallel generation (one agent per song per language) |
| Phase 5.1 | 1 | Listener selection (main agent coordinates with user) |
| Phase 5.2 | 1 | Quality verification |
| Phase 6.1–6.6 | 1 each | 6 independent packaging experts |

**Each expert must be an independent `sessions_spawn` call — never merge them.**

Lyrics Expert ≠ Arrangement Expert ≠ Market Expert ≠ Scoring Expert. Each is an independent sub-agent with its own SKILL.md, its own modification scope, and its own checklist.

### 3. Feishu Push Mechanism + Message Timing

**Key mechanism: Feishu delivers messages in a batch after each turn ends.**

**Correct pattern (all Phases):**

```
1. Main agent outputs prompt text (expected duration, next-step explanation)
2. Immediately spawn sub-agent
3. sessions_yield to end current turn → prompt is pushed to user
4. Sub-agent works in background
5. Sub-agent completes → main agent receives notification → proactively notifies user
```

**Forbidden: spawning a sub-agent and then waiting without yielding (main agent stalls, user sees nothing).**

**Prompt timing principles:**
- ✅ Only prompt at **phase boundaries** (Phase starts, Phase completes, user decision required)
- ❌ Do not pause for confirmation between rounds (Phase 2 internal multi-round rolling is automatic, no interruption)
- ✅ Only Phase 1 Step 0.1 (concept confirmation to start) and Phase 1 Step 3 (plan confirmation) require explicit user confirmation
- ✅ All other Phase starts only need a prompt with expected duration — no confirmation needed

---

## Triggers

- "Make an album"
- "album pipeline"
- "AI music album"
- User expresses intent to create a concept album

---

## Pipeline Architecture

```
Phase 1: Album Concept     → Album concept design (narrative arc + track positioning + tonal definition)
Phase 2: Song Writing      → Song generation (5 experts serial × 3–6 rounds, N songs parallel)
Phase 3: Lyrics Formatter  → Lyrics standardization (structure tags + character limits)
Phase 4: Music Generator   → Music generation (MiniMax CLI multi-Take parallel)
Phase 5: Audio Transcoder  → Selection + transcoding (320kbps/44.1kHz)
Phase 6: Album Packager    → Release materials packaging (overview doc + cover + promo + artist story)
```

---

## Directory Structure

```
skills/album-pipeline/
├── SKILL.md                     ← This file (master entry point)
├── FILE_CONTRACTS.md            ← Absolute file contracts
├── album-concept/               ← Phase 1
├── song-writer/                 ← Phase 2 orchestrator
├── song-expert-lyrics/          ← Phase 2 lyrics expert
├── song-expert-arrangement/     ← Phase 2 arrangement expert
├── song-expert-rhyme/           ← Phase 2 rhyme expert
├── song-expert-market/          ← Phase 2 market expert
├── song-expert-scoring/         ← Phase 2 scoring expert
├── lyrics-formatter/            ← Phase 3 lyrics standardization
├── music-generator/             ← Phase 4 master entry (orchestrator)
├── audio-transcoder/            ← Phase 5 master entry (orchestrator)
├── album-packager/             ← Phase 6 master entry (orchestrator)
│
│   ── Phase 4 Sub-modules ──
├── phase4-prompt-generator/     ← Phase 4.1 3-version Prompt generation
├── phase4-prompt-reviewer/      ← Phase 4.2 Prompt review and optimization
├── phase4-music-executor/       ← Phase 4.3 MiniMax CLI parallel generation
│
│   ── Phase 5 Sub-modules ──
├── phase5-listener-selector/    ← Phase 5.1 listener selection
├── phase5-quality-verifier/     ← Phase 5.2 post-transcode quality verification
│
│   ── Phase 6 Sub-modules ──
├── phase6-album-overview-updater/  ← Phase 6.1 album overview update
├── phase6-promotional-writer/      ← Phase 6.2 promotional document
├── phase6-artist-story-writer/     ← Phase 6.3 artist story copy
├── phase6-cover-designer/          ← Phase 6.4 cover concept
├── phase6-platform-checker/        ← Phase 6.5 platform compliance check
└── phase6-packager/               ← Phase 6.6 final packaging
```

---

## Phase 2 Detailed Flow

```
For each song (T1–TN, N = Phase 1 track count):
  Open songs/TN-track-name.md (template initialized by Phase 0.5)

  Round = 1 → up to 6 rounds:
    spawn Lyrics Expert agent → read/write songs/TN-track-name.md
    spawn Arrangement Expert agent → read/write songs/TN-track-name.md
    spawn Rhyme Expert agent → read/write songs/TN-track-name.md
    spawn Market Expert agent → read/write songs/TN-track-name.md
    spawn Scoring Expert agent → read songs/TN-track-name.md, output score
                                      ↓
                                  Score ≥ 80?
                                  ├─ Yes + Round ≥ 3 → ✅ Pass
                                  └─ No → Flag low score → Round++
```

**Key rules:**
- Songs are **parallel** (N agent groups run simultaneously)
- Within a song, experts are **serial** (5 independent sub-agents operate on the same file in sequence)
- **Each expert must be an independent `sessions_spawn` call — never merge**
- **Incremental modification** (Round 2+ targets specific improvements based on previous round scores)
- **Minimum 3 rounds** (even if Round 1 scores 95, all 3 rounds must complete)
- **Maximum 6 rounds**

---

## Quality Gates Per Phase

| Phase | Entry Condition | Exit Condition | Details |
|-------|----------------|----------------|---------|
| Phase 1 | User provides core theme | Track positioning table complete | `album-concept/SKILL.md` |
| Phase 2 | Phase 1 complete | All songs ≥ 80 score + completed 3 rounds (or max 6 rounds, take highest-scoring version) | `song-writer/SKILL.md` |
| Phase 3 | Phase 2 complete | All lyrics files pass validation | `lyrics-formatter/SKILL.md` |
| Phase 4 | Phase 3 complete | All Takes generated | `music-generator/SKILL.md` |
| Phase 5 | Phase 4 complete | Selected Take passes transcoding validation | `audio-transcoder/SKILL.md` |
| Phase 6 | Phase 5 complete | All release materials present | `album-packager/SKILL.md` |

---

## Absolute File Contracts

All Phase input/output file paths, formats, and required fields are defined in `FILE_CONTRACTS.md`.

Each Skill must strictly follow the file contracts for its Phase and may not deviate.

---

## Quick Reference

| Reference | Path |
|-----------|------|
| Full pipeline retrospective | `docs/production-pipeline-review.md` |
| Example song | `examples/songs/T1-Departure.md` (98-point final draft) |
| Lyrics example | `examples/lyrics/cn/T1-出发.txt` (Chinese) / `examples/lyrics/en/T1-Departure.txt` (English) |
| MiniMax CLI | `minimax music generate --help` |
| Model duration | music-2.6 can generate 3–5 minutes of high-quality content; quality typically scales positively with duration (see tuning experiment data, TBD) |
| Lyrics length | ≤ 3,500 characters (excluding structure tag text) |

---

## Instrumental / Pure Music Special Handling

**Core principle: even for a single instrumental track, the 6-Phase skeleton remains intact.**

Instrumental only means **skipping the lyrics-related expert steps** — documentation is not skipped, file contracts are not skipped.

### Instrumental Handling Per Phase

| Phase | Standard Operation | Instrumental Adjustment |
|-------|-------------------|------------------------|
| Phase 1 | Concept design + track positioning | No change. Mark "Instrumental" in the track list's Language field |
| Phase 2 | 5 experts serial iteration | Lyrics Expert **skips lyrics block**, writes "Instrumental Description" block (emotional arc / timbre / arrangement); Rhyme Expert **skips rhyme analysis**, replaced with "Rhythm/Timbre × Arrangement Analysis"; Arrangement/Market/Scoring Experts **unchanged** |
| Phase 3 | Lyrics standardization | Output empty file + `metadata.json` with `has_lyrics: false`, `validation.txt` marked "Instrumental, skipped" |
| Phase 4 | 3-version Prompt + CLI generation | No `--lyrics-file` parameter; Prompt focuses on arrangement/timbre/emotional description |
| Phase 5 | Listener selection + transcoding + verification | No change |
| Phase 6 | Release materials packaging | No change. Artist story notes "this track is instrumental" |

### Instrumental Track List Identification

For instrumental tracks, mark the Language field as "Instrumental" and add "🎵 Instrumental" in the status column:

| # | Track | Language | Status |
|---|-------|---------|--------|
| 03 | T3《Interlude》 | Instrumental | 🎵 Instrumental |

### Instrumental Song File Contract

Instrumental song file (`songs/TN-track-name.md`) structure:
- **Basic info table**: Language = Instrumental
- **Lyrics block**: Replaced with "Instrumental Description" block (section emotions / lead melody timbre / arrangement intent)
- **English lyrics block**: Removed or marked "Instrumental, none"
- **Full arrangement design**: Filled normally
- **Key Sound Design**: Filled normally
- **Rhyme analysis**: Replaced with "Rhythm/Timbre Analysis" block
- **Cover highlight copy**: Filled normally
- **Market evaluation report**: Filled normally
- **Data**: Filled normally (rhythm dimension replaced with "instrumental expressiveness" dimension)
- **Score evolution history**: Filled normally

### Fully Instrumental Album (entire album has no lyrics)

When the album's Language field = "Instrumental" (all tracks are instrumental):

| Phase | Impact |
|-------|--------|
| Phase 3 | No `.txt` lyrics files generated in `generate/lyrics/cn/` or `generate/lyrics/en/`; only `metadata.json` (each track marked `has_lyrics: false`) and `validation.txt` (all tracks marked "Instrumental, skipped") |
| Phase 4 | Prompts have no `--lyrics-file` parameter, focus on arrangement/timbre/emotional description; output directories `generate/cn/` and `generate/en/` still normally contain `.mp3` files |
| Phase 5–6 | No change; normal transcoding, listening, packaging |

**Directory allocation summary**: Even if the entire album has no lyrics, the `generate/lyrics/` directory must still be created (containing `metadata.json` + `validation.txt`), and `generate/cn/` + `generate/en/` directories still normally hold `.mp3` outputs.

### Recognition Trigger

During Phase 1 concept design, if the user specifies a track as instrumental, mark it from Phase 1 onward.
The Phase 2 orchestrator reads the track positioning table and automatically recognizes the "Instrumental" language field to adjust the expert workflow.

## Phase Sub-module Index

| Phase | Sub-module | Description |
|-------|-----------|-------------|
| Phase 1 | `album-concept/SKILL.md` | Concept design (4 experts + chief review) |
| Phase 2 | `song-writer/SKILL.md` | Orchestrator |
| Phase 2 | `song-expert-lyrics/SKILL.md` | Lyrics expert |
| Phase 2 | `song-expert-arrangement/SKILL.md` | Arrangement expert |
| Phase 2 | `song-expert-rhyme/SKILL.md` | Rhyme expert |
| Phase 2 | `song-expert-market/SKILL.md` | Market expert |
| Phase 2 | `song-expert-scoring/SKILL.md` | Scoring expert |
| Phase 3 | `lyrics-formatter/SKILL.md` | Lyrics standardization + metadata + validation |
| Phase 4 | `phase4-prompt-generator/SKILL.md` | 3-version Prompt generation |
| Phase 4 | `phase4-prompt-reviewer/SKILL.md` | Prompt review and optimization |
| Phase 4 | `phase4-music-executor/SKILL.md` | MiniMax CLI parallel generation |
| Phase 5 | `phase5-listener-selector/SKILL.md` | Listener selection |
| Phase 5 | `phase5-quality-verifier/SKILL.md` | Post-transcode quality verification |
| Phase 6 | `phase6-album-overview-updater/SKILL.md` | Album overview update |
| Phase 6 | `phase6-promotional-writer/SKILL.md` | Promotional document |
| Phase 6 | `phase6-artist-story-writer/SKILL.md` | Artist story copy |
| Phase 6 | `phase6-cover-designer/SKILL.md` | Cover concept |
| Phase 6 | `phase6-platform-checker/SKILL.md` | Platform compliance check |
| Phase 6 | `phase6-packager/SKILL.md` | Final packaging |
