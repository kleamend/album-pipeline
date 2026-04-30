# Phase 6 — Platform Checker Skill

> Check if final products meet upload requirements for target platforms (NetEase Cloud/QQ Music).

---

## Trigger

Automatically initiated after phase6-cover-designer completes.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 5 | `generate/cn_320k/*.mp3` | Chinese final audio |
| Phase 5 | `generate/en_320k/*.mp3` | English final audio |
| Phase 5 | `generate/loudness-report.txt` | Loudness/duration report |
| Phase 1 | `docs/album-overview.md` | Album info |

---

## Execution

### ⚠️ Modification Scope
- **Read**: Phase 5 transcoded files, loudness report, album overview document
- **Write**: `docs/platform-check.txt`
- **Forbidden**: Modify any .mp3 files or Phase 1-5 outputs

### Platform Adaptation Checklist

| Check Item | NetEase Cloud | QQ Music |
|------------|---------------|----------|
| Format | MP3 320kbps | FLAC preferred, MP3 320kbps compatible |
| Sample Rate | 44.1kHz | 44.1kHz |
| Loudness | -14 LUFS | -14 LUFS |
| Min Duration | ≥ 60 seconds | ≥ 60 seconds |
| Max Duration | ≤ 6 minutes | ≤ 6 minutes |
| Min Track Count | 3 tracks | 3 tracks |
| Required Info | Album name/tracks/artist | Album name/tracks/artist |
| Cover Dimensions | 3000×3000px | 3000×3000px |
| Lyrics | LRC format | LRC format |

### Item-by-Item Verification

For each transcoded file:
1. `ffprobe` verify bitrate=320000, sample_rate=44100
2. From loudness-report.txt verify loudness -14 ± 0.5 LUFS
3. Verify duration ≥ 1:00 and ≤ 6:00

### Output Format

`docs/platform-check.txt`:

```
[Platform Adaptation Check Report]
Date: YYYY-MM-DD

NetEase Cloud Music:
  Format: ✅ MP3 320kbps
  Sample Rate: ✅ 44.1kHz
  Loudness: ✅ -14 LUFS (all within range)
  Duration: ✅ All ≥ 60s and ≤ 6:00
  Track Count: ✅ N tracks (≥ 3)
  Required Info: ✅ Album name/tracks/artist complete
  Result: ✅ All passed

QQ Music:
  Format: ✅ MP3 320kbps (compatible)
  Sample Rate: ✅ 44.1kHz
  Loudness: ✅ -14 LUFS
  Duration: ✅ All within range
  Track Count: ✅ N tracks
  Required Info: ✅ Complete
  Result: ✅ All passed
```

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | NetEase Cloud all items passed | Format/sample rate/loudness/duration/track count/info all ✅ |
| 2 | QQ Music all items passed | Same as above |
| 3 | platform-check.txt generated | Contains complete check results for both platforms |
| 4 | No tracks missed | Each track verified |
| 5 | Any failures annotated | Clearly mark failed items + fix suggestions |

All ✅ → Proceed to final packaging phase (phase6-packager)
