# Audio Transcoder — Phase 5 Entry Point

> Orchestrates 2 sub-modules: Listener Selection → Quality Verification.

---

## Core Principles

1. **Absolute File Contracts**: All input/output strictly follows `FILE_CONTRACTS.md`, no deviations
2. **Mandatory Sub-Agent Separation**: listener-selector ≠ quality-verifier — 2 independent sub-agents
3. **Main Agent Orchestrates Only**: Main agent handles spawning/waiting/coordinating user listening review; does not directly transcode or verify

---

## Sub-Module Index

| Sub-Module | Path | Description |
|------------|------|-------------|
| Phase 5.1 | `phase5-listener-selector/SKILL.md` | Select best Prompt version via listening review |
| Phase 5.2 | `phase5-quality-verifier/SKILL.md` | Post-transcode quality verification (bitrate/sample_rate/LUFS/duration) |

**Execution Order**: 5.1 → Transcode (main agent runs ffmpeg) → 5.2 (verify)

---

## Pre-Launch Notice (User Expectation Management)

**⚠️ Feishu Push Mechanism Key**: Messages are pushed only after turn ends. Must output notice text first, then spawn sub-agent, then `sessions_yield`.**

**Correct Flow:**
1. Main agent outputs notice:
   > 🪚 Phase 5 selection + transcoding started. {N} tracks × 2 languages = {total} transcoding tasks. Estimated ~ **{N × 3 minutes}** to complete. I will proactively notify you when done, no need to wait.
2. Spawn 5.1 listener-selector (listening review coordinated by main agent with user)
3. `sessions_yield` to end current turn

---

## Triggers

After Phase 4 completion, user commands:
- "Select and transcode" (选定并转码)
- "Phase 5"
- "Listener selection" (听评选定)

---

## Input

- All Chinese outputs from `generate/cn/` (various Take versions)
- All English outputs from `generate/en/`

---

## Execution

### ⚠️ Modification Scope
- **Read**: `generate/cn/*.mp3` + `generate/en/*.mp3`, user selection table
- **Write**: New .mp3 files under `generate/cn_320k/` and `generate/en_320k/`
- **Forbidden**: Modify original output files or delete any .mp3

### 1. Listener Selection

User listens to all outputs (3 Prompt versions × per language) and provides selection table:

```
CN Version: T1-p1, T2-p1, T3-p3, ...
EN Version: T1-p2, T2-p1, T3-p1, ...
```

### 2. Transcode + Loudness Normalization

For each selected version, execute two-step processing:

**Step 1: Transcode (320kbps/44.1kHz):**
```bash
ffmpeg -i input.mp3 -b:a 320000 -ar 44100 -y temp.mp3
```

**Step 2: Loudness Normalization (-14 LUFS, NetEase Cloud standard):**
```bash
ffmpeg -i temp.mp3 -af loudnorm=I=-14:TP=-1.5:LRA=11 -y output.mp3
```

### 3. Verification

For each output file, run ffprobe verification:
```bash
ffprobe -v error -show_entries format=bit_rate:stream=sample_rate -of json output.mp3
```

Confirm: bit_rate=320000, sample_rate=44100

**Duration Verification:**
```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 output.mp3
```
Confirm: Duration within reasonable range (≥ 1:00 and ≤ 6:00)

### 4. Output

```
generate/cn_320k/TN-track-name-pX.mp3
generate/en_320k/TN-track-name-pX.mp3
```

### 5. Loudness Report

Generate `generate/loudness-report.txt`:
```
(sample)
[T1-Departure] CN: -13.8 LUFS | 2:47 | ✅
[T1-Departure] EN: -14.1 LUFS | 2:47 | ✅
[T2-Data] CN: -13.9 LUFS | 3:12 | ✅
...
```

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | Each track has one Prompt version selected (p1/p2/p3) | N tracks × 2 languages, no omissions |
| 2 | Transcode parameters correct | 320kbps, 44.1kHz, MP3 |
| 3 | Loudness normalization | -14 LUFS ± 0.5 LUFS |
| 4 | Duration verification | ≥ 1:00 and ≤ 6:00 |
| 5 | ffprobe verification passed | bit_rate=320000, sample_rate=44100 |
| 6 | Output directory isolation | Only in `cn_320k/` `en_320k/`, no pollution of original directory |
| 7 | Loudness report generated | `generate/loudness-report.txt` contains data for each track |

---

## Output File Contract

Strictly follows Phase 5 contract in `FILE_CONTRACTS.md`.

---

## Phase 6 Entry Conditions

- [ ] All tracks selected and transcoded
- [ ] All files verified (bit_rate/sample_rate/loudness/duration)
- [ ] `cn_320k/` file count = `en_320k/` file count = track count
- [ ] `generate/loudness-report.txt` all ✅

All ✅ → Enter Phase 6 (Publishing Materials Packaging)
