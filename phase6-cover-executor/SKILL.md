# Phase 6.4.6 — Cover Executor Skill

> Batch generate album cover images and single track cover images using MiniMax CLI `mmx image generate`.

---

## Trigger

Automatically initiated after phase6-cover-prompt-generator completes.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 6.4.5 | `generate/covers/prompts/album-cover-prompt{1,2,3}.txt` | Album cover 3 Prompt versions |
| Phase 6.4.5 | `generate/covers/prompts/T{N}-track-cover-prompt{1,2,3}.txt` | Single track cover Prompts (3 versions per track) |
| Phase 6.4.5 | `generate/covers/prompts/index.json` | Prompt index |

---

## Execution

### ⚠️ Modification Scope
- **Read**: `generate/covers/prompts/*.txt`, `generate/covers/prompts/index.json`
- **Write**: `generate/covers/album-cover-p{1,2,3}.png`, `generate/covers/tracks/T{N}-track-p{1,2,3}.png`
- **Forbidden**: Modify Prompt source files

### Parallel Strategy

**Album cover + N track covers = 1 + N×3 parallel generation tasks.**

- Album cover 3 versions can be initiated in parallel
- Each track's 3 single cover versions can be initiated in parallel
- Different tracks can be initiated in parallel

⚠️ **Rate Limiting**: MiniMax image-01 has API rate limits. On 429 response, downgrade to serial generation, wait 3-5 seconds between each image.

### CLI Command Template

**Album Cover:**

```bash
# Version 1 — Concept-Faithful Type
mmx image generate \
  --prompt "$(cat generate/covers/prompts/album-cover-prompt1.txt)" \
  --width 2048 --height 2048 \
  --out-dir generate/covers \
  --out-prefix album-cover-p1

# Version 2 — Emotional-Atmosphere Type
mmx image generate \
  --prompt "$(cat generate/covers/prompts/album-cover-prompt2.txt)" \
  --width 2048 --height 2048 \
  --out-dir generate/covers \
  --out-prefix album-cover-p2

# Version 3 — Minimalist-Symbol Type
mmx image generate \
  --prompt "$(cat generate/covers/prompts/album-cover-prompt3.txt)" \
  --width 2048 --height 2048 \
  --out-dir generate/covers \
  --out-prefix album-cover-p3
```

**Single Track Cover (example: T1-Departure):**

```bash
mmx image generate \
  --prompt "$(cat generate/covers/prompts/T1-Departure-cover-prompt1.txt)" \
  --width 2048 --height 2048 \
  --out-dir generate/covers/tracks \
  --out-prefix T1-Departure-p1

mmx image generate \
  --prompt "$(cat generate/covers/prompts/T1-Departure-cover-prompt2.txt)" \
  --width 2048 --height 2048 \
  --out-dir generate/covers/tracks \
  --out-prefix T1-Departure-p2

mmx image generate \
  --prompt "$(cat generate/covers/prompts/T1-Departure-cover-prompt3.txt)" \
  --width 2048 --height 2048 \
  --out-dir generate/covers/tracks \
  --out-prefix T1-Departure-p3
```

### CLI Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `--prompt` | Read from corresponding promptN.txt | Main description |
| `--width` | 2048 | Maximum resolution (image-01 support limit) |
| `--height` | 2048 | Square cover |
| `--out-dir` | `generate/covers` or `generate/covers/tracks` | Output directory |
| `--out-prefix` | `album-cover-pN` or `T{N}-track-pN` | Output filename prefix |

### Output Management

```
generate/covers/
├── album-cover-p1.png              ← Version 1: Concept-Faithful Type
├── album-cover-p2.png              ← Version 2: Emotional-Atmosphere Type
├── album-cover-p3.png              ← Version 3: Minimalist-Symbol Type
├── prompts/                        ← Prompt source files
│   ├── album-cover-prompt{1,2,3}.txt
│   ├── T{N}-track-cover-prompt{1,2,3}.txt
│   └── index.json
└── tracks/
    ├── T1-track-p1.png              ← T1 Version 1
    ├── T1-track-p2.png              ← T1 Version 2
    ├── T1-track-p3.png              ← T1 Version 3
    ├── T2-track-p1.png
    ├── ...
    └── TN-track-p3.png              ← TN Version 3
```

### Quality Check

After generation completes, basic check on each cover image:
1. File exists and non-empty (≥ 50KB)
2. Image is square (2048×2048 or close proportion)
3. Format is PNG

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | Album cover 3 images generated | album-cover-p1/p2/p3.png exist |
| 2 | All single track covers generated | N tracks × 3 images = all product files exist |
| 3 | Files open normally | Non-corrupted images, file size ≥ 50KB |
| 4 | Output directory structure correct | covers/ + covers/tracks/ with agreed naming |
| 5 | Original Prompts not polluted | No modifications to files in `generate/covers/prompts/` |
| 6 | Generation log saved | Record each image generation time/model version/Prompt source |

All ✅ → Return to Phase 6 main flow, proceed to phase6-promo-video-executor
