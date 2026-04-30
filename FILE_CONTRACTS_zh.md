# Album Pipeline — Absolute File Contracts

> This document defines the input/output file paths, formats, and required fields for each Phase of the pipeline.
> All Skills must strictly adhere to these contracts. No deviations are permitted.

---

## Project Root Directory

```
<project-root>/                    ← Album project root (e.g., album-new-album/)
├── songs/                         ← Phase 2 output (song design files)
│   ├── T1-track-name.md
│   ├── T2-track-name.md
│   └── ...
├── docs/                          ← Phase 1 + Phase 6 output
│   ├── album-overview.md          ← Phase 1 main output
│   ├── cover-concept.md           ← Phase 6.4
│   ├── promotional-materials.md   ← Phase 6
│   ├── artist-story-cn.md         ← Phase 6
│   ├── artist-story-en.md         ← Phase 6
│   ├── artist-story-short.md      ← Phase 6
│   ├── artist-story-quotes.md     ← Phase 6
│   ├── platform-check.txt         ← Phase 6.5
│   └── promo-video.mp4            ← Phase 6.7 promo video (6 seconds)
├── generate/                      ← Phase 3–4 output
│   ├── prompts/                   ← Phase 4 Prompt files
│   │   ├── TN-track-name-prompt1.txt
│   │   ├── TN-track-name-prompt2.txt
│   │   ├── TN-track-name-prompt3.txt
│   │   └── index.json
│   ├── lyrics/cn/                 ← Phase 3 Chinese standard lyrics
│   ├── lyrics/en/                 ← Phase 3 English standard lyrics
│   ├── cn/                        ← Phase 4 Chinese raw generation
│   ├── en/                        ← Phase 4 English raw generation
│   ├── cn_320k/                   ← Phase 5 Chinese final deliverables
│   ├── en_320k/                   ← Phase 5 English final deliverables
│   └── covers/                    ← Phase 6.4.5–6.4.6 cover outputs
│       ├── album-cover-p1.png
│       ├── album-cover-p2.png
│       ├── album-cover-p3.png
│       ├── prompts/               ← Phase 6.4.5 Prompt files
│       │   ├── album-cover-prompt{1,2,3}.txt
│       │   ├── T{N}-track-name-cover-prompt{1,2,3}.txt
│       │   └── index.json
│       └── tracks/                ← Phase 6.4.6 individual track covers
│           └── T{N}-track-name-p{1,2,3}.png
└── assets/                        ← Phase 6 cover concept imagery
```

---

## Phase 1 Contract

### Input

No file input. The main agent collects concept intent through dialogue with the user.

### ⚠️ Hard Rule: File Modification Scope Limit

**All Phase 1 sub-agents (4 experts) must strictly follow these rules:**

1. **Only modify the blocks they are responsible for** — no touching other blocks
2. **Do not add new blocks** (except optional blocks explicitly permitted by this contract)
3. **Do not remove blocks** — all required blocks must be preserved
4. **Do not change block order** — blocks must be in the order defined by this contract
5. **Read-only dependencies**: may read content written by prior experts but must not modify it

**Expert modification scope:**

| Expert | Writable Blocks | Read-Only Blocks |
|--------|-----------------|------------------|
| Creative Director | Album Overview, Narrative Arc, Track List, To-Do (initialization) | Market Analysis / Tonal Main Line / English Info / Score Overview (read-only) |
| Market Expert | Market Analysis, Core Communication Concept (within Market Analysis block), English Album Info | Album Overview / Track List / Tonal / Score (read-only) |
| Music Director | Tonal Main Line | Album Overview / Track List / Market Analysis / English Info / Score (read-only) |
| Chief Reviewer | Score Overview | All existing blocks (read-only) |

### Output File (Singleton)

`docs/album-overview.md`

### File Structure (Strict)

