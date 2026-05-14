"""Renders Phase 1 agent JSON outputs into album-overview.md format."""


def render_album_overview(
    creative: dict,
    market: dict,
    music: dict,
    reviewer: dict,
    round_num: int = 1,
) -> str:
    tracks_md = _render_track_table(creative.get("tracks", []))
    narrative_md = _render_narrative_axes(creative.get("narrative_axes", []))
    one_liners_md = _render_one_liners(market.get("english_info", {}).get("track_one_liners", []))
    tonal_dist = _render_tonal_distribution(music.get("track_tonals", {}))
    score_md = _render_score_table(reviewer, round_num)

    return f"""# Album Overview — 《{creative.get("album_name_cn", "")}》

> Status: Concept Design (Round{round_num})
> Last Updated: {_today()}

---

## Album Overview

**Album Name:** 《{creative.get("album_name_cn", "")}》 / **{creative.get("album_name_en", "")}**
**Core Concept:** {creative.get("core_concept", "")}
**Core Paradox:** {creative.get("core_paradox", "")}
**Target Audience:** {market.get("target_audience", "")}
**Reference Style:** {creative.get("reference_style", "N/A")}

**Narrative Arc:**
{narrative_md}

---

## Market Analysis

**Market Positioning:** {market.get("market_positioning", "")}
**Target Audience:** {market.get("target_audience", "")}
**Competitive Differentiation:** {market.get("competitive_differentiation", "")}
**Core Communication Concept:** {market.get("core_communication_concept", "")}
**Potential Risks:** {market.get("potential_risks", "")}

### English Album Info

### Album Name
**{creative.get("album_name_en", "")}**

### Album Description
{market.get("english_info", {}).get("album_description", "")}

### Creator's Note
{market.get("english_info", {}).get("creators_note", "")}

### Track One-Liners

| # | Track | English Title | One-Liner |
|---|-------|--------------|-----------|
{one_liners_md}

---

## Track List

| # | Track | English Name | Direction | Core Hook | Core Paradox | Core Imagery | Physicality | Emotional Arc | Arrangement Style | Est. Duration | Status |
|---|-------|-------------|-----------|-----------|--------------|--------------|-------------|---------------|------------------|--------------|--------|
{tracks_md}

**✅ Duration Status:** TBD

---

## Tonal Main Line

{music.get("primary_tonal", "")}

Tonal Distribution: {tonal_dist}

Tonal Logic: {music.get("tonal_logic", "")}

---

{score_md}

---

## To-Do

- [x] Phase 1 Concept Confirmed (Round{round_num})
- [ ] Phase 2 Song Generation
- [ ] Phase 3 Lyrics Standardization
- [ ] Phase 4 Music Generation
- [ ] Phase 5 Selection and Transcoding
- [ ] Phase 6 Release Materials
"""


def _render_narrative_axes(axes: list) -> str:
    lines = []
    for ax in axes:
        indices = ax.get("track_indices", [])
        track_str = ", ".join(f"T{i}" for i in indices)
        lines.append(f"- **{ax.get('name', '')}**: {ax.get('meaning', '')}, {track_str}")
    return "\n".join(lines)


def _render_track_table(tracks: list) -> str:
    lines = []
    for t in sorted(tracks, key=lambda x: x.get("index", 0)):
        idx = t.get("index", "?")
        lines.append(
            f"| {idx:02d} | T{idx}《{t.get('name', '')}》 | {t.get('english_name', '')} "
            f"| {t.get('direction', '')} | {t.get('core_hook', '')} | {t.get('core_paradox', '')} "
            f"| {t.get('core_imagery', '')} | {t.get('physicality', '')} "
            f"| {t.get('emotional_arc', '')} | {t.get('arrangement_style', '')} "
            f"| {t.get('estimated_duration', '')} | ⏳ Pending Generation |"
        )
    return "\n".join(lines)


def _render_one_liners(lines: list) -> str:
    result = []
    for item in lines:
        idx = item.get("index", "?")
        result.append(f"| {idx:02d} | T{idx} | {item.get('english_title', '')} | {item.get('one_liner', '')} |")
    return "\n".join(result)


def _render_tonal_distribution(dist: dict) -> str:
    parts = []
    for idx, tonal in sorted(dist.items()):
        parts.append(f"T{idx} {tonal}")
    return " | ".join(parts)


def _render_score_table(reviewer: dict, round_num: int) -> str:
    total = reviewer.get("total", 0)
    return f"""## Score Overview (Round{round_num})

| Dimension | Score | Comment |
|-----------|-------|---------|
| Conceptual Originality | {reviewer.get("conceptual_originality", 0)}/25 | {reviewer.get("conceptual_originality_comment", "")} |
| Narrative Coherence | {reviewer.get("narrative_coherence", 0)}/25 | {reviewer.get("narrative_coherence_comment", "")} |
| Market Potential | {reviewer.get("market_potential", 0)}/25 | {reviewer.get("market_potential_comment", "")} |
| Musical Consistency | {reviewer.get("musical_consistency", 0)}/25 | {reviewer.get("musical_consistency_comment", "")} |

Total: {total}/100
"""


def _today() -> str:
    from datetime import date
    return date.today().isoformat()
