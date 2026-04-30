# Phase 5 — Listener Selector Skill

> Select the best Prompt version via listening review, output selection table for transcoding.

---

## Trigger

Automatically initiated by main agent after all Phase 4 outputs are complete.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 4 | `generate/cn/T{N}-track-p{1,2,3}.mp3` | Chinese 3 Prompt versions |
| Phase 4 | `generate/en/T{N}-track-p{1,2,3}.mp3` | English 3 Prompt versions |
| Phase 4 | `generate/prompts/index.json` | Prompt version index |
| Phase 2 | `songs/T{N}-track.md` | Arrangement design (listening reference) |

---

## Execution

### ⚠️ Modification Scope
- **Read**: Phase 4 outputs, arrangement design files
- **Write**: User selection table (memory or temp file)
- **Forbidden**: Modify or delete any .mp3 files

### Listening Review Flow

1. Play each song's 3 Prompt versions in sequence
2. After user listens to all 3 versions of each song, they provide selection:
   ```
   T1: p1 (Arrangement-Faithful Type) — Hook clear, high arrangement fidelity
   T2: p1 (Arrangement-Faithful Type) — Strong low-end
   T3: p3 (Sensory-Quality Priority Type) — Most comfortable texture
   ...
   ```
3. Main agent compiles selection table

### Selection Criteria

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Melody/Theme Clarity | High | Core melody/theme prominent and independently identifiable (instrumental uses main melody as Hook substitute) |
| Emotional Expression | High | Accurately conveys emotional arc and physical sensation |
| Arrangement Fidelity | Medium | Faithful to key sound effects and sections in arrangement design |
| Listening Comfort | Medium | Mix balance; for instrumental, focus on timbre layers |
| Duration Reasonableness | Low | Within 1:00-6:00 range |

### Selection Table Format

```
CN Version Selection:
T1-Departure → p1 (Arrangement-Faithful Type)
T2-Data → p1 (Arrangement-Faithful Type)
T3-Counterfeit Specimen → p1 (Arrangement-Faithful Type)
T4-Cage → p3 (Sensory-Quality Priority Type)
T5-Vacuum → p3 (Sensory-Quality Priority Type)
T6-Twin → p3 (Sensory-Quality Priority Type)
T7-Decision → p2 (Emotional-Narrative Driven Type)
T8-Goodbye → p2 (Emotional-Narrative Driven Type)
T9-Migrant Bird → p1 (Arrangement-Faithful Type)

EN Version Selection:
T1-Departure → p1 (Arrangement-Faithful Type)
T2-Data → p2 (Emotional-Narrative Driven Type)
T3-Counterfeit Specimen → p1 (Arrangement-Faithful Type)
T4-Cage → p3 (Sensory-Quality Priority Type)
T5-Vacuum → p3 (Sensory-Quality Priority Type)
T6-Twin → p3 (Sensory-Quality Priority Type)
T7-Decision → p2 (Emotional-Narrative Driven Type)
T8-Goodbye → p2 (Emotional-Narrative Driven Type)
T9-Migrant Bird → p1 (Arrangement-Faithful Type)
```

### Version Distribution Pattern (Reference)

From "Counterfeit Migrants" actual selection data:
- **Prompt 1 (Arrangement-Faithful Type)**: Direction axis endpoints and data axis (T1/T2/T3/T9) → arrangement design itself is already excellent
- **Prompt 2 (Emotional-Narrative Driven Type)**: Farewell axis (T7/T8) → emotional narrative is core
- **Prompt 3 (Sensory-Quality Priority Type)**: Self axis (T4/T5/T6) → needs stronger physical sensation and texture

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | Each track has selection | N tracks × 2 languages = 2N selections, no omissions |
| 2 | Selected version exists | p1/p2/p3 files confirmed in generate/cn/ and generate/en/ |
| 3 | Selection reasoning recorded | Each selection includes brief reason (Hook/emotion/arrangement/comfort) |
| 4 | Version distribution reasonable | All 3 Prompt versions have selections (should not select same version for all) |

All ✅ → Enter transcoding phase (main agent executes ffmpeg + phase5-quality-verifier)
