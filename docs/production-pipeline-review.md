# Counterfeit Migrants — Full Production Pipeline Review

> This document serves as the design foundation for AI music album production Skills.
> Records the complete process from 0 to release, specific operations at each stage, technical details, decisions, and lessons.

> ⚠️ **Phase Numbering Note**: This document uses the old Phase numbering (0-6), the current pipeline uses 1-6 numbering. Correspondence: Old Phase 0 = New Phase 0.5 (initialization), Old Phase 1 = New Phase 2 (song generation), Old Phase 2 = New Phase 3 (lyrics standardization), Old Phase 3 = New Phase 4 (music generation), Old Phase 4 = New Phase 5 (selection/transcoding), Old Phase 5 = New Phase 6 (publishing materials), Old Phase 6 = New Phase 7 (Skill design points).

---

## Overview

| Item | Value |
|------|-------|
| Album Name | Counterfeit Migrants / 《赝品候鸟》 |
| Number of Tracks | 9 tracks × 2 language versions = 18 tracks |
| Music Generation | MiniMax music-2.6 (CLI) |
| Generation Scale | 54 outputs (3 Prompt versions), 18 final selections |
| Production Period | ~10 days (2026-04-04 → 2026-04-14) |
| Release Platform | NetEase Cloud Music (Chinese/English dual album) |
| Release Date | 2026-04-14 |

---

## Phase 0: Project Initialization

### 0.1 Directory Structure

```
album-counterfeit-migrants/
├── songs/              ← Single track arrangement design (authoritative source)
│   ├── T1-Departure.md
│   ├── T2-Data.md
│   ├── ...
│   └── T9-MigrantBird.md
├── generate/           ← Music generation outputs
│   ├── lyrics/cn/      ← Chinese standard lyrics (9 files)
│   ├── lyrics/en/      ← English standard lyrics (9 files)
│   ├── cn/             ← Chinese raw generation (3 Prompt versions per track)
│   ├── en/             ← English raw generation (3 Prompt versions per track)
│   ├── cn_320k/        ← Chinese NetEase Cloud standard (9 tracks)
│   └── en_320k/        ← English NetEase Cloud standard (9 tracks)
├── docs/               ← Album overview documents
│   ├── album-overview.md       ← Album overview (scoring/track list/todos)
│   ├── cover-concept.md        ← Cover concept design
│   ├── promotional-materials.md ← Promotional materials
│   ├── artist-story-cn.md      ← Artist story (Chinese long version)
│   ├── artist-story-en.md      ← Artist story (English long version)
│   ├── artist-story-short.md   ← Artist story (Chinese/English short version)
│   └── artist-story-quotes.md  ← Quote extraction
├── assets/             ← Cover concept images (8 images)
├── output/             ← Early T1 segment generation tests (v1-v7)
└── prompts/            ← Early prompt templates
```

**Key Design Decisions:**
- `songs/*.md` is the **sole authoritative source** — lyrics, arrangement, scoring, and market analysis for each track are all here
- `generate/` outputs are **process outputs**, `cn_320k/` / `en_320k/` are the final deliverables
- `docs/` are cross-track overview documents, not in `songs/`

### 0.2 Concept Design

**Core Concept**: Identity anxiety and physical reconstruction in the digital age

**Four Narrative Axes**:
- **Direction Axis**: T1 Departure → T7 Decision → T9 Migrant Bird (cage→sky, sense of direction)
- **Data Axis**: T2 Data → T3 Counterfeit Specimen (cloud vs body, memory)
- **Self Axis**: T4 Cage → T5 Vacuum → T6 Twin (transparent wall/suffocation/mirror)
- **Farewell Axis**: T8 Goodbye (forgetting)

**Tonality Main Line**: B minor dominant (T1/T2/T3/T4/T5/T7/T9), C major (T6), D minor (T8)

---

## Phase 1: Single Track Deep Creation

### 1.1 Standard File Structure for Each Track

Each `songs/TN-*.md` file contains the following standard sections:

| Section | Content | Example (T1) |
|---------|---------|--------------|
| Basic Info Table | Axis, Hook, Paradox, Imagery, Physical Sensation, Est. Duration, Arrangement Style | B minor/85BPM/Ambient electronic |
| Lyrics | Complete lyrics with structure tags | [Intro][Verse][Pre-Hook][Hook][Bridge][Outro] |
| Complete Arrangement Design | Paragraph breakdown precise to seconds | Intro 0:00-0:30, Verse1 0:30-1:20... |
| Sound Design Table | Key sound effects, description, position, volume | Heartbeat sample 60BPM -35dB |
| Emotional Arc | Full song emotion change timeline | Trapped→longing→building→explosion→walking→peak→landing |
| Rhyme Analysis | Rhyme distribution, Hook rhyme design logic, alignment with arrangement | -kong (ong)→-ang→-a→sail/rudder |
| Market Assessment | Core selling points, audience profile, platform fit, competitive analysis, Sync potential, marketing suggestions, risk assessment | NetEase Cloud main battlefield, graduation season window |
| Scoring | Rhythm/market/structure/philosophy/arrangement, 5 dimensions × 20 points | 98/100 |
| Cover Highlight Copy | One-sentence dissemination copy | "I walked my cage into the sky." |

### 1.2 Arrangement Design Standards

**Each paragraph must include:**
- Time range (precise to seconds)
- Vocal processing method (a cappella/reverb/breathy/dry vocal/etc.)
- Instrument entry/exit times
- Sound effect design (heartbeat/footsteps/ambient/etc., with dB volume)
- Emotion labels (trapped/long for/explosion/introspection/etc.)
- Key silence design (all-instrument pause/hold breath)

**Special Design Points:**
- **Track connection**: T1 Outro T1-T2 connection design (reverse footsteps + heartbeat + ultra-low frequency pulse)
- **Dynamic BPM**: T6 uses dynamic BPM curve (68-80), largest variation in full album
- **Tonality shift**: T5 from B minor → E major (Hook2 explosion section)
- **Timbre correlation**: T4 glass/T5 vacuum/T6 water surface form imagery triangle

### 1.3 Scoring System

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Rhythm | 20 pts | Hook rhyme unity, Verse/Hook contrast, come/go contrast, rhyme × arrangement alignment |
| Market | 20 pts | Concept uniqueness, Hook dissemination power, emotional resonance, cross-media extension, algorithm friendliness |
| Structure | 20 pts | Emotional arc completeness, Hook variant dynamics, section transition naturalness |
| Philosophy | 20 pts | Core paradox penetration, reversal strength, outro breathing sense |
| Arrangement | 20 pts | Sound Design quality, track connection, physical sensation, timbre consistency |

**Quality Gate**: ≥ 80 points to enter music generation stage

**Album Final Scoring**:
| T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | Average |
|----|----|----|----|----|----|----|----|----|---------|
| 98 | 93 | 88 | 91 | 89 | 98 | 94 | 94 | 88 | 89.6 |

---

## Phase 2: Lyrics Standardization

### 2.1 Extraction Process

1. Extract pure lyrics from `songs/TN-*.md` (remove comments, arrangement design, market analysis, etc.)
2. Create standard lyrics files: `generate/lyrics/cn/TN-*.txt` + `generate/lyrics/en/TN-*.txt`
3. Lyrics format must include structure tags:

```
[Intro]
Lyrics line...

[Verse]
Lyrics line...

[Pre Chorus]
Lyrics line...

[Chorus]
Lyrics line...

[Interlude]
Lyrics line...

[Bridge]
Lyrics line...

[Outro]
Lyrics line...
```

### 2.2 Structure Tag Descriptions

| Tag | Purpose | Required |
|-----|---------|----------|
| [Intro] | Instrumental/ambient sound intro | Optional |
| [Verse] | Main verse narrative | ✅ Required |
| [Pre Chorus] | Pre-chorus buildup | Optional |
| [Chorus] | Chorus | ✅ Required |
| [Interlude] | Instrumental interlude | Optional |
| [Bridge] | Bridge emotional turn | Recommended |
| [Outro] | Outro fade | Recommended |
| [Hook] | Core memory point | Optional (replacement for Chorus) |
| [Build Up] | Emotional buildup | Optional |
| [Break] | Silence/pause | Optional |