```markdown
# Album Overview — 《{Album Name}》

> Status: In Concept Design
> Last Updated: YYYY-MM-DD
> Optimization Round: Round{N}

---

## Album Overview

**Album Name:** 《{Chinese Name}》 / **{English Name}**
**Core Concept:** {1–2 sentences}
**Core Paradox:** {One sentence}
**Target Audience:** {Description}
**Reference Style:** {Reference artists/albums}

**Narrative Arc:**
- **{Arc Name 1}**: {Arc meaning}, {track list}
- **{Arc Name 2}**: {Arc meaning}, {track list}
- ... (minimum 2, maximum 5)

---

## Market Analysis

**Market Positioning:** {One-sentence positioning}
**Target Audience:** {Precise persona, 2–3 layers}
**Competitive Differentiation:** {Difference from comparable works}
**Core Communication Concept:** {One sentence, independently distributable}
**Potential Risks:** {≥1 risk + mitigation strategy}

### English Album Info (for NetEase Cloud / release use)

### Album Name
**{English Name}**

### Album Description
{2–4 English sentences, suitable for streaming platform display}

### Creator's Note
{First-person English, 3–6 paragraphs, describing creative motivation and album meaning}

### Track One-Liners

| # | Track | English Title | One-Liner |
|---|-------|--------------|-----------|
| 01 | T1 {Track Name} | {English} | {One-sentence intro} |
| ... | | | |

---

## Track List

| # | Track | English Name | Direction | Core Hook | Core Paradox | Core Imagery | Physicality | Emotional Arc | Arrangement Style | Est. Duration | Status |
|---|-------|-------------|-----------|-----------|--------------|--------------|-------------|---------------|------------------|--------------|--------|
| 01 | T1《{Track Name}》 | {English} | {Arc Name} | {Hook} | {Paradox} | {Imagery1}/{Imagery2}/{Imagery3} | {Physicality1}/{Physicality2} | {Start}→{End} | {Style}, {Tonal}, {BPM}BPM | ~{M}:{SS} | ⏳ Pending Generation |
| ... | | | | | | | | | | | |

**✅ Duration Status:** {Summary description}

---

## Tonal Main Line

{Primary tonal identity}
Tonal Distribution: T1 {Tonal} | T2 {Tonal} | ...
Tonal Logic: {Design rationale}

---

## Score Overview (Round{N})

| Dimension | Score | Comment |
|-----------|-------|---------|
| Conceptual Originality | {0–25} | {Comment} |
| Narrative Coherence | {0–25} | {Comment} |
| Market Potential | {0–25} | {Comment} |
| Musical Consistency | {0–25} | {Comment} |

Total: {XX}/100

---

## To-Do

- [x] Phase 1 Concept Confirmed (Round{N})
- [ ] Phase 2 Song Generation
- [ ] Phase 3 Lyrics Standardization
- [ ] Phase 4 Music Generation
- [ ] Phase 5 Selection and Transcoding
- [ ] Phase 6 Release Materials
```

### Required Field Validation

| Field | Type | Required | Validation Rule |
|-------|------|----------|----------------|
| Language | enum | ✅ | Chinese / Chinese+English / English / Instrumental (choose one) |
| Album Name (CN) | string | ✅ | 2–6 characters |
| Album Name (EN) | string | ✅ | 1–5 words |
| Core Concept | string | ✅ | 50–200 characters |
| Core Paradox | string | ✅ | ≤ 50 characters |
| Narrative Arc | array | ✅ | ≥ 2 items, covering all tracks |
| Track List | array | ✅ | 11 fields per track, count = user-specified track count |
| Market Positioning | string | ✅ | ≤ 50 characters, one sentence |
| Target Audience | string | ✅ | 2–3 layer audience persona |
| Competitive Differentiation | string | ✅ | ≥ 1 differentiation point |
| Core Communication Concept | string | ✅ | ≤ 30 characters, independently distributable |
| Potential Risks | string | ✅ | ≥ 1 risk + mitigation |
| Tonal Main Line | object | ✅ | Primary tonal + each track's tonal |
| Score Overview | table | ✅ | 4 dimensions × 25 points, total 100 |
| Track One-Liners | table | ✅ | N tracks, one sentence each |
| Album Description | string | ✅ | 50–300 English characters |
| Creator's Note | string | ✅ | 100–800 English characters |

### Phase 1 Output Verification

Must confirm upon completion:
- [ ] `docs/album-overview.md` exists
- [ ] Track list row count = user-specified track count
- [ ] All track narrative arcs exist in the "Narrative Arc" list
- [ ] Tonal Main Line includes all track tonals
- [ ] Score Overview all dimensions total ≥ 80
- [ ] **User has confirmed concept direction**

### Phase 1 Optional Block List

Phase 1 does not permit adding any blocks. All blocks are required.

---

## Phase 2 Contract

