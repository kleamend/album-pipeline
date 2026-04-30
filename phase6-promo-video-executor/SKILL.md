# Phase 6.7 — Promo Video Executor Skill

> Generate album promotional short video using MiniMax CLI `mmx video generate`.

---

## Trigger

Automatically initiated after phase6-cover-executor completes.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 6 | `docs/album-overview.md` | Core concept/narrative axis/track list |
| Phase 6 | `docs/promotional-materials.md` | Promotional document (video script material) |
| Phase 6 | `docs/cover-concept.md` | Cover concept (visual style reference) |
| Phase 6.4.6 | `generate/covers/album-cover-p1.png` | Best album cover (first-frame reference) |
| Phase 5 | `generate/cn_320k/*.mp3` | Final selected audio (BGM reference) |

---

## Execution

### ⚠️ Modification Scope
- **Read**: Phase 6 document files, cover image, audio files
- **Write**: `docs/promo-video.mp4`
- **Forbidden**: Modify any source documents or cover image files

### Video Strategy

Extract video script concepts from `docs/promotional-materials.md` and `docs/album-overview.md`, generate a 6-second promotional video (MiniMax video model fixed 6-second duration).

| Spec | Duration | Use |
|------|----------|-----|
| Standard | 6 seconds | Social media short video (Douyin/Xiaohongshu/WeChat Video/Reels/Shorts) |

### Video Generation Methods

#### Method A: Pure Text-to-Video (T2V)

Without first-frame reference, generate entirely from text description:

```bash
mmx video generate \
  --prompt "{full album promotional video description: visual style, transition rhythm, emotional atmosphere}" \
  --model MiniMax-Hailuo-2.3 \
  --download docs/promo-video.mp4
```

#### Method B: First-Frame Reference + Text-to-Video (Recommended)

Use best album cover as first-frame reference for visual consistency:

```bash
mmx video generate \
  --prompt "{video action/transition description: cover gradually unfolds, lyric imagery emerges, emotional progression}" \
  --first-frame generate/covers/album-cover-p1.png \
  --model MiniMax-Hailuo-2.3 \
  --download docs/promo-video.mp4
```

### Prompt Writing Guide

Extract video script material from the following documents:

| Material Source | Extract | Video Mapping |
|----------------|---------|---------------|
| `docs/album-overview.md` core concept | Album theme/paradox | Core visual metaphor |
| `docs/album-overview.md` narrative axis | Emotional arc | Video rhythm (beginning→development→turn→conclusion) |
| `docs/cover-concept.md` color scheme | HEX color values | Video color tone |
| `docs/cover-concept.md` visual direction | Main visual description | Video main scene |
| `docs/promotional-materials.md` core dissemination concept | One-line dissemination point | Video ending CTA text |
| `songs/T{N}-*.md` cover highlight copy | One-line copy per track | Mid-section lyric flash text |
| `generate/covers/album-cover-p1.png` | Best cover image | First-frame reference |

### Video Prompt Structure

```
{video type} for music album "{album Chinese name} / {English Name}"

Opening (0-{opening seconds}s): {first-frame description, cover visual elements}
Build ({opening seconds}-{climax seconds}s): {emotional progression, visual transition description}
Climax ({climax seconds}-{ending seconds}s): {climax scene, core visual symbol}
Resolution ({ending seconds}-end): {wrap-up, album name/artist name text appears}

Visual style: {photography/illustration/3D/abstract}
Color tone: {primary HEX → secondary HEX gradient}
Motion: {camera movement: dolly/pan/tilt/zoom/particles}
Typography: {text appearance method: fade-in/handwritten/typewriter}
Mood: {overall emotional tone}

Technical: 6 second video, {16:9 or 9:16}, cinematic quality
```

### Aspect Ratio Selection

| Platform | Ratio | Recommended Use |
|----------|-------|----------------|
| 16:9 | Landscape | Bilibili/YouTube/WeChat Video |
| 9:16 | Portrait | Douyin/Xiaohongshu/Reels/Shorts |
| 1:1 | Square | Moments/Instagram |

⚠️ **Default generate 16:9 landscape** (most versatile), vertical/square can be generated additionally if needed.

### CLI Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `--prompt` | Video description text | Main description |
| `--model` | `MiniMax-Hailuo-2.3` | Video generation model |
| `--first-frame` | Cover image path (optional) | First-frame reference image |
| `--download` | Output path | Save location |

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | Complete video generated | `docs/promo-video.mp4` exists |
| 2 | Video generated | `docs/promo-video.mp4` exists |
| 3 | Video file playable | Non-corrupted file, file size ≥ 1MB |
| 4 | Video duration correct | Fixed 6 seconds |
| 5 | First-frame reference (if used) correct | Video opening visually consistent with album cover |
| 6 | Generation log saved | Record generation time/model version/usage method |

All ✅ → Return to Phase 6 main flow, proceed to phase6-packager
