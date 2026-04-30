# Phase 4 — Prompt Generator Skill

> Generates 3 Prompt versions with different condensation strategies from the complete arrangement design, each filling the 2000-character limit.

---

## Trigger

Automatically starts as the first step of Phase 4 after Phase 3 completes.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 2 | `songs/T{N}-title.md` | Complete arrangement design (paragraphs/time/instruments/Sound Design/emotional arc) |
| Phase 2 | `songs/T{N}-title.md` | Basic information table (BPM/Key/Style/Emotional Arc/Core Paradox) |
| Phase 3 | `generate/lyrics/cn/T{N}-title.txt` | Chinese standard lyrics (not applicable for instrumental tracks) |
| Phase 3 | `generate/lyrics/en/T{N}-title.txt` | English standard lyrics (if applicable; not applicable for instrumental tracks) |

**Instrumental handling**: Instrumental tracks have no `--lyrics-file` parameter; Prompts focus on arrangement/timbre/emotion description. The 3-version condensation strategy remains the same.

---

## Execution

### ⚠️ Scope of Modification
- **Read**: `songs/T{N}-title.md` (arrangement design + basic info), `generate/lyrics/cn/*.txt` (regular tracks), `generate/lyrics/en/*.txt` (if applicable; regular tracks)
- **Write**: `generate/prompts/T{N}-title-promptN.txt`
- **Forbidden**: Modify any files in `songs/` or `generate/lyrics/`

### Core Principle

The complete arrangement design has too much information to fit into a single Prompt (music-2.6 limit: ≤ 2000 characters). Therefore, **3 different condensation strategies** are used, each conveying the arrangement labor as fully as possible.

### Prompt Version 1 — Arrangement-Faithful Reconstruction

**Condensation strategy**: Condense in arrangement paragraph timeline order, preserving the most precise structural descriptions.

**Output format (≤ 2000 characters):**
```
{Genre} {Style}, {BPM}BPM, {Key}

Mood Arc: {Starting emotion} → {Ending emotion}

Structure Timeline:
[Intro] {Timbre/Instruments/Atmosphere}
[Verse] {Vocal processing/Accompaniment density/Spatial feel}
[Pre Chorus] {Tension-building method}
[Hook] {Climax arrangement characteristics/Harmonic layers}
[Bridge] {Variation/Space/Turnaround}
[Outro] {Closing method/Fade-out/Space}

Vocals: {Vocal type, processing methods, harmonic arrangement}
Instruments: {Lead instrument list + timbre characteristics}
Key Elements: {Key sound effects / Sound Design core items}
Scene: {Usage scenario}
```

**Condensation rules:**
- Preserve the core time range and arrangement action of each section
- Remove millisecond-precision timestamps, dB values, and Sound Design tables
- Transform technical descriptions into感性 (sensory/emotive) descriptions that music models can understand
- Cover at least 60% of core arrangement design information

### Prompt Version 2 — Emotional Narrative Driven

**Condensation strategy**: Organize by emotional arc and narrative thread, highlighting physical sensation and philosophical core.

**Output format (≤ 2000 characters):**
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

**Condensation rules:**
- Use the core paradox as the narrative backbone, linking the entire song's emotion
- Extract key Sound Design effects that serve the narrative
- Emphasize vocal emotional distance (intimate/distant/breathy/shattered)
- Preserve sonic texture mappings of physical sensation keywords

### Prompt Version 3 — Sonic Texture Priority

**Condensation strategy**: Start from the final listening experience, driven by texture keywords — best suited for AI generation models.

**Output format (≤ 2000 characters):**
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

**Condensation rules:**
- Start from the texture the listener ultimately hears, not from the arrangement process
- Organize information using "layer" concepts (foreground/mid/background)
- Every frequency band/instrument role has explicit texture description
- Include dynamic curve and emotional weight distribution

---

## Write Files

Write the 3 Prompt versions to:

```
generate/prompts/TN-title-prompt1.txt
generate/prompts/TN-title-prompt2.txt
generate/prompts/TN-title-prompt3.txt
```

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

---

## Checklist

| # | Checkpoint | Completion Criteria |
|---|-----------|-------------------|
| 1 | All 3 versions generated | prompt1/prompt2/prompt3 files exist |
| 2 | Character count meets standard | Each Prompt ≥ 1500 and ≤ 2000 characters |
| 3 | 3-version differentiation clear | Not minor tweaks of the same text; condensation strategies are entirely different |
| 4 | Core parameters complete | Genre/Style/BPM/Key/Mood/Vocals/Instruments/Scene all present |
| 5 | No invalid information | No millisecond-precision timestamps, no dB values, no tables |
| 6 | Arrangement information coverage ≥ 60% | Core arrangement intent extracted from the complete arrangement design |
| 7 | index.json generated | Each song's 3 Prompt metadata complete |
| 8 | Language matching | Chinese album generates Chinese Prompts; bilingual album generates both Chinese and English Prompts |

All ✅ → Enter Prompt Review phase (phase4-prompt-reviewer)