### ⚠️ Hard Rule: File Modification Scope Limit

**All Phase 2 sub-agents (5 experts) must strictly follow these rules:**

1. **Only modify the blocks they are responsible for** — no touching other blocks
2. **Do not add new blocks** (except optional blocks explicitly permitted by this contract)
3. **Do not remove blocks** — all required blocks must be preserved
4. **Do not change block order** — blocks must be in the order defined by this contract
5. **Read-only dependencies**: may read content written by prior experts but must not modify it

**Expert modification scope:**

| Expert | Writable Blocks | Read-Only Blocks |
|--------|-----------------|------------------|
| Lyrics Expert | Lyrics (Chinese version), English Lyrics (for bilingual/English albums) | Basic Info / other blocks (read-only) |
| Arrangement Expert | Full Arrangement Design, Key Sound Design | Basic Info / lyrics / other blocks (read-only) |
| Rhyme Expert | Rhyme Analysis (required for Round 1; Round ≥ 2 adds optimization suggestions) | All existing blocks (read-only) |
| Market Expert | Market Evaluation Report, Cover Highlight Copy, Market Deep Analysis (optional for Round ≥ 2) | All existing blocks (read-only) |
| Scoring Expert | Data, Score Evolution History, Specific Issue List for Revision | All existing blocks (read-only) |

### Input

| Source | File | Content |
|--------|------|---------|
| Phase 1 | `docs/album-overview.md` | Track positioning table + narrative arc + tonal main line |

### Output File (One Per Song)

`songs/T{N}-{track-name}.md`

### File Structure (Strict)

Each song file must contain the following blocks **in fixed order**:

```markdown
# T{N}《{Track Name}》

**{Narrative Arc Name} · Album Track {N}**

---

## Basic Info

| Item | Content |
|------|---------|
| Language | {Chinese / Chinese+English / English} |
| Direction | {Narrative Arc} ({Arc meaning summary}) |
| Core Hook | {≤ 8 characters} |
| Core Paradox | {One sentence} |
| Core Imagery | {3–5 items, separated by /} |
| Physicality | {≥ 2 physical images} |
| Emotional Arc | {Start}→{End} |
| Est. Duration | ~{M}:{SS} |
| Arrangement Style | {Style}, {Tonal}, {BPM} BPM |

---

## Lyrics (Round{N} · {Status Description})

{Optional: optimization entry point}

```
[Structure Tag]
Lyrics lines...

[Structure Tag]
Lyrics lines...
```

{Optional: rhyme optimization comparison table}

---

## English Lyrics (Round{N} · {Status Description})

> Fill only for bilingual/English albums; remove for Chinese-only albums.

```
[Structure Tag]
Lyrics lines...

[Structure Tag]
Lyrics lines...
```

{Optional: English rhyme analysis}

---

## Full Arrangement Design

> **BPM: {N} BPM · {Tonal} · {Style}**

### 1. {Section Name} Design ({start}–{end})

{Detailed arrangement description including timbre/instruments/vocal processing/emotion}

### 2. {Section Name} Design ({start}–{end})
...

---

## Key Sound Design

| Sound Effect | Description | Position | Volume |
|--------------|-------------|----------|--------|
| {Name} | {Description} | {Position} | {dB} |
| ... | | | |

---

## Rhyme Analysis (Round{N})

### Rhyme Distribution

| Rhyme | Sound | Position | Emotional Texture |
|-------|-------|----------|------------------|
| {Rhyme Name} | {Sound} | {Position} | {Description} |

### Hook Rhyme Design Logic
{Description}

### Rhyme × Arrangement Coordination Rating

| Dimension | Score | Description |
|-----------|-------|-------------|
| {Dimension} | {X}/10 | {Description} |

---

## Cover Highlight Copy

> **"{One-sentence copy}"**
> {Supplementary explanation}

---

## Market Evaluation Report

### Core Competitiveness
- {Selling point 1}
- {Selling point 2}
- ...

### Target Audience Analysis

| Audience Layer | Characteristics | Acceptance Assessment |
|---------------|----------------|----------------------|
| {Layer name} | {Description} | {Star rating} |
| ... | | |

{Optional: promotion suggestions, commercialization potential, risk assessment}

---

## Specific Issues for Revision (Round{N})

| # | Priority | Module | Issue Description | Revision Plan |
|---|----------|--------|-----------------|---------------|
| {N} | 🔴/🟡/🟢 | {Module} | {Description} | {Plan} |
| ... | | | | |

---

## Data

- **Score:** {Total}/100 (Round{N} {Version description})
- **Rhythm:** {0–20}/20
- **Market:** {0–20}/20
- **Structure:** {0–20}/20
- **Philosophy:** {0–20}/20
- **Arrangement:** {0–20}/20
- **Status:** {✅ Finalized / 🔄 In Progress}

---

## Score Evolution History

| Stage | Score | Key Changes |
|-------|-------|------------|
| Round{N-1} | {Total} | {Change description} |
| Round{N} (current) | {Total} | {Change description} |
```

