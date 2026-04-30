# Phase 6 — Cover Designer Skill

> Design cover concept plans, including multiple visual directions, color schemes, and application scenarios.

---

## Trigger

Automatically initiated after phase6-artist-story-writer completes.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 1 | `docs/album-overview.md` | Core concept/narrative axis/tonality main line |
| Phase 2 | `songs/T{N}-track.md` | Core imagery/physical sensation for each track |
| Phase 6 | `templates/cover-concept.md` | Cover concept template |
| Phase 6 | `assets/` | Existing concept images (if any) |

---

## Execution

### ⚠️ Modification Scope
- **Read**: `docs/album-overview.md`, `songs/T{N}-track.md`, `templates/cover-concept.md`, `assets/`
- **Write**: `docs/cover-concept.md`
- **Forbidden**: Modify template files or any files in `songs/`/`generate/` directories

### Cover Concept Structure

Initialize from template `templates/cover-concept.md`, fill the following:

1. **≥ 3 Visual Directions**:
   - Each direction has concept description + design rationale
   - Connected to album core concept/narrative axis
   - Color scheme (with HEX values)

2. **Per-Track Cover Concept**:
   - Extracted from `songs/T{N}-track.md` core imagery/physical sensation
   - Small variations under unified visual language

3. **Structured Image Generation Descriptions** (for phase6-cover-prompt-generator):

   Each visual direction must include the following **structured fields usable for image generation**:

   | Field | Description | Example |
   |-------|-------------|---------|
   | `Main Visual` | Core visual element description | "A silhouette standing on an abandoned train platform, backlit" |
   | `Color Tone` | Overall color tendency + HEX values | "Cold-warm contrast, #1A1A2E deep blue background + #E94560 warm light accents" |
   | `Composition` | Composition method + whitespace direction | "Centered composition, 40% top whitespace for album title layout" |
   | `Style/Texture` | Visual style keywords | "Film grain, low saturation, high contrast" |
   | `Lighting` | Light source direction + atmosphere | "Raking light from side, long shadows, Tyndall effect" |
   | `Typography Hint` | Text layout reserved space | "Top whitespace, small bottom-right whitespace" |

4. **Application Scenarios**:
   | Scenario | Dimensions | Requirements |
   |----------|------------|--------------|
   | Streaming cover | 3000×3000px | Square, subject centered, recognizable at small size |
   | Physical CD | 300×300mm | High resolution, print-ready |
   | Social media | 800×800px | Thumbnail clear |
   | MV background | 1920×1080px | Landscape, animatable |

### Color Scheme Format

```markdown
### Color Scheme

| Role | Color Value | Purpose |
|------|-------------|---------|
| Primary | #XXXXXX | Background/main visual |
| Secondary 1 | #XXXXXX | Accent/highlight |
| Secondary 2 | #XXXXXX | Contrast/tension |
| Accent | #XXXXXX | Hook element |
```

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | ≥ 3 visual directions | Each with concept description + design rationale |
| 2 | Color scheme complete | With HEX values + purpose descriptions |
| 3 | Each track has cover concept | N tracks, small variations under unified visual language |
| 4 | Application scenarios complete | Streaming/physical/social/MV four scenarios |
| 5 | Dimension requirements noted | Each scenario has explicit pixel/mm requirements |
| 6 | Connected to album concept | Cover direction reflects core paradox/narrative axis |

All ✅ → Proceed to next step (phase6-platform-checker)
