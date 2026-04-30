# Phase 6 — Album Overview Updater Skill

> Update the album overview document, consolidating all Phase 1-5 outputs into the final version.

---

## Trigger

Automatically initiated after all Phase 5 verifications pass.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 1 | `docs/album-overview.md` | Album overview document skeleton (needs completion) |
| Phase 2 | `songs/T{N}-track.md` | Cover highlight copy, market assessment, scoring for each track |
| Phase 5 | `generate/cn_320k/*.mp3` | Chinese final audio |
| Phase 5 | `generate/en_320k/*.mp3` | English final audio |
| Phase 5 | `generate/loudness-report.txt` | Loudness/duration report |

---

## Execution

### ⚠️ Modification Scope
- **Read**: All Phase 1-5 output files
- **Write**: `docs/album-overview.md` (overwrite update)
- **Forbidden**: Modify any files in `songs/` or `generate/` directories

### Update Content

1. **Album Overview**: From Phase 1, confirm correctness
2. **Track List**: Add final duration (from ffprobe) + selected Take number + status changed to "✅ Finalized"
3. **English Album Info**: From Phase 1, confirm correctness
4. **Track One-Liners**: From Phase 1, minor optimization acceptable
5. **Scoring Overview**:
   - Replace Phase 1 4-dimension scoring (Concept Originality/Narrative Coherence/Market Potential/Musical Consistency, 25 points each)
   - With Phase 2 5-dimension scoring (Rhythm/Market/Structure/Philosophy/Arrangement, 20 points each)
   - **Instrumental tracks**: Replace "Rhythm" with "Instrumental Performance" in the 5 dimensions, other dimensions unchanged
   - Retain Phase 1 original scoring as "## Phase 1 Concept Scoring (Historical Reference)" sub-section
6. **Todo Items**: Mark Phase 1-5 as [x], Phase 6 in progress

### Scoring Overview Conversion Rules

**Phase 1 Format (Old):**
```
| Dimension | Score | Comment |
| Concept Originality | 23/25 | ... |
| Narrative Coherence | 22/25 | ... |
| Market Potential | 21/25 | ... |
| Musical Consistency | 20/25 | ... |
Total: 86/100
```

**Phase 2 Format (New):**
```
| Dimension | Score | Comment |
| Rhythm | 18/20 | ... |
| Market | 17/20 | ... |
| Structure | 19/20 | ... |
| Philosophy | 18/20 | ... |
| Arrangement | 19/20 | ... |
Total: 91/100
```

**Post-Conversion Historical Retention:**
```
## Scoring Overview (Phase 2 Final)
[Phase 2 5-Dimension Scoring Table]

## Phase 1 Concept Scoring (Historical Reference)
[Phase 1 4-Dimension Scoring Table]
```

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | Track list complete | N tracks, each with final duration/selected Take/status=✅ |
| 2 | Scoring overview converted | Phase 2 5-dimension scoring + Phase 1 historical reference |
| 3 | English info complete | Album Name/Description/Creator's Note/Track One-Liners |
| 4 | Todo items updated | Phase 1-5 [x], Phase 6 [ ] |
| 5 | Album overview unchanged | Core concept/narrative axis/track positioning remains Phase 1 original |

All ✅ → Proceed to next step (phase6-promotional-writer)