### Required Block Validation

| Block | Required | Validation Rule |
|-------|----------|----------------|
| Basic Info table | ✅ | 9 fields (including Language), all non-empty. For instrumental tracks, Language = "Instrumental" |
| Arrangement Style | ✅ | Required, non-empty, format: "{Style}, {Tonal}, {BPM} BPM" |
| Lyrics block | ✅ for regular songs / ❌ for instrumental | Regular songs: ≥ 3 structure tags, pure lyrics characters ≤ 3,500 (excluding tag text), lyrics wrapped in Markdown code blocks. Instrumental: replace this block with "Instrumental Description" block |
| English Lyrics block | Required for bilingual/English albums | ≥ 3 structure tags, pure lyrics characters ≤ 3,500 (excluding tag text), lyrics wrapped in Markdown code blocks |
| Instrumental Description block | ❌ for regular songs / ✅ for instrumental | Instrumental only: lead melody emotional arc + section intent + core timbre + key transitions |
| Full Arrangement Design | ✅ | ≥ 5 sections, each with explicit time range |
| Key Sound Design | ✅ | ≥ 3 sound effects, including position and volume |
| Cover Highlight Copy | ✅ | One-sentence copy + supplementary explanation |
| Rhyme Analysis / Rhythm-Timbre Analysis | Regular song Round 1 required; Round ≥ 2 adds optimization suggestions / Instrumental required "Rhythm/Timbre Analysis" | Contains rhyme distribution table + Hook rhyme check + Rhyme × Arrangement rating, or instrumental rhythm pattern/timbre layer analysis |
| Market Evaluation Report | ✅ | Core competitiveness + audience analysis |
| Specific Issues for Revision | Required for Round ≥ 2 | List each issue; if none, write `None` |
| Data | ✅ | Total score + 5 dimensions + status. For instrumental, Rhythm dimension replaced with "Instrumental Expressiveness" |
| Score Evolution History | Required for Round ≥ 2 | ≥ 1 historical record |

### Lyrics Block Format Constraints

✅ Correct:

```
[Verse]
我把笼子 走成天空
把每条退路 走成出路

[Pre Chorus]
一步一步 把身体寄回现场

[Hook]
走成天空 走成天空
```

❌ Incorrect (structure tag contains description):

```
[Verse — A cappella entry]  ← No descriptions inside tags
我把笼子 走成天空
```

### Arrangement Design Block Format Constraints

Each section must include:
- Section number + name: `### N. {Section Name} Design ({start}–{end})`
- Time range: precise to seconds, e.g., `0:00–0:30`
- At least 3 time anchors (e.g., `0:05`, `0:15`, `0:22`)
- Each time anchor has a corresponding arrangement action description

### Rhyme × Arrangement Coordination (Rhyme Analysis, required for Round 1, Round ≥ 2 adds optimization suggestions)

```markdown
## Rhyme Analysis

### Rhyme Distribution

| Rhyme | Sound | Position | Emotional Texture |
|-------|-------|----------|------------------|
| {Rhyme Name} | {Sound} | {Position} | {Description} |

### Hook Rhyme Design Logic
{Description}

### Rhyme × Arrangement Coordination Rating

| Dimension | Score | Description |
|-----------|-------|-------------|
| {Dimension} | {X}/10 | {Description} |
```

### Market Deep Analysis (Optional enhanced block for Round ≥ 2)

```markdown
## Market Deep Analysis

{Competitor benchmarking / differentiation analysis / platform fit / Sync potential / marketing suggestions / risk assessment}

### Market Potential Rating

| Dimension | Score | Description |
|-----------|-------|-------------|
| Concept Uniqueness | {X}/10 | {Description} |
| Hook Spreadability | {X}/10 | {Description} |
| ... | | |
| Overall Market Potential | {X.X}/10 | {Description} |
```

