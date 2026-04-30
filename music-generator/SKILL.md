# Music Generator — Music Generation Skill

> Phase 4 main entry point. Orchestrates 3 sub-modules: Prompt Generation → Prompt Review → CLI Parallel Generation.

---

## Core Principles

1. **Strict File Contract**: All input/output must strictly follow `FILE_CONTRACTS.md` — no deviations
2. **Mandatory Sub-agent Separation**: prompt-generator ≠ prompt-reviewer ≠ music-executor — 3 independent `sessions_spawn` calls
3. **Main Agent Only Orchestrates**: The main agent handles launch/wait/completion judgment — it does not generate Prompts or execute CLI directly

---

## Sub-Module Index

| Sub-module | Path | Description |
|-----------|------|-------------|
| Phase 4.1 | `phase4-prompt-generator/SKILL.md` | 3-version Prompt generation (arrangement-faithful / emotional-narrative / sonic-texture) |
| Phase 4.2 | `phase4-prompt-reviewer/SKILL.md` | Prompt review and optimization (6 checks) |
| Phase 4.3 | `phase4-music-executor/SKILL.md` | MiniMax CLI parallel generation |

**Execution order**: 4.1 → 4.2 → 4.3 (serial dependency; each phase must complete before the next begins)

---

## Pre-Launch Notice (User Expectation Management)

**⚠️ Feishu push mechanism: messages are delivered after the turn ends. You must output the notice first, then spawn sub-agents, then `sessions_yield`.**

**Correct flow:**
1. Main agent outputs notice:
   > 🪚 Phase 4 music generation started. {N} songs × 3 Prompt versions × {language count} languages = {total} generation tasks. Estimated ~ **{N × 10 minutes}** to complete. I will notify you proactively when done — no need to wait.
2. Spawn sub-agents in order (4.1 → 4.2 → 4.3)
3. `sessions_yield` to end the current turn

---

## Triggers

After Phase 3 completes, user commands:
- "Generate music"
- "Phase 4"
- "Music generation"

---

## Input

- Chinese standard lyrics files under `generate/lyrics/cn/`
- English standard lyrics files under `generate/lyrics/en/`
- Track positioning table from `docs/album-overview.md` (BPM / key / style)
- Complete arrangement designs from `songs/TN-*.md` (used for Prompt generation)

---

## Execution

### ⚠️ Scope of Modification
- **Read**: `generate/lyrics/cn/*.txt` + `en/*.txt`, `songs/T{N}-*.md` arrangement designs
- **Write**: New .mp3 files under `generate/cn/` and `generate/en/`, Prompt files under `generate/prompts/`
- **Forbidden**: Modify lyrics files or song design files

### 1. 3-Version Prompt Generation

For each song, start from the complete arrangement design in `songs/TN-title.md` and generate **3 Prompt versions with different condensation strategies**.

**Core principle: Fill the 2000-character limit.** Arrangement design has too much information to fit in a single Prompt, so three different condensation strategies are used, each presenting the previous labor as fully as possible.

#### Prompt Version 1 — Arrangement-Faithful Reconstruction

**Condensation strategy**: Condense in arrangement paragraph timeline order, preserving the most precise structural descriptions.

**Format (≤ 2000 characters):**
```
{Genre} {Style}, {BPM}BPM, {Key}

Mood Arc: {Starting emotion} → {Ending emotion}

Structure Timeline:
[Intro {start}-{end}] {Timbre/Instruments/Atmosphere}
[Verse {start}-{end}] {Vocal processing/Accompaniment density/Spatial feel}
[Pre Chorus {start}-{end}] {Tension-building method}
[Hook {start}-{end}] {Climax arrangement characteristics/Harmonic layers}
[Bridge {start}-{end}] {Variation/Space/Turnaround}
[Outro {start}-{end}] {Closing method/Fade-out/Space}

Vocals: {Vocal type, processing methods, harmonic arrangement}
Instruments: {Lead instrument list + timbre characteristics}
Key Elements: {Key sound effects / Sound Design core items}
Scene: {Usage scenario}
```

