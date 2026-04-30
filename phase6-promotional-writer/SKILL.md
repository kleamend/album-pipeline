# Phase 6 — Promotional Writer Skill

> Create promotional documents, fill album information from template, generate multi-channel promotional materials.

---

## Trigger

Automatically initiated after phase6-album-overview-updater completes.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 1 | `docs/album-overview.md` | Album core concept/narrative axis/track positioning |
| Phase 2 | `songs/T{N}-track.md` | Cover highlight copy, market assessment for each track |
| Phase 6 | `templates/promotional-materials.md` | Promotional document template |

---

## Execution

### ⚠️ Modification Scope
- **Read**: `docs/album-overview.md`, `songs/T{N}-track.md`, `templates/promotional-materials.md`
- **Write**: `docs/promotional-materials.md`
- **Forbidden**: Modify template file or any files in `songs/`/`generate/` directories

### Promotional Document Structure

Initialize from template `templates/promotional-materials.md`, fill the following:

1. **One-Liner Album Concept**: Extracted from Phase 1 core dissemination concept
2. **Album Introduction (~300 words)**: Combining album overview + narrative axis + target audience
3. **Core Promotional Lines (3)**: Derived from core paradox/highlight copy/dissemination concept
4. **Per-Track Highlight Copy**: Extracted "cover highlight copy" section from `songs/T{N}-track.md`
5. **Social Media Copy**:
   - Weibo: within 140 characters
   - Xiaohongshu: 200-300 characters + topic hashtags
   - WeChat article titles: × 3 alternatives
6. **Production Info**:
   - AI generation tool (MiniMax music-2.6)
   - Scale (N tracks × 2 languages × 3 Prompt = X outputs, 2N selected)
   - Output standards (320kbps/44.1kHz/-14 LUFS)
7. **Potential Controversy Points and Response Plans**:
   - AI-generated music controversy
   - Narrative strategy: collaboration, not replacement

### Production Info Format

```markdown
## Production Info

- **Music Generation**: MiniMax music-2.6
- **Generation Scale**: N tracks × 2 languages × 3 Prompt versions = X outputs, 2N selected
- **Output Standards**: MP3 320kbps / 44.1kHz / -14 LUFS
- **Narrative Strategy**: Do not hide AI generation fact; transform it into the album's most honest metaphor
```

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | One-liner concept clear | ≤ 30 characters, independently shareable |
| 2 | Album introduction complete | ~300 words, covering core concept + narrative axis + target audience |
| 3 | 3 promotional lines differentiated | Each from paradox/highlight/dissemination angle |
| 4 | Per-track highlight copy complete | N tracks, one sentence each |
| 5 | Social Media copy complete | Weibo/Xiaohongshu/WeChat article titles × 3 |
| 6 | Production info accurate | Tool/scale/standards data correct |
| 7 | Controversy plan complete | ≥ 1 controversy point + response strategy |

All ✅ → Proceed to next step (phase6-artist-story-writer)