### Phase 2 Output Verification (Per Song)

Must confirm upon completion:
- [ ] `songs/T{N}-{track-name}.md` exists and is non-empty
- [ ] Basic Info table has all 9 fields (including Language) with values
- [ ] Lyrics contain ≥ 3 structure tags, pure lyrics characters ≤ 3,500 (excluding tag text), lyrics wrapped in Markdown code blocks
- [ ] Arrangement Design has ≥ 5 sections, each with ≥ 3 time anchors, timeline has no overlaps/gaps
- [ ] Sound Design has ≥ 3 effects
- [ ] Cover Highlight Copy exists
- [ ] Market Evaluation includes core competitiveness + audience analysis
- [ ] Score total + 5 dimension scores all present
- [ ] For Round ≥ 2: issue list + score evolution history both present

### Phase 2 Pass Condition (Global)

Confirm when all songs pass:
- [ ] All `songs/T{N}-*.md` exist
- [ ] Each song score ≥ 80 and completed 3 rounds (or reached max 6 rounds, taking highest-scoring version)
- [ ] `docs/album-overview.md` score overview has been updated

### Phase 2 Optional Block List

| Block | Insert Position | Trigger Condition | Writing Expert |
|-------|----------------|-------------------|----------------|
| Rhyme Analysis | Insert after "Key Sound Design", before "Cover Highlight Copy" | Required for Round 1 (new); Round ≥ 2 adds optimization suggestions (modify/append) | Rhyme Expert (new for Round 1, modify/append for Round ≥ 2) |
| Market Deep Analysis | Insert after "Market Evaluation Report", before "Issue List" | Optional for Round ≥ 2 | Market Expert |

---

## Phase 3 Contract

### ⚠️ Modification Scope
- **Read:** `docs/album-overview.md` (language field), lyrics blocks from `songs/T{N}-{track-name}.md`
- **Write:** New files under `generate/lyrics/cn/` and/or `generate/lyrics/en/`
- **Forbidden:** Modify any source files in the `songs/` directory

### Input
- `docs/album-overview.md` (**Language** field: Chinese / Chinese+English / English / Instrumental)
- `songs/T{N}-{track-name}.md` (lyrics block; no such input for instrumental tracks)

### Language Determination

| Language | Extract Chinese | Extract English |
|----------|----------------|-----------------|
| Chinese | ✅ → `cn/` | — |
| Chinese+English | ✅ → `cn/` | ✅ → `en/` |
| English | — | ✅ → `en/` |
| Instrumental | — | — |

### Output Files
```
generate/lyrics/cn/T{N}-track-name.txt              ← Chinese standard lyrics (required for Chinese/Chinese+English albums)
generate/lyrics/en/T{N}-track-name.txt              ← English standard lyrics (required for English/Chinese+English albums)
generate/lyrics/metadata.json                       ← Lyrics metadata (includes language field)
generate/lyrics/validation.txt                      ← Validation results summary
```

### Metadata Format (metadata.json)

```json
{
  "songs": [
    {
      "track": "T1-出发",
      "cn": {
        "file": "generate/lyrics/cn/T1-出发.txt",
        "char_count": 1234,
        "structure_tags": ["Intro", "Verse", "Hook", "Bridge", "Outro"],
        "section_count": 5,
        "has_hook": true,
        "tags_valid": true,
        "language": "中文"
      },
      "en": {
        "file": "generate/lyrics/en/T1-出发.txt",
        "char_count": 1180,
        "structure_tags": ["Intro", "Verse", "Hook", "Outro"],
        "section_count": 4,
        "has_hook": true,
        "tags_valid": true,
        "language": "英文"
      }
    }
  ]
}
```

### Validation
- [ ] All track lyrics files generated (based on language, determine cn/ and/or en/)
- [ ] All files ≤ 3,500 characters
- [ ] Structure tags valid and contain no descriptions
- [ ] `metadata.json` generated with complete data for each song
- [ ] `validation.txt` all ✅

### Lyrics Format Constraints
- Backing vocals/harmonies use parentheses, e.g., `(Ooh)`, `(Harmonize)`
- Structure tags must not contain any descriptive text