#### Prompt Version 2 — Emotional Narrative Driven

**Condensation strategy**: Organize by emotional arc and narrative thread, highlighting physical sensation and philosophical core.

**Format (≤ 2000 characters):**
```
{Genre} {Style}, {BPM}BPM, {Key}

Narrative: {Core paradox → Emotional transformation path}

Emotional Journey:
- Opening: {Opening atmosphere + physical sensation cues}
- Build: {Tension accumulation method + imagery-corresponding music treatment}
- Climax: {Hook emotional peak + core Hook's musical expression}
- Resolution: {Closing emotion + musical resolution of the paradox}

Body & Texture: {Sonic texture mapped from physical sensation keywords}
Vocal Character: {Vocal personality + emotional distance (intimate/distant)}
Instrument Palette: {Instrument selection + timbre metaphor}
Spatial Design: {Spatial feel/Reverb/Distance layers}
Key Elements: {Sound Design effects that serve the narrative}
Scene: {Usage scenario}
```

#### Prompt Version 3 — Sonic Texture Priority

**Condensation strategy**: Start from the final listening experience, driven by texture keywords — best suited for AI generation models.

**Format (≤ 2000 characters):**
```
{Genre} {Style}, {BPM}BPM, {Key}

Overall Texture: {Overall sonic description, e.g. "warm granular texture + low-frequency breathing sensation"}

Sonic Layers:
Layer 1 (Foreground): {Vocals/Lead melody + texture}
Layer 2 (Mid): {Accompaniment + Harmony + Rhythmic framework}
Layer 3 (Background): {Atmosphere layer + Space + Drone}

Timbre Focus:
- Vocals: {Timbre characteristics + processing methods (close-mic/distant/breathy/shattered/harmonic)}
- Rhythm: {Drum characteristics + rhythm density + Groove}
- Harmony: {Harmonic style + tension level}
- Bass: {Low-frequency role + texture}
- Lead: {Lead instrument + timbre}
- FX: {Sound effects/Spatial effects/Special processing}

Dynamic Shape: {Overall dynamic curve — where dense/where sparse}
Emotional Weight: {Emotional center of gravity — where heaviest/where lightest}
Reference Vibe: {Closest reference feel, without naming specific artists}
Scene: {Usage scenario}
```

### 2. Write Prompts to Files

Write the 3 Prompt versions to `generate/prompts/`:

```
generate/prompts/TN-title-prompt1.txt
generate/prompts/TN-title-prompt2.txt
generate/prompts/TN-title-prompt3.txt
```

Each file contains the corresponding Prompt text (plain text, ≤ 2000 characters).

Also generate `generate/prompts/index.json`:

```json
{
  "songs": [
    {
      "track": "T1-Departure",
      "prompts": [
        {
          "version": 1,
          "strategy": "Arrangement-Faithful Reconstruction",
          "file": "generate/prompts/T1-Departure-prompt1.txt",
          "char_count": 1980
        },
        {
          "version": 2,
          "strategy": "Emotional Narrative Driven",
          "file": "generate/prompts/T1-Departure-prompt2.txt",
          "char_count": 1950
        },
        {
          "version": 3,
          "strategy": "Sonic Texture Priority",
          "file": "generate/prompts/T1-Departure-prompt3.txt",
          "char_count": 1970
        }
      ]
    }
  ]
}
```

### 3. Prompt Review and Optimization

Spawn an independent **Prompt Review Agent** to review and optimize all Prompts.

**Review Agent input**: All Prompt files under `generate/prompts/` + `generate/prompts/index.json`

**Review Agent execution**:

For each Prompt version, check each item:

| # | Checkpoint | Standard |
|---|-----------|---------|
| 1 | Character count | ≤ 2000 and ≥ 1500 (fill the upper limit) |
| 2 | All core parameters present | Genre/Style/BPM/Key/Mood/Vocals/Instruments |
| 3 | No invalid information | No millisecond-precision timestamps, no dB values, no Sound Design tables |
| 4 | Arrangement information coverage | At least 60% of core arrangement design information covered |
| 5 | Readability | Structured text that the MiniMax music model can understand |
| 6 | 3-version differentiation | 3 versions are distinctly different, not minor tweaks of the same text |

