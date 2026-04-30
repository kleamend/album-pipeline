# Song Writer Orchestrator — Song Generation Orchestration Skill

> Phase 2 core orchestrator. Manages a 5-expert serial iteration loop per song (3-6 rounds), with 5 independent **subagents** operating on the same song file sequentially each round.

---

## Core Principles

1. **Absolute File Contract**: All input/output strictly follows `FILE_CONTRACTS.md` — no deviations allowed.
2. **Mandatory Subagent Separation**: Lyricist ≠ Arranger ≠ Rhyme Expert ≠ Market Expert ≠ Scoring Expert — 5 independent `sessions_spawn` calls.
3. **Main Agent Only Orchestrates**: The main agent is responsible for launching/waiting/judging scoring results — it does not directly modify any song files.

---

## Trigger

- Phase 1 complete, `docs/album-overview.md` status is "Concept Confirmed"
- User command: "Start generating songs" / "Phase 2" / "song writing round"

---

## Pre-Launch Notice (User Expectation Management)

**⚠️ Feishu push mechanism key: Messages are only pushed after a turn ends. You must output the notice text first, then spawn subagents, then `sessions_yield` to end the current turn.**

**Correct flow (strict order):**

1. The main agent outputs the notice text:
   > 🪚 Phase 2 Song Generation pipeline launched.
   > Each song will go through 5 experts in serial iteration (Lyricist → Arranger → Rhyme Expert → Market Expert → Scoring Expert), minimum 3 rounds, maximum 6 rounds, with N songs in parallel.
   > Estimated completion: **{estimated time}**.
   > No need to wait — I will notify you when done.

2. **Immediately spawn the first batch of subagents** (Lyricist expert for each song starts first, Round 1 begins)

3. **`sessions_yield` to end the current turn** → notice is pushed to user → subagents work in background

4. When subagent completes → main agent receives notification → automatically spawns the next expert (Arranger → Rhyme → Market → Scoring) → loop until round completes

5. **No pauses between Round 2+**: If the Scoring expert completes but the threshold isn't met, the main agent directly spawns the next round's Lyricist expert without asking the user

6. When all songs pass → main agent summarizes results → notifies user Phase 2 is complete

**Forbidden**:
- Stopping between rounds to wait for user confirmation (report only after all rounds for a song complete)
- Spawning subagents and then not yielding

**Estimated time reference**:
- 3 songs: ~45-60 minutes
- 6 songs: ~90-120 minutes
- 9 songs: ~2-3 hours

---

## Input

From `docs/album-overview.md`, read:
- Track positioning table (# / Track Name / English Name / Narrative Axis / Hook / Paradox / Imagery / Physical Sensibility / Emotional Arc / Arrangement Style / Duration)
- Tone mainline
- Album core concept
- **Language** (Chinese / Chinese+English / English / **Instrumental**)

⚠️ **Instrumental detection**: If any track in the tracklist has Language = "Instrumental", skip the Lyricist expert's lyric writing for that track and enter "Instrumental Description" mode (see Instrumental handling below).

---

## Execution Architecture

```
For each track in the track positioning table (T1-TN):
  Open songs/TN-track-name.md (template initialized by Phase 0.5, basic info table filled in)
  Launch N Agent groups in parallel
```

### Within a Single Song's Agent Group — Serial Flow

```Round = 1
while Round <= 6:
  1. Lyricist Expert Agent → Regular song: read/write lyrics section; Instrumental: write "Instrumental Description" section
  2. Arrangement Expert Agent → read/write songs/TN-track-name.md
  3. Rhyme Expert Agent → Regular song: rhyme analysis; Instrumental: rhythm/timbre analysis
  4. Market Expert Agent → read/write songs/TN-track-name.md
  5. Scoring Expert Agent → read songs/TN-track-name.md, output scoring

  Read scoring results:
  if Round >= 3 and score >= 80:
    ✅ Pass, mark status as "✅ Finalized"
    Update docs/album-overview.md scoring overview
    break
  elif Round == 6:
    ⚠️ Max rounds reached, take highest-scoring version
    Update docs/album-overview.md scoring overview
    break
  else:
    Mark low-score dimensions + optimization suggestions → Round += 1
    Next round's experts read previous round's scoring results
```

### Instrumental Handling

When a track in the positioning table has Language = "Instrumental":

- **Lyricist Expert**: Skip lyric writing, write "Instrumental Description" section (main melody emotional arc / timbre / section intent)
- **Rhyme Expert**: Skip rhyme analysis, write "Rhythm/Timbre Analysis" section (rhythm pattern / timbre layers / dynamic changes)
- **Arrangement Expert**: No change, normally fill in arrangement design
- **Market Expert**: No change, normally evaluate market potential
- **Scoring Expert**: "Rhyme" dimension replaced with "Instrumental Expressiveness" dimension (0-20 pts)

### Parallelization Strategy

- **N songs = N parallel Agent groups** (N = number of tracks from Phase 1 positioning table)
- Within each group, 5 experts operate on the same file serially
- Groups do not interfere with each other
- All groups complete → proceed to Phase 3

### Subagent Call Format

Each expert must be an independent `sessions_spawn` call:

```python
# Lyricist Expert
sessions_spawn(
    runtime="subagent",
    mode="run",
    task="""
You are the Lyricist Expert. Working on song: songs/T{N}-{track-name}.md

Current round: Round {X} / maximum 6 rounds
Previous round score: Total {XX} (per-dimension breakdown)
Low-score dimensions: [if any]
Optimization suggestions: [if any]

⚠️ Hard rule: You may only modify the section you are responsible for. Do not modify/add/remove any other sections.
See "Hard Rule: File Modification Scope Limits" in FILE_CONTRACTS.md Phase 2 contract.

Please execute the checklist from your SKILL.md.
Read the current content of songs/T{N}-{track-name}.md, do your work, and write back to the file.
Strictly follow the Phase 2 file format contract in FILE_CONTRACTS.md.

Finally, output at the end of your work area:
✅ Lyricist Expert Round {X} Checklist:
- [ ] Checklist item 1
- [ ] Checklist item 2
...
"""
)

# Arrangement Expert → sessions_spawn (independent call)
# Rhyme Expert → sessions_spawn (independent call)
# Market Expert → sessions_spawn (independent call)
# Scoring Expert → sessions_spawn (independent call)
```

---

## Phase 2 Global Checklist

Upon completion, confirm:
- [ ] All `songs/T{N}-*.md` files exist and are non-empty
- [ ] Each track scored ≥ 80 points and completed at least 3 rounds (or reached max 6 rounds)
- [ ] `docs/album-overview.md` scoring overview has been updated
- [ ] Each song file format passes FILE_CONTRACTS.md validation

All ✅ → proceed to Phase 3 (Lyrics Standardization Extraction)

---

## Output File Contract

Strictly follows the Phase 2 contract in `FILE_CONTRACTS.md`.

---

## References

- `examples/songs/T1-出发.md` — 98-point final version example
- `FILE_CONTRACTS.md` — Phase 2 file format contract