### Instrumental Track metadata.json Example

Instrumental tracks are marked in `metadata.json` as follows (no `.txt` files generated in `cn/` or `en/`):

```json
{
  "track": "T3-间奏",
  "has_lyrics": false,
  "language": "纯音乐"
}
```

---

## Phase 4 Contract

### ⚠️ Modification Scope
- **Read:** `generate/lyrics/cn/*.txt` + `en/*.txt` and `songs/T{N}-*.md` arrangement design
- **Write:** New `.mp3` files under `generate/cn/` and `generate/en/`, Prompt files under `generate/prompts/`
- **Forbidden:** Modify lyrics files or song design files

### Input
- `generate/lyrics/cn/*.txt` (for Chinese/Chinese+English albums) and/or `generate/lyrics/en/*.txt` (for English/Chinese+English albums)
- `songs/T{N}-*.md` (arrangement design for Prompt generation)

### Output Files
```
generate/prompts/TN-track-name-prompt1.txt     ← Prompt version 1 (arrangement-faithful type)
generate/prompts/TN-track-name-prompt2.txt     ← Prompt version 2 (emotional narrative-driven type)
generate/prompts/TN-track-name-prompt3.txt     ← Prompt version 3 (sound-quality-first type)
generate/prompts/index.json                    ← Prompt index (includes char_count)
generate/cn/TN-track-name-p1.mp3
generate/cn/TN-track-name-p2.mp3
generate/cn/TN-track-name-p3.mp3
generate/en/TN-track-name-p1.mp3
generate/en/TN-track-name-p2.mp3
generate/en/TN-track-name-p3.mp3
```

### Prompt Strategy

For each song, generate **3 different Prompt versions** by different condensation strategies from the full arrangement design, each filling the 2,000 character limit.

| Version | Condensation Strategy | Organization |
|---------|----------------------|--------------|
| 1 | Arrangement-faithful | Sequential by arrangement section timeline |
| 2 | Emotional narrative-driven | By emotional arc and narrative thread |
| 3 | Sound quality-first | Starting from final listening experience, driven by quality keywords |

### Prompt Review

An independent Prompt Review Agent performs 6 checks on all Prompts:
1. Character count ≤ 2,000 and ≥ 1,500
2. Contains all core parameters
3. No invalid information (timestamps / dB values / tables)
4. Arrangement information transmission ≥ 60%
5. MiniMax music model readable
6. Three versions are clearly differentiated

### Format Requirements
- CLI parameter: --model music-2.6
- Prompt ≤ 2,000 characters (each version fills the limit)
- Lyrics ≤ 3,500 characters
- Per song × per language × per Prompt version = independent generation task

### Validation
- [ ] All 3 Prompt versions generated for each song
- [ ] Prompt review optimization passed (all 6 items ✅)
- [ ] All output files exist and non-empty (≥ 100KB)
- [ ] Output directory structure correct (cn/ + en/ named by p1/p2/p3)
- [ ] `generate/prompts/index.json` generated

---

## Phase 5 Contract

### ⚠️ Modification Scope
- **Read:** `generate/cn/*.mp3` + `en/*.mp3` (all Take versions)
- **Write:** New `.mp3` files under `generate/cn_320k/` and `generate/en_320k/`
- **Forbidden:** Modify original generation files or delete any `.mp3`

### Input
- `generate/cn/*.mp3` + `en/*.mp3` (3 Prompt versions × per language)
- User selection table

### Output Files
```
generate/cn_320k/TN-track-name-pX.mp3
generate/en_320k/TN-track-name-pX.mp3
generate/loudness-report.txt       ← Loudness/duration report
```

### Format Requirements
- Transcoding: 320kbps, 44.1kHz, MP3
- Loudness normalization: -14 LUFS ± 0.5 LUFS (NetEase Cloud standard)
- ffprobe validation: bit_rate=320000, sample_rate=44100
- Duration validation: ≥ 1:00 and ≤ 6:00

### Validation
- [ ] One Prompt version (p1/p2/p3) selected per song, none missed
- [ ] bit_rate=320000, sample_rate=44100
- [ ] Loudness -14 LUFS ± 0.5 LUFS
- [ ] Duration ≥ 1:00 and ≤ 6:00
- [ ] `cn_320k/` file count = track count (for Chinese/Chinese+English albums)
- [ ] `en_320k/` file count = track count (for English/Chinese+English albums; skip for Chinese-only/instrumental albums)
- [ ] `loudness-report.txt` all ✅