**Optimization actions**:
- If character count < 1500 → supplement arrangement details until close to 2000
- If core parameters are missing → supplement from `songs/TN-title.md`
- If invalid information is present → rewrite as model-understandable descriptions
- If 3-version differentiation is insufficient → strengthen differentiation

**Output**: Update Prompt files under `generate/prompts/` (overwrite originals), update char_count in `index.json`.

### 4. Music Generation

Using the review-optimized 3 Prompt versions, generate 3 Takes each.

**N songs = N parallel agent groups**, each agent group handles all Prompt versions for one song. Per song:
- 3 Prompt versions → 3 parallel generation tasks
- Bilingual album → Chinese × 3 + English × 3 = 6 parallel tasks

⚠️ **Note**: MiniMax music-2.6 has API rate limits. On 429 response, degrade to serial generation, waiting 2-3 seconds between each song.

**CLI commands**:

```bash
# Prompt Version 1
minimax music generate \
  --model music-2.6 \
  --prompt "$(cat generate/prompts/T1-Departure-prompt1.txt)" \
  --lyrics-file generate/lyrics/cn/T1-Departure.txt \
  --vocals {extracted from prompt} \
  --genre {extracted from prompt} \
  --mood {extracted from prompt} \
  --instruments {extracted from prompt} \
  --bpm {extracted from prompt} \
  --key {extracted from prompt} \
  --structure {song structure} \
  --extra "{additional granular requirements}" \
  --out generate/cn/T1-Departure-p1.mp3

# Prompt Version 2 → T1-Departure-p2.mp3
# Prompt Version 3 → T1-Departure-p3.mp3
```

### 5. Output Management

```
generate/cn/TN-title-p1.mp3
generate/cn/TN-title-p2.mp3
generate/cn/TN-title-p3.mp3
generate/en/TN-title-p1.mp3
generate/en/TN-title-p2.mp3
generate/en/TN-title-p3.mp3
```

The 3 Prompt versions correspond to 3 Takes (p1/p2/p3); the user selects the best version after listening.

---

## Checklist

| # | Checkpoint | Completion Criteria |
|---|-----------|-------------------|
| 1 | Lyrics file paths correct | Point to standard files under `generate/lyrics/` |
| 2 | 3 Prompt versions generated | Each song has prompt1/prompt2/prompt3 with different strategies |
| 3 | Prompts fill upper limit | Each Prompt ≥ 1500 and ≤ 2000 characters |
| 4 | Prompts written to files | `generate/prompts/TN-title-promptN.txt` exists |
| 5 | Prompt review and optimization complete | Review Agent passed all 6 checks; all ✅ |
| 6 | Generation success verified | Files exist, playable, not silent/error audio |
| 7 | All Takes complete | Each song × 3 Prompt versions × each language has output |

---

## Output File Contract

Strictly follows Phase 4 contract in `FILE_CONTRACTS.md`.

---

## Conditions to Enter Phase 5

- [ ] All 3 Prompt versions generated for each song
- [ ] Prompt review and optimization passed
- [ ] All output files exist and are playable
- [ ] Output directory structure correct (cn/ + en/ named by p1/p2/p3)

All ✅ → Enter Phase 5 (Selection + Transcoding)

---

## Key Constraints

| Parameter | Value |
|-----------|-------|
| Available models | music-2.6 (requires credits), music-2.6-free (pay-per-use) |
| Single generation duration | Can generate 3-5 minutes of high-quality content; quality typically scales with duration (see tuning experiment data, pending) |
| Lyrics length | ≤ 3,500 characters |
| Prompt length | ≤ 2,000 characters (fill the upper limit) |
| Takes per song | 3 (corresponding to 3 Prompt versions) |
