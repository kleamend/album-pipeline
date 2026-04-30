# Phase 5 — Quality Verifier Skill

> Comprehensive post-transcode verification to ensure platform compliance (320kbps/44.1kHz/-14 LUFS).

---

## Trigger

Automatically initiated after main agent completes all ffmpeg transcoding.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 5 | `generate/cn_320k/T{N}-track-pX.mp3` | Chinese transcoded files |
| Phase 5 | `generate/en_320k/T{N}-track-pX.mp3` | English transcoded files |

---

## Execution

### ⚠️ Modification Scope
- **Read**: `generate/cn_320k/*.mp3`, `generate/en_320k/*.mp3`
- **Write**: `generate/loudness-report.txt`
- **Forbidden**: Modify any .mp3 files

### Verification Items

#### 1. Format Verification (ffprobe)

```bash
ffprobe -v error -show_entries format=bit_rate:stream=sample_rate -of json output.mp3
```

Confirm:
- `bit_rate` = 320000 ✅
- `sample_rate` = 44100 ✅

#### 2. Duration Verification

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 output.mp3
```

Confirm:
- Duration ≥ 1:00 (60 seconds) ✅
- Duration ≤ 6:00 (360 seconds) ✅

#### 3. Loudness Verification

Use ffmpeg loudnorm filter for secondary verification:

```bash
ffmpeg -i output.mp3 -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -
```

Confirm:
- Integrated Loudness (I): -14 LUFS ± 0.5 LUFS ✅
- True Peak (TP): ≤ -1.5 dBTP ✅

#### 4. File Integrity

- File size ≥ 100KB
- Playable (no silence/clipping/truncation)

### Output Report

Generate `generate/loudness-report.txt`:

```
[Loudness/Duration Verification Report]
Date: YYYY-MM-DD

T1-Departure    CN: -13.8 LUFS | 3:24 | 320kbps | 44.1kHz | ✅
T1-Departure    EN: -14.1 LUFS | 3:55 | 320kbps | 44.1kHz | ✅
T2-Data         CN: -13.9 LUFS | 2:14 | 320kbps | 44.1kHz | ✅
...

Summary:
CN Version: N/N passed
EN Version: N/N passed
Total: 2N/2N passed
```

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | bit_rate = 320000 | All files pass ffprobe verification |
| 2 | sample_rate = 44100 | All files pass ffprobe verification |
| 3 | Loudness -14 ± 0.5 LUFS | All files pass loudness verification |
| 4 | Duration 1:00-6:00 | All files pass duration verification |
| 5 | File integrity | No silence/clipping/truncation, size ≥ 100KB |
| 6 | loudness-report.txt generated | Contains detailed data for each track |
| 7 | cn_320k count = track count | No omissions |
| 8 | en_320k count = track count (bilingual/English album check) | Instrumental/Chinese-only albums may have no en_320k/ directory, skip this item |

All ✅ → Enter Phase 6 (Publishing Materials Packaging)