---

## Phase 6 Contract

### ⚠️ Modification Scope
- **Read:** `docs/album-overview.md` (Phase 1's 4-dimension score overview), `songs/T{N}-*.md` (Phase 2's 5-dimension scores), `generate/cn_320k/` + `en_320k/`, `assets/`
- **Write:** New document files under `docs/` + zip archive
- **Forbidden:** Modify any files in `songs/` or `generate/` directories

**Score Overview Conversion Rule:**
Phase 1 uses 4 dimensions (Conceptual Originality / Narrative Coherence / Market Potential / Musical Consistency, 25 points each). Phase 2 uses 5 dimensions (Rhythm / Market / Structure / Philosophy / Arrangement, 20 points each).

When Phase 6 updates `docs/album-overview.md`'s score overview, replace Phase 1's 4-dimension format with Phase 2's 5-dimension format, and preserve Phase 1's original scores as historical reference (e.g., under a `## Phase 1 Concept Score` sub-block).

### Input
- `docs/album-overview.md`
- `songs/T{N}-*.md` (cover highlight copy, market evaluation)
- `generate/cn_320k/` + `en_320k/`
- `assets/` cover concept imagery

### Output Files
| File | Content |
|------|---------|
| `docs/album-overview.md` | Album overview (fully updated) |
| `docs/promotional-materials.md` | Promotional document (filled from template) |
| `docs/artist-story-cn.md` | Artist story Chinese long version (~1,800 characters) |
| `docs/artist-story-en.md` | Artist story English long version (~1,400 words) |
| `docs/artist-story-short.md` | Artist story Chinese + English short versions (~400 characters/words each) |
| `docs/artist-story-quotes.md` | Quote extracts (5 Chinese-English pairs) |
| `docs/cover-concept.md` | Cover concept (≥3 directions + HEX palette + structured image generation description) |
| `docs/platform-check.txt` | Platform compliance check results |
| `*.zip` | `<project-root>/<Album Name>-promo-materials.zip` |

### Phase 6.4.5 Contract — Cover Prompt Generator

#### Input
| Source | File | Content |
|--------|------|---------|
| Phase 6.4 | `docs/cover-concept.md` | Cover concept proposals |
| Phase 1 | `docs/album-overview.md` | Core concept/narrative arc |
| Phase 2 | `songs/T{N}-{track-name}.md` | Core imagery for each song |

#### Output Files
```
generate/covers/prompts/album-cover-prompt1.txt     ← Album cover Version 1: Concept-faithful
generate/covers/prompts/album-cover-prompt2.txt     ← Album cover Version 2: Emotional atmosphere
generate/covers/prompts/album-cover-prompt3.txt     ← Album cover Version 3: Minimalist symbol
generate/covers/prompts/T{N}-track-name-cover-prompt1.txt ← Track cover Version 1
generate/covers/prompts/T{N}-track-name-cover-prompt2.txt ← Track cover Version 2
generate/covers/prompts/T{N}-track-name-cover-prompt3.txt ← Track cover Version 3
generate/covers/prompts/index.json                  ← Prompt index
```

#### Prompt Strategy

| Version | Strategy | Organization | Character Limit |
|---------|----------|--------------|----------------|
| 1 | Concept-faithful | Direct mapping from cover concept proposal | ≤ 1,000 |
| 2 | Emotional atmosphere | From emotional arc and physicality | ≤ 1,000 |
| 3 | Minimalist symbol | Core paradox → visual symbol | ≤ 1,000 |

#### Validation
- [ ] 3 album cover Prompts generated
- [ ] 3 track cover Prompts generated per song
- [ ] Each Prompt ≤ 1,000 characters
- [ ] index.json generated

### Phase 6.4.6 Contract — Cover Executor

#### Input
| Source | File | Content |
|--------|------|---------|
| Phase 6.4.5 | `generate/covers/prompts/*.txt` | Cover Prompt files |
| Phase 6.4.5 | `generate/covers/prompts/index.json` | Prompt index |

