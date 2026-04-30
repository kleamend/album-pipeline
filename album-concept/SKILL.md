# Album Concept — Album Concept Design Skill

> Phase 1 entry point. The main agent converses with the user to explore the concept, then launches a multi-expert pipeline to produce the album's narrative framework.

---

## Core Principles

1. **Absolute File Contract**: All input/output strictly follows `FILE_CONTRACTS.md` — no deviations allowed.
2. **Mandatory Subagent Separation**: Creative Director ≠ Market Expert ≠ Music Director ≠ Scoring Expert — 4 independent `sessions_spawn` calls.
3. **Main Agent Handles Only Step 0**: Phase 1 Step 0 (user concept communication) is the only step executed directly by the main agent. All steps after Step 1 are handled by subagents.

---

## Trigger

The user expresses intent to create a concept album, e.g.:
- "I want to make an album about XX"
- "Help me design a concept album"
- "album concept"

---

## Step 0: Main Agent Conducts User Conversation (No Subagent Spawning)

**The main agent converses directly with the user** to gather concept intent.

If the user only provides a theme, ask the following questions (2-4, natural conversation — don't throw them all at once):
1. What question does this album aim to answer? (Philosophical anchor)
2. What musical style do you imagine?
3. Who is the target audience? In what context will they listen?
4. Any reference artists/albums?

After the conversation, produce a **Concept Brief**:
```
Album Theme: {one-liner}
Track Count: {N}
Core Concept: {1-2 sentences}
Core Paradox: {1 sentence}
Reference Style: {description}
Target Audience: {description}
Language: {Chinese / Chinese+English / English / Instrumental}
```

### Step 0.1: Confirm Start (User Expectation Management)

**Before officially starting, the main agent must output the following notice:**

> 🪚 The concept brief has been compiled. Once confirmed, I will launch the pipeline. The entire process takes approximately **30 minutes** (directory initialization + 4 experts working in parallel + final scoring).
> You don't need to wait during this time — I will notify you when it's done.
> Confirm start?

**Proceed to Step 0.5 directory initialization only after user confirmation. If the user says "wait" or "let me tweak it," return to Step 0 to continue the conversation.**

### Step 0.5: Project Directory Initialization

The main agent reads template files from the `templates/` directory and initializes the new project:

1. Create project directory `workspace/projects/album-{album-name}/`
2. Copy `templates/album-overview.md` → `docs/album-overview.md`
3. Based on track count N, copy `templates/song-template.md` → `songs/T1-track-name.md`, `songs/T2-track-name.md`, ..., `songs/TN-track-name.md` (replace `{N}` and `{track-name}` placeholders for each; track names remain as placeholders to be filled by the Phase 1 Creative Director)
4. Create empty directories: `generate/lyrics/cn/`, `generate/lyrics/en/`, `generate/cn/`, `generate/en/`, `generate/cn_320k/`, `generate/en_320k/`, `generate/prompts/`, `assets/`
5. Fill in the concept brief information (album name, track count, language) in `docs/album-overview.md`

**From this point on, all experts fill in or modify existing files directly — no new files are created.**

### Step 0.6: Pipeline Launch Notice + Spawn Subagents

**⚠️ Feishu push mechanism key: Messages are only pushed after a turn ends. You must output the notice text first, then spawn subagents, then `sessions_yield` to end the current turn — only then will the notice reach the user.**

**Correct flow (strict order):**

1. The main agent outputs the notice text:
   > 🪚 Phase 1 Concept Design pipeline launched. 4 experts are working in parallel (Creative Director / Market Expert / Music Director → Scoring Expert), expected completion in approximately **15 minutes**. I will notify you when done — no need to wait.

2. **Immediately spawn 4 subagents** (Creative Director + Market Expert + Music Director in parallel; Scoring Expert runs serially after the first 3 complete)

3. **`sessions_yield` to end the current turn** → notice is pushed to user → subagents work in background

4. When subagents complete → main agent receives notification → summarize results → Step 3 user confirmation

**Forbidden**: Spawning subagents and then not yielding (the main agent won't move, and the user won't see any notice).

---

## Step 1: Multi-Expert Pipeline (Spawn Subagents)

### ⚠️ Hard Rule: File Modification Scope Limits

**All Phase 1 subagents must strictly observe:**
- **Only modify the sections they are responsible for** — no modifications to other sections
- **No adding/removing sections** (except optional sections explicitly allowed by the contract)
- **No modifying file structure or order**
- **Read-only access**: May read content written by prior experts but cannot modify it

**Each expert's modification scope:**

| Expert | Writable Sections | Read-Only Sections |
|--------|-----------------|-------------------|
| Creative Director | Album Overview, Narrative Axes, Tracklist, To-Do (initialization) | Market Analysis / Tone Mainline / English Info / Scoring Overview |
| Market Expert | Market Analysis, Core Communication Concept (within Market Analysis section), English Album Info | Album Overview / Tracklist / Tone / Scoring |
| Music Director | Tone Mainline | Album Overview / Tracklist / Market Analysis / English Info / Scoring |
| Scoring Expert | Scoring Overview | All existing sections |

---

**3 experts run in parallel**, all reading the concept brief, outputting to `docs/album-overview.md`:

### Creative Director Agent

**Responsibilities**: Narrative axis design + Track positioning table + Core paradox penetration

**Output** (write to `docs/album-overview.md`):
- Album name (Chinese / English)
- Narrative axes (≥2, each with axis name / meaning / track assignment / emotional arc)
- Track positioning table (N rows × 11 fields)
- Core concept + Core paradox

### Market Expert Agent

**Responsibilities**: Market analysis + English album information

**Output** (append to `docs/album-overview.md`):
- Market positioning (one sentence)
- Target audience persona (2-3 layers)
- Competitive differentiation analysis
- Core communication concept (one sentence, within Market Analysis section)
- Potential risks + response strategies
- English album information (Album Name / Description / Creator's Note / Track One-Liners)

### Music Director Agent

**Responsibilities**: Tone mainline + Style consistency + Inter-track relationships

**Output** (append to `docs/album-overview.md`):
- Main tone + per-track tone distribution
- Tone transition logic
- Adjacent track fatigue detection
- Opening/closing loop design

---

## Step 2: Scoring Expert (Reads Outputs from the First Three, Scores)

The **Scoring Expert agent** reads the complete content of `docs/album-overview.md` and outputs scoring.

### Scoring Criteria

| Dimension | Weight | High-Score Standard |
|-----------|--------|---------------------|
| Concept Originality | 25 pts | Core paradox is distinctive, avoids common tropes |
| Narrative Coherence | 25 pts | Narrative axes are logically consistent, tracks have progression/echo between them |
| Market Potential | 25 pts | Has a one-sentence communication concept, clear audience, differentiated positioning |
| Musical Consistency | 25 pts | Tone mainline is reasonable, style is unified but tracks contrast each other |

### Output Format

Write to the "Scoring Overview" section in `docs/album-overview.md`:

```
## Scoring Overview (Round{N})

| Dimension | Score | Comment |
|-----------|-------|---------|
| Concept Originality | XX/25 | [one sentence] |
| Narrative Coherence | XX/25 | [one sentence] |
| Market Potential | XX/25 | [one sentence] |
| Musical Consistency | XX/25 | [one sentence] |

Total Score: XX/100

Low-Score Dimensions (< 20): [list]
Optimization Suggestions: [for each low-score dimension]
```

---

## Step 3: User Confirmation

The main agent submits the scoring results + core content of `docs/album-overview.md` to the user:
- Album name + Core concept + Core paradox
- Narrative axis summary
- Tracklist (track names + Hook + Tone)
- Scores + Low-score dimensions

User choices:
| User Response | Action |
|--------------|--------|
| "Looks good" / "Proceed to Phase 2" | ✅ Pass, update status to "Concept Confirmed" |
| "Change track X..." | Round++ → return to Step 1 (incremental modification of specified parts) |
| "The direction is wrong, rethink" | Round++ → return to Step 0 (re-explore through conversation) |

---

## Iteration Rules

| Rule | Value |
|------|-------|
| Minimum rounds | 1 round |
| Maximum rounds | 3 rounds |
| Pass condition | ≥ 80 points + user confirmation |
| Incremental modification | Only change the parts the user specifies |
| Concept overturned | Return to Step 0 for re-exploration |

---

## Phase 1 Checklist

| # | Checklist Item | Completion Criteria |
|---|---------------|---------------------|
| 1 | Core concept clear | Album name 2-6 Chinese characters / 1-5 English words + core concept 50-200 chars + core paradox ≤ 50 chars |
| 2 | Narrative axes complete | All tracks assigned to some axis, no omissions |
| 3 | Track positioning table complete | Row count = user-specified track count, each track has all 11 fields with values, no empty fields |
| 4 | Market analysis complete | Market positioning ≤ 50 chars + communication concept ≤ 30 chars + competitive differentiation / audience / risks / responses all have values |
| 5 | English album info complete | Album Description 50-300 chars + Creator's Note 100-800 chars |
| 6 | Track One-Liners complete | N tracks, one sentence per track, matches track count |
| 7 | Tone mainline complete | Main tone + per-track tones + transition logic |
| 8 | Scoring overview passes | 4-dimension scores complete + total ≥ 80 |
| 9 | To-do list initialized | All 6 Phases' checkboxes complete, Phase 1 marked [x] |
| 10 | `docs/album-overview.md` written | File exists, contains Overview / Tracklist / Market Analysis / Tone / English Info / Scoring Overview |

All ✅ + user confirmation → proceed to Phase 2

---

## Output File Contract

Strictly follows the Phase 1 contract in `FILE_CONTRACTS.md`.

---

## Reference

`examples/album-overview.md` is a complete example.
