# Phase 4 — Prompt Reviewer Skill

> Independent review Agent. Performs 6-item checks on all Prompts and optimizes them to ensure the character limit is filled and 3-version differentiation is clear.

---

## Trigger

Automatically starts after phase4-prompt-generator completes all Prompt generation.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 4 | `generate/prompts/*.txt` | All Prompt version files |
| Phase 4 | `generate/prompts/index.json` | Prompt index (includes char_count) |
| Phase 2 | `songs/T{N}-title.md` | Complete arrangement design (used for coverage verification) |

---

## Execution

### ⚠️ Scope of Modification
- **Read**: `generate/prompts/*.txt`, `generate/prompts/index.json`, `songs/T{N}-title.md`
- **Write**: Overwrite optimized `generate/prompts/*.txt`, update `generate/prompts/index.json`
- **Forbidden**: Modify any files in `songs/`, `generate/lyrics/`, `generate/cn/`, or `generate/en/`

### Review Process

For each Prompt version, check each item:

| # | Checkpoint | Standard | Optimization Action |
|---|-----------|---------|-------------------|
| 1 | Character count | ≤ 2000 and ≥ 1500 | < 1500 → supplement arrangement details until close to 2000 |
| 2 | Core parameters complete | Genre/Style/BPM/Key/Mood/Vocals/Instruments | Missing → supplement from basic info table in `songs/TN-title.md` |
| 3 | No invalid information | No millisecond-precision timestamps, no dB values, no Sound Design tables | Present → rewrite as model-understandable sensory descriptions |
| 4 | Arrangement information coverage ≥ 60% | Covers core arrangement design information | < 60% → supplement key sections/sound effects/emotional transitions |
| 5 | MiniMax model readability | Structured text the model can understand | Unclear → rewrite in music-model-friendly format |
| 6 | 3-version differentiation | 3 versions are distinctly different | Insufficient → strengthen the uniqueness of each version's condensation strategy |

### Optimization Rules

**When character count is insufficient:**
- Supplement details from unconcensed sections in the arrangement design (e.g., Bridge section's space design)
- Supplement sound effect descriptions that serve emotion from Sound Design (remove dB values, keep texture descriptions)
- Add vocal processing details (e.g., "close-mic breathy" → "quiet whisper seemingly right by the ear")

**When invalid information is present:**
- Timestamps: `0:15.342` → `around 15 seconds`
- dB values: `-35dB` → `extremely light underlying pad`
- Tables: Convert to natural language descriptions

**When 3-version differentiation is insufficient:**
- Version 1: Strengthen timeline precision (preserve section names and approximate time ranges)
- Version 2: Strengthen narrative thread (highlight the paradox → emotional transformation story)
- Version 3: Strengthen texture keywords (use "warm/cold/granular/breathing" vocabulary)

---

## Checklist

| # | Checkpoint | Completion Criteria |
|---|-----------|-------------------|
| 1 | All Prompts pass 6-item review | Checked item by item; all 6 ✅ |
| 2 | Character count meets standard | Each Prompt 1500-2000 characters |
| 3 | 3-version differentiation confirmed | After reading all 3 versions, each version's condensation strategy is clearly distinguishable |
| 4 | index.json updated | char_count matches actual character count |
| 5 | No formatting errors | Plain text; no Markdown formatting symbols interfering |

All ✅ → Enter Music Generation phase (phase4-music-executor)