### 2.3 Lyrics Constraints

| Parameter | Limit |
|-----------|-------|
| Total lyrics length | ≤ 3,500 characters |
| Within structure tags | No descriptive text allowed (otherwise will be sung) |
| Backing vocals | Use parentheses `(Ooh)` `(Harmonize)` |

---

## Phase 3: Music Generation (Core Production)

### 3.1 Tool Chain

| Tool | Purpose | Command |
|------|---------|---------|
| MiniMax CLI | Music generation | `minimax music generate ...` |
| ffmpeg | Transcoding/verification | `ffmpeg -i input.mp3 -b:a 320k -ar 44100 output.mp3` |

### 3.2 CLI Parameter Standards

```bash
minimax music generate \
  --model music-2.6 \
  --prompt "emotion description, style, scene" \
  --lyrics-file /path/to/lyrics.txt \
  --vocals "vocal type" \
  --genre "genre" \
  --mood "emotion" \
  --instruments "instruments" \
  --bpm <number> \
  --key "key" \
  --structure "song structure" \
  --extra "extra parameters"
```

### 3.3 Model Capabilities and Limitations

| Parameter | Value |
|-----------|-------|
| Available Models | music-2.6 (recommended, requires quota), music-2.6-free (pay-per-use) |
| Single Generation Duration | Can generate 3-5 minutes of quality content, quality typically improves with duration (see tuning experiment data, to be added) |
| Lyrics Length | ≤ 3,500 characters |
| Prompt Length | ≤ 2,000 characters (filled to limit) |
| Output Format | mp3 / wav / pcm |
| Sample Rate | 16000 / 24000 / 32000 / 44100 |
| Bitrate | 32000 / 64000 / 128000 / 256000 |
| Watermark | Can be disabled (aigc_watermark: false) |

### 3.4 Prompt Generation Strategy

**Generate 3 Prompt versions with different condensation methods from the complete arrangement design for each track:**

| Version | Condensation Strategy | Organization Method |
|---------|----------------------|-------------------|
| 1 | Arrangement-Faithful Type | Sequential by arrangement paragraph timeline |
| 2 | Emotional-Narrative Driven Type | By emotional arc and narrative thread |
| 3 | Sensory-Quality Priority Type | Starting from final sensory experience, driven by texture keywords |

Each Prompt is filled to the 2,000 character limit, then an independent Prompt Review Agent performs 6-item check optimization, then music is generated.

### 3.5 Parallel Generation Architecture

**3 agents in parallel**:

| Agent | Responsible Tracks | Description |
|-------|-------------------|-------------|
| Expert A | T1 Departure, T2 Data, T3 Counterfeit Specimen | Direction axis + Data axis |
| Expert B | T4 Cage, T5 Vacuum, T6 Twin | Self axis |
| Expert C | T7 Decision, T8 Goodbye, T9 Migrant Bird | Direction axis + Farewell axis |

**Generation Scale**:
- 3 Prompt versions: 9 tracks × 2 languages × 3 Prompts = **54 tracks**
- Total: **54 outputs**

### 3.6 Generated Output Directory

```
generate/
├── cn/              ← Chinese raw generation (3 Prompt versions per track)
│   ├── T1-Departure-p1.mp3
│   ├── T1-Departure-p2.mp3
│   ├── T1-Departure-p3.mp3
│   └── ...
└── en/              ← English raw generation
    └── ...
```

### 3.7 Key Lessons

1. **Uncontrollable duration**: AI generation duration 3-5 minutes, quality typically improves proportionally with duration
2. **Prompt length trap**: Complete arrangement design cannot be used directly as Prompt, needs to be condensed into 3 different condensation method versions, each filled to 2,000 characters
3. **Raw output management**: 54 raw files not tracked in git (too large), only final selected versions kept
4. **File cleanup**: After selection, when deleting extra versions, pay attention to git status (untracked files cannot be recovered when deleted)
5. **Regeneration mechanism**: If a Prompt version is lost, can infer from same version other track parameters to regenerate

---

## Phase 4: Selection & Transcoding

### 4.1 Selection Process

