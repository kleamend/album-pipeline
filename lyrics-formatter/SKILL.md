# Lyrics Formatter — Lyrics Standardization Skill

> Phase 3 entry point. Extracts standardized lyrics files from Phase 2's `songs/TN-*.md` outputs for use in Phase 4 music generation.

---

## Core Principles

1. **Strict File Contract**: All input/output must strictly follow `FILE_CONTRACTS.md` — no deviations
2. **Sub-agent Execution**: Lyrics standardization is handled by an independent `sessions_spawn` sub-agent
3. **Main Agent Only Orchestrates**: The main agent handles launch/wait/validation — it does not extract lyrics directly

---

## Pre-Launch Notice (User Expectation Management)

**⚠️ Feishu push mechanism: messages are delivered after the turn ends. You must output the notice first, then spawn the sub-agent, then `sessions_yield`.**

**Correct flow:**
1. Main agent outputs notice:
   > 🪚 Phase 3 lyrics standardization started. Estimated ~ **{N × 2 minutes}** to complete. I will notify you proactively when done — no need to wait.
2. Spawn sub-agent immediately
3. `sessions_yield` to end the current turn

---

## Triggers

After all Phase 2 songs pass, user commands:
- "Extract lyrics"
- "Phase 3"
- "Lyrics standardization"

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 2 | `docs/album-overview.md` | Tracklist + **Language** field |
| Phase 2 | `songs/TN-title.md` | Complete lyrics block for each song |

---

## Execution

### ⚠️ Scope of Modification
- **Read**: The "Lyrics" block from `songs/T{N}-title.md`
- **Write**: New files under `generate/lyrics/cn/` and `generate/lyrics/en/`
- **Forbidden**: Modify any source files in the `songs/` directory

### 1. Language Detection

Read the **`Language`** field from `docs/album-overview.md`:

| Language | Extract Chinese | Extract English |
|---------|---------------|----------------|
| Chinese | ✅ Read "Lyrics" block → `cn/` | - |
| Chinese + English | ✅ Read "Lyrics" block → `cn/` | ✅ Read "English Lyrics" block → `en/` |
| English | - | ✅ Read "English Lyrics" block → `en/` |
| **Instrumental** | - | - |

**Instrumental handling**: Skip lyrics extraction for that track, mark `has_lyrics: false` in `metadata.json`, and note "Instrumental, skipped" in `validation.txt`.

### 2. Extract Chinese Lyrics Per Track (Language = Chinese / Chinese + English)

For each `songs/TN-title.md`:
- Read the "Lyrics" block (content between `## Lyrics` and the next `##`)
- Remove all comments, arrangement descriptions, and market analysis
- Keep pure lyrics + structure tags only
- Ensure structure tags use officially supported format
- **Write** to `generate/lyrics/cn/TN-title.txt`

### 3. Extract English Lyrics Per Track (Language = English / Chinese + English)

For each `songs/TN-title.md`:
- Read the "English Lyrics" block (content between `## English Lyrics` and the next `##`)
- Remove all comments, arrangement descriptions, and market analysis
- Keep pure lyrics + structure tags only
- Ensure structure tags use officially supported format
- **Write** to `generate/lyrics/en/TN-title.txt`

### 4. Output Standard Lyrics Files

```
generate/lyrics/cn/TN-title.txt    ← Chinese standard lyrics (required for Chinese / Chinese + English albums)
generate/lyrics/en/TN-title.txt    ← English standard lyrics (required for English / Chinese + English albums)
```

### 5. Generate Lyrics Metadata

Output `generate/lyrics/metadata.json`:
```json
{
  "songs": [
    {
      "track": "T1-Departure",
      "cn": {
        "file": "generate/lyrics/cn/T1-Departure.txt",
        "char_count": 1234,
        "structure_tags": ["Intro", "Verse", "Pre Chorus", "Hook", "Bridge", "Outro"],
        "section_count": 6,
        "has_hook": true,
        "tags_valid": true,
        "language": "Chinese"
      },
      "en": {
        "file": "generate/lyrics/en/T1-Departure.txt",
        "char_count": 1180,
        "structure_tags": ["Intro", "Verse", "Hook", "Outro"],
        "section_count": 4,
        "has_hook": true,
        "tags_valid": true,
        "language": "English"
      }
    }
  ]
}
```

### 6. Validation

For each lyrics file:
- Confirm character count ≤ 3500
- Confirm no descriptive text inside structure tags
- Confirm at least [Verse] + [Hook/Chorus] + [Outro] are present

Write validation results to `generate/lyrics/validation.txt`:

**Chinese / Chinese + English albums:**
```
[T1-Departure] CN: ✅ EN: ✅  | Structure (example): [Intro][Verse][Hook][Bridge][Outro]
```

**English albums:**
```
[T1-Departure] EN: ✅  | Structure (example): [Intro][Verse][Hook][Outro]
```

---

## Checklist

| # | Checkpoint | Completion Criteria |
|---|-----------|-------------------|
| 1 | Pure lyrics, no comments | All arrangement descriptions, market analysis, and comments removed |
| 2 | Structure tags correct | Officially supported tags used; no descriptive text nested inside tags |
| 3 | Character count ≤ 3500 | Pure lyrics characters ≤ 3500 (structure tag text not counted) |
| 4 | cn/en output correct | Chinese album outputs cn/ only; English album outputs en/ only; Chinese + English album outputs both cn/ and en/, with aligned structure |
| 5 | Backing vocals use parentheses | Formats like `(Ooh)` `(Harmonize)` are correct |
| 6 | metadata.json generated | Each song's lyrics metadata complete; structure tag list accurate |
| 7 | validation.txt generated | Both-versions validation result for each song; all ✅ |

---

## Output File Contract

Strictly follows Phase 3 contract in `FILE_CONTRACTS.md`.

---

## Conditions to Enter Phase 4

- [ ] Lyrics files generated for all tracks (cn/ and/or en/ depending on language)
- [ ] All files pass validation (character count / tags / content)
- [ ] `generate/lyrics/metadata.json` generated
- [ ] `generate/lyrics/validation.txt` all ✅

All ✅ → Enter Phase 4 (Music Generation)

---

## Reference

`examples/lyrics/cn/T1-Departure.txt` is the format reference.
