# Phase 6 — Packager Skill

> Final packaging: Compress all document files into promotional materials zip package, completing the album pipeline.

---

## Trigger

Automatically initiated after phase6-platform-checker all pass.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 6 | `docs/album-overview.md` | Album overview document (complete update) |
| Phase 6 | `docs/promotional-materials.md` | Promotional document |
| Phase 6 | `docs/artist-story-cn.md` | Artist story Chinese long version |
| Phase 6 | `docs/artist-story-en.md` | Artist story English long version |
| Phase 6 | `docs/artist-story-short.md` | Artist story Chinese/English short version |
| Phase 6 | `docs/artist-story-quotes.md` | Quote extraction |
| Phase 6 | `docs/cover-concept.md` | Cover concept plan |
| Phase 6 | `docs/platform-check.txt` | Platform adaptation check report |

---

## Execution

### ⚠️ Modification Scope
- **Read**: All Phase 6 document files + `generate/covers/` cover images + `docs/promo-video*.mp4` promotional video
- **Write**: `<album-name>-promotional-materials.zip`
- **Forbidden**: Modify any source document files

### Packaging Command

```bash
cd <project-root>
zip -r <album-name>-promotional-materials.zip \
  docs/album-overview.md \
  docs/promotional-materials.md \
  docs/cover-concept.md \
  docs/artist-story-cn.md \
  docs/artist-story-en.md \
  docs/artist-story-short.md \
  docs/artist-story-quotes.md \
  docs/platform-check.txt \
  generate/covers/album-cover-p1.png \
  generate/covers/album-cover-p2.png \
  generate/covers/album-cover-p3.png \
  generate/covers/tracks/ \
  docs/promo-video.mp4
```

### Final Deliverables Checklist

**Documents (inside zip):**

| File | Content | Status |
|------|---------|--------|
| `docs/album-overview.md` | Album overview document (complete) | ✅ |
| `docs/promotional-materials.md` | Promotional document | ✅ |
| `docs/artist-story-cn.md` | Artist story Chinese long version | ✅ |
| `docs/artist-story-en.md` | Artist story English long version | ✅ (Chinese-only/English-only albums still recommended for international release reference) |
| `docs/artist-story-short.md` | Artist story Chinese/English short version | ✅ |
| `docs/artist-story-quotes.md` | Quote extraction | ✅ |
| `docs/cover-concept.md` | Cover concept plan | ✅ |
| `docs/platform-check.txt` | Platform adaptation check | ✅ |

**Cover Images (inside zip):**

| File | Content | Status |
|------|---------|--------|
| `generate/covers/album-cover-p1.png` | Album cover Version 1 (Concept-Faithful Type) | ✅ |
| `generate/covers/album-cover-p2.png` | Album cover Version 2 (Emotional-Atmosphere Type) | ✅ |
| `generate/covers/album-cover-p3.png` | Album cover Version 3 (Minimalist-Symbol Type) | ✅ |
| `generate/covers/tracks/T{N}-track-p{1,2,3}.png` | Single track covers (N tracks × 3 versions) | ✅ |

**Promotional Video (inside zip):**

| File | Content | Status |
|------|---------|--------|
| `docs/promo-video.mp4` | Promotional video (6 seconds) | ✅ |

**Audio (separate directories, not in zip):**

| Directory | Content | Status |
|-----------|---------|--------|
| `generate/cn_320k/` | Chinese final audio (N tracks) | ✅ |
| `generate/en_320k/` | English final audio (N tracks) | ✅ |

**Other:**

| File | Content | Status |
|------|---------|--------|
| `<album-name>-promotional-materials.zip` | Document archive | ✅ |
| `generate/loudness-report.txt` | Loudness/duration report | ✅ |

### Upload Checklist (for user)

Generate an upload metadata checklist for user to manually upload to platforms:

```
[NetEase Cloud Music Upload Checklist]

Album Name: "{Chinese Name}"
Artist: {Artist Name}
Album Description: {from album-overview.md}
**Cover (new):**
Cover: `generate/covers/album-cover-p1.png` (recommended Version 1, with p2/p3 alternatives)
Single Track Covers: `generate/covers/tracks/T{N}-track-p{1,2,3}.png`

**Promotional Video (new):**
Video: `docs/promo-video.mp4`

Track List:
01. T1 {Track Name} - {Duration}
02. T2 {Track Name} - {Duration}
...
{N}. TN {Track Name} - {Duration}

Audio File Paths:
generate/cn_320k/T1-track-pX.mp3
generate/cn_320k/T2-track-pX.mp3
...

Lyrics File Paths:
generate/lyrics/cn/T1-track.txt
generate/lyrics/cn/T2-track.txt
...
```

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | zip content complete | Contains all 8 document files |
| 2 | zip extracts normally | No corruption, files complete |
| 3 | Audio directories complete | cn_320k/ N tracks + en_320k/ N tracks |
| 4 | Upload checklist generated | Contains album name/track list/file paths |
| 5 | All Phase todo items marked [x] | `docs/album-overview.md` all todo items complete |

All ✅ → 🎉 Phase 6 complete, album pipeline fully finished!