1. Raylan listens to all 54 outputs
2. Each track selects the best Prompt version (different tracks may select different versions)
3. Selection criteria: Hook clarity, emotional expression, arrangement fidelity, listening comfort

### 4.2 Transcoding Process

```bash
# Batch transcoding: all selected versions → 320kbps / 44.1kHz (NetEase Cloud standard)
ffmpeg -i input.mp3 -b:a 320000 -ar 44100 -y output.mp3
```

**Output directories**:
- `generate/cn_320k/` - Chinese 9 tracks
- `generate/en_320k/` - English 9 tracks

**Verification command**:
```bash
# Verify bitrate and sample_rate
ffprobe -v error -show_entries format=bit_rate -show_entries stream=sample_rate -of json output.mp3
```

**Verification standards**:
- bit_rate = 320000 ✅
- sample_rate = 44100 ✅

### 4.3 Final Track Selection Table

**Chinese version (cn_320k/)**:

| # | Track | Selected Prompt | Duration | Size |
|---|-------|----------------|----------|------|
| T1 | Departure | p1 | 3:24 | 7.8M |
| T2 | Data | p1 | 2:14 | 5.2M |
| T3 | Counterfeit Specimen | p1 | 2:41 | 6.2M |
| T4 | Cage | p3 | 2:15 | 5.2M |
| T5 | Vacuum | p3 | 3:22 | 7.8M |
| T6 | Twin | p3 | 2:25 | 5.6M |
| T7 | Decision | p2 | 1:59 | 4.6M |
| T8 | Goodbye | p2 | 3:12 | 7.4M |
| T9 | Migrant Bird | p1 | 2:40 | 6.2M |

**English version (en_320k/)**:

| # | Track | English Name | Selected Prompt | Duration | Size |
|---|-------|-------------|----------------|----------|------|
| T1 | Departure | Departure | p1 | 3:55 | 9.0M |
| T2 | Data | Bones Don't Delete | p2 | 2:22 | 5.5M |
| T3 | Counterfeit Specimen | Fake Wings | p1 | 3:12 | 7.4M |
| T4 | Cage | Cage | p3 | 2:33 | 5.9M |
| T5 | Vacuum | Vacuum | p3 | 3:09 | 7.3M |
| T6 | Twin | Twin | p3 | 2:26 | 5.7M |
| T7 | Decision | No Map | p2 | 2:04 | 4.8M |
| T8 | Goodbye | Please Forget Me | p2 | 2:42 | 6.2M |
| T9 | Migrant Bird | Migrant Bird | p1 | 2:39 | 6.1M |

### 4.4 Lessons

1. **T6 Chinese version lost incident**: During selection, raw source files (cn/) were accidentally deleted, and git didn't track these MP3s, making recovery impossible. Workaround: regenerate from same Prompt parameters
2. **Confirm mapping before selection**: Raylan provided duration, need to find corresponding Prompt version from duration first before operating
3. **Preserve raw outputs vs. cleanup space**: 54 raw files occupy ~200MB, confirm if rollback is needed before cleanup

---

## Phase 5: Publishing Materials Production

### 5.1 Album Overview Document