#### Output Files
```
generate/covers/album-cover-p1.png              ← Album cover Version 1
generate/covers/album-cover-p2.png              ← Album cover Version 2
generate/covers/album-cover-p3.png              ← Album cover Version 3
generate/covers/tracks/T{N}-track-name-p1.png   ← Track cover Version 1
generate/covers/tracks/T{N}-track-name-p2.png   ← Track cover Version 2
generate/covers/tracks/T{N}-track-name-p3.png   ← Track cover Version 3
```

#### Format Requirements
- CLI tool: `mmx image generate`
- Resolution: 2048×2048px (square)
- Format: PNG

#### Validation
- [ ] 3 album covers generated (≥ 50KB each)
- [ ] All track covers generated (N tracks × 3 images)
- [ ] Output directory structure correct

### Phase 6.7 Contract — Promo Video Executor

#### Input
| Source | File | Content |
|--------|------|---------|
| Phase 6 | `docs/album-overview.md` | Core concept/track list |
| Phase 6 | `docs/promotional-materials.md` | Promotional document |
| Phase 6 | `docs/cover-concept.md` | Cover concept |
| Phase 6.4.6 | `generate/covers/album-cover-p1.png` | Best album cover (first-frame reference) |

#### Output Files
```
docs/promo-video.mp4           ← Promotional video (6 seconds)
```

#### Format Requirements
- CLI tool: `mmx video generate`
- Model: MiniMax-Hailuo-2.3
- Aspect ratio: default 16:9
- First-frame reference: optional (recommended: album-cover-p1.png)

#### Validation
- [ ] Full version video generated (≥ 1MB)
- [ ] Short version video generated (≥ 1MB)
- [ ] Video duration matches spec (fixed 6 seconds)

### Platform Compliance Check

| Check Item | NetEase Cloud | QQ Music |
|------------|--------------|----------|
| Format | MP3 320kbps | FLAC/MP3 320kbps |
| Sample Rate | 44.1kHz | 44.1kHz |
| Loudness | -14 LUFS | -14 LUFS |
| Min Duration | ≥ 60 seconds | ≥ 60 seconds |
| Max Duration | ≤ 6 minutes | ≤ 6 minutes |
| Min Track Count | 3 | 3 |
| Required Info | Album name / tracks / artist | Album name / tracks / artist |

### Validation
- [ ] All files exist and non-empty
- [ ] Production info annotations accurate (AI generation tool/scale/standard)
- [ ] Track list matches Phase 5 final files
- [ ] `platform-check.txt` NetEase Cloud / QQ Music all ✅

---

## Inter-Phase File Dependencies

```
Phase 1 Output → Phase 2 Input
  docs/album-overview.md  ──track positioning table──→  Basic Info table per song
  docs/album-overview.md  ──narrative arc/tonal──→  Arrangement tonal/BPM/style

Phase 2 Output → Phase 3 Input
  songs/T{N}-*.md  ──lyrics block──→  generate/lyrics/cn/T{N}-track-name.txt
  songs/T{N}-*.md  ──English version──→  generate/lyrics/en/T{N}-track-name.txt (if applicable)

Phase 3 Output → Phase 4 Input
  generate/lyrics/cn/*.txt  ──lyrics──→  MiniMax CLI --lyrics-file
  generate/lyrics/en/*.txt  ──lyrics──→  MiniMax CLI --lyrics-file
  songs/T{N}-*.md  ──arrangement design──→  3-version Prompt generation

Phase 4 Output → Phase 5 Input
  generate/cn/*.mp3  ──listening──→  Selected Prompt version (p1/p2/p3)
  generate/en/*.mp3  ──listening──→  Selected Prompt version (p1/p2/p3)

Phase 5 Output → Phase 6 Input
  generate/cn_320k/*.mp3  ──final audio──→  Upload to platform
  generate/en_320k/*.mp3  ──final audio──→  Upload to platform
  songs/T{N}-*.md  ──highlight copy──→  promotional-materials.md
  docs/album-overview.md  ──overview info──→  album-packager

Phase 6 Internal Dependencies
  docs/cover-concept.md  ──structured description──→  phase6-cover-prompt-generator
  generate/covers/prompts/*.txt  ──Prompts──→  phase6-cover-executor → cover PNG
  generate/covers/album-cover-p1.png  ──first-frame reference──→  phase6-promo-video-executor
  docs/promotional-materials.md  ──video script──→  phase6-promo-video-executor → promo video MP4
  All outputs (covers + video + documents)  ──→  phase6-packager → zip archive
```
