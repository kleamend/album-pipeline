# Album Packager — Phase 6 Entry Point

> Orchestrates 6 sub-modules: Album Overview Update → Promotional Documents → Artist Story → Cover Concept → Platform Check → Final Packaging.

---

## Core Principles

1. **Absolute File Contracts**: All input/output strictly follows `FILE_CONTRACTS.md`, no deviations
2. **Mandatory Sub-Agent Separation**: 6 sub-modules each as independent `sessions_spawn` calls, executed serially in 6.1→6.6 order, must not be merged into single agent
3. **Main Agent Orchestrates Only**: Main agent handles spawning/waiting/completion判断, does not directly write any documents

---

## Sub-Module Index

| Sub-Module | Path | Description |
|------------|------|-------------|
| Phase 6.1 | `phase6-album-overview-updater/SKILL.md` | Album overview document update (score conversion/track list completion) |
| Phase 6.2 | `phase6-promotional-writer/SKILL.md` | Promotional documents (one-liner/concept/intro/social copy/production info) |
| Phase 6.3 | `phase6-artist-story-writer/SKILL.md` | Artist story copy (Chinese long version/English long version/short version/quotes) |
| Phase 6.4 | `phase6-cover-designer/SKILL.md` | Cover concept plan (≥3 directions/color scheme/application scenarios) |
| Phase 6.5 | `phase6-platform-checker/SKILL.md` | Platform adaptation check (NetEase Cloud/QQ Music) |
| Phase 6.6 | `phase6-packager/SKILL.md` | Final packaging (zip + upload checklist) |

**Execution Order**: 6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6 (serial dependency)

---

## Pre-Launch Notice (User Expectation Management)

**⚠️ Feishu Push Mechanism Key**: Messages are pushed only after turn ends. Must output notice text first, then spawn sub-agent, then `sessions_yield`.**

**Correct Flow:**
1. Main agent outputs notice:
   > 🪚 Phase 6 publishing materials packaging started. 6 sub-modules in series (Album Overview → Promotional Documents → Artist Story → Cover → Platform Check → Packaging). Estimated ~ **30-45 minutes** to complete. I will proactively notify you when done, no need to wait.
2. Spawn sub-agents in order (6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6)
3. `sessions_yield` to end current turn

---

## Triggers

After Phase 5 completion, user commands:
- "打包发布物料" (Package Publishing Materials)
- "Phase 6"
- "album packaging"

---

## Input

- `docs/album-overview.md` (Phase 1 skeleton, needs completion)
- `songs/TN-*.md` (cover highlight copy, market assessment for each track)
- `generate/cn_320k/` and `generate/en_320k/` final tracks (for production info)
- `assets/` cover concept images

---

## Execution

### ⚠️ Modification Scope
- **Read**: `docs/album-overview.md`, `songs/TN-*.md`, `generate/cn_320k/`, `generate/en_320k/`, `assets/`
- **Write**: New document files under `docs/` + zip archive
- **Forbidden**: Modify any files in `songs/` or `generate/` directories

### 1. Album Overview Document (`docs/album-overview.md`)

Complete:
- ✅ Album overview (from Phase 1)
- ✅ Track list (with final duration/selected Take)
- ✅ English album info (Album Name / Description / Creator's Note)
- ✅ Track One-Liners (one-line intro for each song)
- ✅ Scoring Overview (Phase 2 5-dimension scoring: Rhythm/Market/Structure/Philosophy/Arrangement)
  - Also retain Phase 1 original 4-dimension scoring as "## Phase 1 Concept Scoring" historical reference sub-section
- ⏳ Todo items update

### 2. Promotional Document (`docs/promotional-materials.md`)

Initialize from template `templates/promotional-materials.md`, fill:
- One-liner album concept
- Album introduction (~300 words)
- Core promotional lines (3)
- Per-track highlight copy (extracted from `songs/TN-*.md` cover highlights)
- Social Media copy (Weibo 140 chars/Xiaohongshu 200-300 chars/WeChat article titles ×3)
- Production info (AI tools/scale/output standards)
- Potential controversy points and response plans

### 3. Artist Story Copy

Initialize from template `templates/artist-story.md`, generate:
- `docs/artist-story-cn.md` — Chinese long version (~1800 words)
- `docs/artist-story-en.md` — English long version (~1400 words)
- `docs/artist-story-short.md` — Chinese/English short version (~400 words/words each)
- `docs/artist-story-quotes.md` — Quote extraction (5 Chinese-English pairs)

**Narrative Strategy**: Do not hide AI generation fact; transform it into the album's most honest metaphor.

### 4. Cover Concept (`docs/cover-concept.md`)

Initialize from template `templates/cover-concept.md`, fill:
- ≥ 3 visual directions (with concept description)
- Color scheme (with HEX values)
- Per-track cover concept
- Application scenarios (streaming/physical/social/MV + dimension requirements)

### 5. Platform Adaptation Check

Check if final products meet target platform requirements:

| Check Item | NetEase Cloud | QQ Music |
|------------|---------------|----------|
| Format | MP3 320kbps ✅ | FLAC preferred, MP3 320kbps ✅ |
| Sample Rate | 44.1kHz ✅ | 44.1kHz ✅ |
| Loudness | -14 LUFS ✅ | -14 LUFS ✅ |
| Min Duration | ≥ 60 seconds | ≥ 60 seconds |
| Max Duration | ≤ 6 minutes | ≤ 6 minutes |
| Min Track Count | 3 tracks | 3 tracks |
| Required Info | Album name/tracks/artist | Album name/tracks/artist |

Generate `docs/platform-check.txt`:
```
NetEase Cloud Music: ✅ All passed
QQ Music: ✅ All passed
```

### 6. Packaging

```bash
cd <project-root>
zip -r <album-name>-promotional-materials.zip \
  docs/album-overview.md \
  docs/promotional-materials.md \
  docs/cover-concept.md \
  docs/artist-story-cn.md \
  docs/artist-story-en.md \
  docs/artist-story-short.md \
  docs/artist-story-quotes.md \
  docs/platform-check.txt
```

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | album-overview complete | Track list + Scoring Overview + English info + Track One-Liners |
| 2 | Artist story 4 files | Chinese long + English long + Chinese/English short + quotes |
| 3 | Promotional document | One-liner concept + 300-word intro + per-track highlights + social media copy + production info + controversy plan |
| 4 | Cover concept | ≥ 3 visual directions + color scheme (HEX) + application scenarios |
| 5 | Production info accurate | AI generation tools, scale, output standards all noted |
| 6 | Platform adaptation check | NetEase/QQ Music all items ✅, `docs/platform-check.txt` generated |
| 7 | zip content complete | Archive contains all 8 document files (including platform-check.txt) |
| 8 | zip packaged | All document files packaged as <album-name>-promotional-materials.zip |

---

## Output File Contract

Strictly follows Phase 6 contract in `FILE_CONTRACTS.md`.

---

## Final Deliverables

| File/Directory | Content |
|----------------|---------|
| `docs/album-overview.md` | Album overview document (complete) |
| `docs/promotional-materials.md` | Promotional document |
| `docs/artist-story-*.md` | Artist story copy (4 files) |
| `docs/cover-concept.md` | Cover concept |
| `generate/cn_320k/` | Chinese final audio (N tracks) |
| `generate/en_320k/` | English final audio (N tracks) |
| `*.zip` | Promotional materials archive |
