"""Renders Phase 2 agent JSON outputs into songs/T{N}-{name}.md format."""


def render_song_design(
    basic_info: dict,
    lyrics: dict,
    arrangement: dict,
    rhyme: dict,
    market: dict,
    scoring: dict,
    round_num: int = 1,
) -> str:
    lyrics_md = _render_lyrics_block(lyrics, round_num)
    english_lyrics_md = _render_english_lyrics(lyrics) if lyrics.get("english_lyrics") else ""
    arrangement_md = _render_arrangement(arrangement)
    sound_design_md = _render_sound_design(arrangement.get("sound_design", []))
    rhyme_md = _render_rhyme(rhyme, round_num)
    market_md = _render_market(market)
    scoring_data = _render_scoring(scoring)
    issues_md = _render_issues(scoring.get("issues", []))

    return f"""# T{basic_info.get("index", "?")}《{basic_info.get("track_name", "")}》

**{basic_info.get("direction", "")} · Album Track {basic_info.get("index", "?")}**

---

## Basic Info

| Item | Content |
|------|---------|
| Language | {basic_info.get("language", "")} |
| Direction | {basic_info.get("direction", "")} |
| Core Hook | {basic_info.get("core_hook", "")} |
| Core Paradox | {basic_info.get("core_paradox", "")} |
| Core Imagery | {basic_info.get("core_imagery", "")} |
| Physicality | {basic_info.get("physicality", "")} |
| Emotional Arc | {basic_info.get("emotional_arc", "")} |
| Est. Duration | ~{basic_info.get("estimated_duration", "")} |
| Arrangement Style | {arrangement.get("style", "")}, {arrangement.get("key", "")}, {arrangement.get("bpm", "")} BPM |

---

{lyrics_md}

{english_lyrics_md}

---

{arrangement_md}

---

{sound_design_md}

---

{rhyme_md}

---

{market_md}

---

{issues_md}

---

{scoring_data}
"""


def _render_lyrics_block(lyrics: dict, round_num: int) -> str:
    sections = lyrics.get("sections", [])
    lines = []
    for s in sections:
        lines.append(f"[{s.get('tag', '')}]")
        lines.extend(s.get("lines", []))
        lines.append("")
    body = "\n".join(lines)
    return f"""## Lyrics (Round{round_num})

```
{body}
```"""


def _render_english_lyrics(lyrics: dict) -> str:
    en = lyrics.get("english_lyrics", {})
    sections = en.get("sections", [])
    if not sections:
        return ""
    lines = []
    for s in sections:
        lines.append(f"[{s.get('tag', '')}]")
        lines.extend(s.get("lines", []))
        lines.append("")
    body = "\n".join(lines)
    return f"""## English Lyrics

```
{body}
```"""


def _render_arrangement(arr: dict) -> str:
    header = f"""> **BPM: {arr.get("bpm", "?")} BPM · {arr.get("key", "")} · {arr.get("style", "")}**"""
    sections_md = []
    for i, s in enumerate(arr.get("sections", []), 1):
        anchors = "\n".join(
            f"  - **{a.get('time', '')}**: {a.get('action', '')}"
            for a in s.get("time_anchors", [])
        )
        sections_md.append(
            f"""### {i}. {s.get('name', 'Section')} Design ({s.get('time_start', '')}–{s.get('time_end', '')})

{s.get('description', '')}

{anchors}"""
        )
    return f"""## Full Arrangement Design

{header}

{chr(10).join(sections_md)}"""


def _render_sound_design(sounds: list) -> str:
    if not sounds:
        return ""
    rows = []
    for s in sounds:
        rows.append(f"| {s.get('name', '')} | {s.get('description', '')} | {s.get('position', '')} | {s.get('volume_db', '')}dB |")
    return f"""## Key Sound Design

| Sound Effect | Description | Position | Volume |
|--------------|-------------|----------|--------|
{chr(10).join(rows)}"""


def _render_rhyme(rhyme: dict, round_num: int) -> str:
    dist = rhyme.get("rhyme_distribution", [])
    rows = []
    for r in dist:
        rows.append(f"| {r.get('rhyme_name', '')} | {r.get('sound', '')} | {r.get('position', '')} | {r.get('emotional_texture', '')} |")

    coord = rhyme.get("coordination_rating", [])
    coord_rows = []
    for c in coord:
        coord_rows.append(f"| {c.get('dimension', '')} | {c.get('score', 0)}/10 | {c.get('description', '')} |")

    return f"""## Rhyme Analysis (Round{round_num})

### Rhyme Distribution

| Rhyme | Sound | Position | Emotional Texture |
|-------|-------|----------|------------------|
{chr(10).join(rows)}

### Hook Rhyme Design Logic
{rhyme.get("hook_rhyme_design", "")}

### Rhyme × Arrangement Coordination Rating

| Dimension | Score | Description |
|-----------|-------|-------------|
{chr(10).join(coord_rows)}"""


def _render_market(market: dict) -> str:
    comp = market.get("core_competitiveness", [])
    comp_lines = "\n".join(f"- {c}" for c in comp)

    audience = market.get("target_audience_analysis", [])
    aud_rows = []
    for a in audience:
        aud_rows.append(f"| {a.get('layer', '')} | {a.get('characteristics', '')} | {a.get('acceptance', '')} |")

    return f"""## Cover Highlight Copy

> **"{market.get('cover_highlight_copy', '')}"**

---

## Market Evaluation Report

### Core Competitiveness
{comp_lines}

### Target Audience Analysis

| Audience Layer | Characteristics | Acceptance Assessment |
|---------------|----------------|----------------------|
{chr(10).join(aud_rows)}"""


def _render_scoring(scoring: dict) -> str:
    status = scoring.get("status", "In Progress")
    total = scoring.get("total", 0)
    return f"""## Data

- **Score:** {total}/100
- **Rhythm:** {scoring.get("rhythm_score", 0)}/20
- **Market:** {scoring.get("market_score", 0)}/20
- **Structure:** {scoring.get("structure_score", 0)}/20
- **Philosophy:** {scoring.get("philosophy_score", 0)}/20
- **Arrangement:** {scoring.get("arrangement_score", 0)}/20
- **Status:** {status}"""


def _render_issues(issues: list) -> str:
    if not issues:
        return "## Specific Issues for Revision\n\nNone"
    rows = []
    for i, issue in enumerate(issues, 1):
        p = issue.get("priority", "P2")
        icon = "🔴" if p == "P0" else "🟡" if p == "P1" else "🟢"
        rows.append(f"| {i} | {icon} {p} | {issue.get('module', '')} | {issue.get('description', '')} |")
    return f"""## Specific Issues for Revision

| # | Priority | Module | Issue Description |
|---|----------|--------|-----------------|
{chr(10).join(rows)}"""
