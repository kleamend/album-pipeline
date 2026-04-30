# Phase 6.4.5 — Cover Prompt Generator Skill

> Generate 3 image generation Prompts with different visual strategies from cover concept plan and track core imagery, for MiniMax image-01 model.

---

## Trigger

Automatically initiated after phase6-cover-designer completes.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 6 | `docs/cover-concept.md` | Cover concept plan (≥3 visual directions + color scheme) |
| Phase 1 | `docs/album-overview.md` | Core concept/narrative axis/tonality main line |
| Phase 2 | `songs/T{N}-track.md` | Core imagery/physical sensation/emotional arc for each track |

---

## Execution

### ⚠️ Modification Scope
- **Read**: `docs/cover-concept.md`, `docs/album-overview.md`, `songs/T{N}-*.md`
- **Write**: `generate/covers/prompts/album-cover-prompt{1,2,3}.txt`, `generate/covers/prompts/T{N}-track-cover-prompt{1,2,3}.txt`
- **Forbidden**: Modify any source document files

### Core Principle

Cover concept plan is a textual description of design intent. The image-01 model needs structured visual Prompts to generate high-quality images. Therefore, translate the concept plan into **3 Prompts with different visual strategies**, each ≤ 1000 characters (image-01 model doesn't need longer).

### Album Cover Prompt — Version 1: Concept-Faithful Type

**Condensation Strategy**: Directly map the best visual direction from `docs/cover-concept.md`, faithfully restoring design intent.

**Output Format (≤ 1000 characters):**
```
Album cover art, {main visual description from cover-concept.md}, {color tone}, {composition method}, {texture/style}, {typography hint}
Style: {photography/illustration/3D rendering/abstract}, Mood: {emotion}, Color palette: {primary HEX + secondary HEX}
Usage: 3000x3000px square format, centered composition
```

**Condensation Rules:**
- Extract HEX color values from cover-concept.md color scheme
- Retain visual metaphor of core paradox
- Emphasize "recognizable at small size" (streaming thumbnail scenario)

### Album Cover Prompt — Version 2: Emotional-Atmosphere Type

**Condensation Strategy**: Start from album emotional arc and physical sensation, emphasize atmosphere, color tone, and sensory experience.

**Output Format (≤ 1000 characters):**
```
Album cover art, {atmosphere scene description}, {color tone/lighting}, {spatial sense}, {texture}, {emotional tone}
Style: {photography/illustration/3D rendering/abstract}, Mood: {emotional arc start→end mapping}, Color palette: {primary HEX + secondary HEX}
Usage: 3000x3000px square format, atmospheric composition, negative space for typography
```

**Condensation Rules:**
- Extract physical sensation keywords from songs/T{N}-*.md emotional arc
- Emphasize lighting/color tone/spatial sense (atmosphere first)
- Whitespace consideration (reserved space for subsequent album name/artist name layout)

### Album Cover Prompt — Version 3: Minimalist-Symbol Type

**Condensation Strategy**: Extract core paradox into a visual symbol, minimalist composition, strong visual impact.

**Output Format (≤ 1000 characters):**
```
Album cover art, {core visual symbol}, {minimalist background}, {contrast/tension}, {typography hint}
Style: {minimalist illustration/graphic design/symbol photography}, Mood: {visual tension of core paradox}, Color palette: {primary HEX + accent HEX}
Usage: 3000x3000px square format, bold centered element, high contrast
```

**Condensation Rules:**
- Condense core paradox into one visualizable symbol
- Minimalism (less is more)
- High contrast, highly recognizable at small size

### Single Track Cover Prompts

Generate corresponding single track cover Prompts for each song (reusing album cover's 3-version strategy):

```
generate/covers/prompts/T{N}-track-cover-prompt1.txt
generate/covers/prompts/T{N}-track-cover-prompt2.txt
generate/covers/prompts/T{N}-track-cover-prompt3.txt
```

Single track covers extract from corresponding `songs/T{N}-*.md`:
- Core imagery (3-5)
- Physical sensation
- Emotional arc
- Cover highlight copy

Under album's unified visual language, single track covers make small variations.

### Prompt Index

Also generate `generate/covers/prompts/index.json`:

```json
{
  "album": {
    "prompts": [
      {
        "version": 1,
        "strategy": "Concept-Faithful Type",
        "file": "generate/covers/prompts/album-cover-prompt1.txt",
        "char_count": 850
      },
      {
        "version": 2,
        "strategy": "Emotional-Atmosphere Type",
        "file": "generate/covers/prompts/album-cover-prompt2.txt",
        "char_count": 820
      },
      {
        "version": 3,
        "strategy": "Minimalist-Symbol Type",
        "file": "generate/covers/prompts/album-cover-prompt3.txt",
        "char_count": 790
      }
    ]
  },
  "tracks": [
    {
      "track": "T1-Departure",
      "prompts": [
        { "version": 1, "strategy": "Concept-Faithful Type", "file": "generate/covers/prompts/T1-Departure-cover-prompt1.txt", "char_count": 800 },
        { "version": 2, "strategy": "Emotional-Atmosphere Type", "file": "generate/covers/prompts/T1-Departure-cover-prompt2.txt", "char_count": 780 },
        { "version": 3, "strategy": "Minimalist-Symbol Type", "file": "generate/covers/prompts/T1-Departure-cover-prompt3.txt", "char_count": 760 }
      ]
    }
  ]
}
```

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | Album cover 3 Prompts generated | prompt1/prompt2/prompt3 files exist |
| 2 | Each track 3 single cover Prompts generated | N tracks × 3 files |
| 3 | Character count compliant | Each Prompt ≤ 1000 characters |
| 4 | Three versions clearly differentiated | Concept-Faithful / Emotional-Atmosphere / Minimalist-Symbol, completely different strategies |
| 5 | Color scheme mapped | HEX values correctly extracted from cover-concept.md |
| 6 | Core paradox/imagery incorporated | Prompts reflect album core concept |
| 7 | index.json generated | Album + all tracks' Prompt metadata complete |
| 8 | Whitespace/typography consideration | At least one version includes typography negative space hint |

All ✅ → Proceed to phase6-cover-executor
