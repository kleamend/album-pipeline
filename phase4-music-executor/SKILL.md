# Phase 4 — Music Executor Skill

> Uses MiniMax CLI to batch-generate music, with 3 Prompt versions executed in parallel.

---

## Trigger

Automatically starts after phase4-prompt-reviewer passes review.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 4 | `generate/prompts/T{N}-title-prompt{1,2,3}.txt` | 3 review-approved Prompt versions |
| Phase 3 | `generate/lyrics/cn/T{N}-title.txt` | Chinese standard lyrics |
| Phase 3 | `generate/lyrics/en/T{N}-title.txt` | English standard lyrics (if applicable) |
| Phase 4 | `generate/prompts/index.json` | Prompt index (includes parameter extraction reference) |

---

## Execution

### ⚠️ Scope of Modification
- **Read**: `generate/prompts/*.txt`, `generate/lyrics/cn/*.txt`, `generate/lyrics/en/*.txt`, `index.json`
- **Write**: `generate/cn/T{N}-title-p{1,2,3}.mp3`, `generate/en/T{N}-title-p{1,2,3}.mp3`
- **Forbidden**: Modify any files in `generate/prompts/` or `generate/lyrics/`

### Parallel Strategy

**N songs = N parallel agent groups**, each agent group handles all Prompt versions for one song.

Per song:
- 3 Prompt versions → 3 parallel generation tasks
- Bilingual album → Chinese × 3 + English × 3 = 6 parallel tasks

⚠️ **Rate limit handling**: MiniMax music-2.6 has API rate limits. On 429 response, degrade to serial generation, waiting 2-3 seconds between each song.

### CLI Command Templates

**Regular tracks:**

```bash
minimax music generate \
  --model music-2.6 \
  --prompt "$(cat generate/prompts/T1-Departure-prompt1.txt)" \
  --lyrics-file generate/lyrics/cn/T1-Departure.txt \
  --vocals "{extracted from prompt}" \
  --genre "{extracted from prompt}" \
  --mood "{extracted from prompt}" \
  --instruments "{extracted from prompt}" \
  --bpm "{extracted from prompt}" \
  --key "{extracted from prompt}" \
  --structure "{song structure}" \
  --extra "{additional granular requirements}" \
  --out generate/cn/T1-Departure-p1.mp3
```

**Instrumental tracks:**

```bash
minimax music generate \
  --model music-2.6 \
  --prompt "$(cat generate/prompts/T3-Interlude-prompt1.txt)" \
  --genre "{extracted from prompt}" \
  --mood "{extracted from prompt}" \
  --instruments "{extracted from prompt}" \
  --bpm "{extracted from prompt}" \
  --key "{extracted from prompt}" \
  --structure "{song structure}" \
  --extra "{additional granular requirements}" \
  --out generate/cn/T3-Interlude-p1.mp3
```

Instrumental tracks have no `--lyrics-file` parameter.

### Output Management

```
generate/cn/TN-title-p1.mp3
generate/cn/TN-title-p2.mp3
generate/cn/TN-title-p3.mp3
generate/en/TN-title-p1.mp3
generate/en/TN-title-p2.mp3
generate/en/TN-title-p3.mp3
```

### Parameter Extraction Rules

Extract CLI parameters from Prompt text:

| CLI Parameter | Extraction Source | Example |
|--------------|-----------------|---------|
| --vocals | Vocals/Vocal Character/Timbre Focus → Vocals | "Acapella entrance, deep reverb, breathy" |
| --genre | Genre/Style in header | "Ambient electronic + narrative feel" |
| --mood | Mood Arc/Narrative/Emotional Journey | "Transition from stuck to walking" |
| --instruments | Instruments/Instrument Palette | "Solo piano, left-hand octave bass" |
| --bpm | BPM value in header | 85 |
| --key | Key in header | "B minor" |
| --structure | Section list from Structure Timeline | "Intro-Verse-Pre Chorus-Hook-Bridge-Outro" |
| --extra | Granular requirements not covered by the above parameters | "Heartbeat sample pad underneath, window wind -40dB" |

---

## Checklist

| # | Checkpoint | Completion Criteria |
|---|-----------|-------------------|
| 1 | All generation tasks complete | N songs × 3 Prompts × language count = all output files exist |
| 2 | Files are playable | Not silent/error audio; file size ≥ 100KB |
| 3 | Output directory structure correct | cn/ + en/ named as `TN-title-p{1,2,3}.mp3` |
| 4 | Source files not polluted | No files in `generate/prompts/` or `generate/lyrics/` modified |
| 5 | Generation log saved | Records per-song generation time/model version/CLI parameters |

All ✅ → Enter Phase 5 (Selection + Transcoding)