`docs/album-overview.md` contains:
- Album overview (core concept, narrative axis, target audience, reference style)
- English album info (Album Name / Description / Creator's Note)
- Track One-Liners (one-line intro for each song)
- Track list (# / Track / English Name / Axis / Core Hook / Duration / Status)
- Scoring Overview (9 tracks 5-dimension scoring)
- File index
- Todo items

### 5.2 Cover Concept

`docs/cover-concept.md` contains:
- 3 visual directions (migratory bird silhouette / bone migratory bird / mirror fragments)
- Color scheme (deep space black + neon blue/purple/pink + bone white)
- Per-track cover concept
- Application scenarios (streaming 3000×3000 / physical 300×300mm / social 800×800 / MV 1920×1080)

`assets/` has 8 concept images:
- cover-01-migratory-bird-silhouette.png
- cover-02-bone-migratory-bird.png
- cover-03-v1-cyberpunk.png
- cover-03-v2-mirror-reflection.png
- cover-03-v3-nebula-bird-bone.png
- cover-03-v4-mist-ghost.png
- cover-03-v5-paper-bone-map.png
- cover-03-mirror-fragments.png

### 5.3 Promotional Document

`docs/promotional-materials.md` contains:
- One-liner album concept
- Album introduction (300 words)
- Core promotional lines
- Per-track highlight copy (one sentence per song)
- Social Media copy (Weibo/Xiaohongshu/WeChat article titles)
- Production info
- Potential controversy points and response plans

### 5.4 Artist Story Copy

4 files:
- `artist-story-cn.md` - Chinese long version (~1800 words, five-paragraph structure)
- `artist-story-en.md` - English long version (~1400 words)
- `artist-story-short.md` - Chinese/English short version (~400 words/words each)
- `artist-story-quotes.md` - Quote extraction (5 Chinese-English pairs)

**Artist story core narrative strategy**:
- Do not hide AI generation fact, transform it into the album's most honest metaphor
- "Borrowed voices singing real pain" — collaboration, not replacement
- Clearly note all 9 tracks 36 versions throughout the album were generated by music-2.6

### 5.5 Packaging

```bash
# Package promotional materials
zip -r counterfeit-migrants-artist-story-minimax.zip \
  artist-story-cn.md \
  artist-story-en.md \
  artist-story-short.md \
  artist-story-quotes.md \
  promotional-materials.md \
  album-overview.md \
  cover-concept.md
```

---

## Phase 6: Release

### 6.1 NetEase Cloud Music

- Chinese album ID: 370761076
- English album ID: 370788757
- Release account: Raylan LIN (User ID: 5112703101)

### 6.2 Upload Requirements

| Item | Standard |
|------|----------|
| Audio format | MP3, 320kbps, 44.1kHz |
| Cover dimensions | 3000×3000px square |
| Album name | One each for Chinese/English |
| Track info | Song name, lyricist, composer, arranger, lyrics |
| Album description | ~200 words |

---

## Phase 7: Skill Design Points

### 7.1 Pipeline Module Division

```
┌─────────────────────────────────────────────────┐
│  Phase 0: Album Concept                         │
│  ─ Concept design + narrative axis + tonality   │
│    main line + track positioning                │
├─────────────────────────────────────────────────┤
│  Phase 1: Song Writing                          │
│  ─ Lyrics + arrangement + Sound Design + scoring│
├─────────────────────────────────────────────────┤
│  Phase 2: Lyrics Standardization               │
│  ─ Lyrics standardization extraction (structure) │
├─────────────────────────────────────────────────┤
│  Phase 3: Music Generation                     │
│  ─ MiniMax CLI batch generation                 │
│    (3 Prompt versions in parallel)               │
├─────────────────────────────────────────────────┤
│  Phase 4: Selection & Transcoding              │
│  ─ Listening selection + ffmpeg transcoding      │
│    + verification                              │
├─────────────────────────────────────────────────┤
│  Phase 5: Publishing Materials                 │
│  ─ Overview docs + cover + promotional +       │
│    artist story                                │
├─────────────────────────────────────────────────┤
│  Phase 6: Release                             │
│  ─ Platform upload (NetEase Cloud, etc.)       │
└─────────────────────────────────────────────────┘
```

### 7.2 Each Skill's Responsibility Boundary

| Skill Name | Input | Output | Trigger Condition |
|------------|-------|--------|------------------|
| `album-concept` | Core concept/theme | album-overview.md skeleton + track positioning table | "I want to make an album about XX" |
| `song-writer` | Track positioning + arrangement direction | songs/TN-*.md (lyrics+arrangement+scoring+market) | "Write track N" |
| `lyrics-formatter` | songs/TN-*.md | generate/lyrics/cn/TN.txt + en/TN.txt | "Extract lyrics" |
| `music-generator` | Lyrics file + arrangement parameters | MP3 files under generate/cn/ + en/ | "Generate music" |
| `audio-transcoder` | Selected MP3 list | Transcoded files under cn_320k/ + en_320k/ | "Transcode to NetEase Cloud standard" |
| `album-packager` | Selected tracks + cover | Full promotional materials under docs/ + zip package | "Package publishing materials" |

### 7.3 Key Engineering Points

1. **Single authoritative source**: `songs/*.md` is the sole authoritative source for lyrics/arrangement; all others are derived outputs
2. **Directory isolation**: Raw generation (cn/ en/) vs. final delivery (cn_320k/ en_320k/) separated
3. **Quality gate**: Scoring ≥ 80 to enter generation; transcoding verification passed to enter publishing
4. **Parallelization**: 3 agents simultaneously process different tracks, each agent handles 3 songs
5. **Version naming**: `TN-track-p{1,2,3}.mp3` unified format
6. **git management**: Documents tracked in git, audio not (too large)
7. **CLI parameter solidification**: prompt/vocals/genre/mood/instruments/bpm/key/structure/extra form standard template

### 7.4 Optimization Points

| Issue | This Round's Lesson | Skill Improvement Direction |
|-------|-------------------|---------------------------|
| Uncontrollable duration | AI generation duration 3-5 minutes, quality improves with duration | Skill should accept "actual duration" as constraint, not pursue arrangement duration |
| Prompt length | Complete arrangement design cannot be directly used as Prompt, needs 3 different condensation versions | Needs Prompt generation module + Review Agent optimization |
| File management | Accidental deletion unrecoverable | Skill should confirm git status before deletion, provide rollback mechanism |
| Version selection | Matching Prompt version by duration is error-prone | Skill should maintain "selection table", operate by Prompt version name not duration |
| Cover | 8 concept images, not finally selected | Can add "cover selector" sub-module |
| Release | Manual upload to NetEase Cloud | No API yet, Skill outputs upload checklist and metadata |

---

## Appendix: Arrangement Design Prompt → Generation Prompt Conversion Example

### Arrangement Design (songs/T1-Departure.md excerpt)

```
Intro "Morning Room" Design (0:00-0:30)
- Piano single note very softly enters, B minor tonic chord arpeggiation
- Ambient sound (morning room background noise, window wind), -40dB padding
- Piano left hand octave bass enters, like footsteps slowly approaching
- Emotion: trapped → longing to depart
```

### Generation Prompt (actually passed to CLI)

```
Ambient electronic + narrative, B minor, 85BPM
Transition from trapped to walking. Piano single note opens, minimal chord bed.
Vocal enters a cappella, deep reverb.
Emotion from suppression to release, full band explosion at Hook.
Reference: Hua Chenyu-style philosophical lyrics + physical sensation imagery
```

**Conversion rules**:
- Remove precise timestamps, dB values, specific sound effect parameters
- Keep: style, key, BPM, emotional arc, key timbre features
- Add: vocal type, instruments, genre, scene

---

## Appendix: T1-T9 Arrangement Parameters Quick Reference

| # | Track | Key | BPM | Style | Hook | Prompt Selected |
|---|-------|-----|-----|-------|------|----------------|
| T1 | Departure | B minor | 85 | Ambient electronic + narrative | Walk into sky | p1 |
| T2 | Data | B minor | 112 | Electronic dark tide | Bones remember, can't delete | p1 |
| T3 | Counterfeit Specimen | B minor | 112 | Industrial electronic/post-punk | Hurts more than real | p1 |
| T4 | Cage | B minor | 138→130 | Electronic + explosive | More awake with each crash | p3 |
| T5 | Vacuum | B minor→E major | 60→72 | Experimental electronic + suffocation | Pain lets you breathe | p3 |
| T6 | Twin | C major | 68-80 dynamic | Piano + water reflection | Mirror is not me | p3 |
| T7 | Decision | B minor | 80+ | Physical rock | Migratory bird has no map | p2 |
| T8 | Goodbye | Dark tone | 90-95 | Silence + door imagery | Please forget me | p2 |
| T9 | Migrant Bird | B minor | 85 | Ambient electronic + narrative | Walking is the truest direction | p1 |

**Prompt distribution pattern**:
- Prompt 1 (Arrangement-Faithful Type): T1/T2/T3/T9 — direction axis endpoints and data axis, arrangement design itself already excellent
- Prompt 2 (Emotional-Narrative Driven Type): T7/T8 — farewell axis, emotional narrative is core
- Prompt 3 (Sensory-Quality Priority Type): T4/T5/T6 — self axis, needs stronger physical sensation and texture
