# Phase 6 — Artist Story Writer Skill

> Generate artist story copy (4 files): Chinese long version + English long version + Chinese/English short version + quote extraction.

---

## Trigger

Automatically initiated after phase6-promotional-writer completes.

---

## Input

| Source | File | Content |
|--------|------|---------|
| Phase 1 | `docs/album-overview.md` | Album overview/narrative axis/track positioning/English album info |
| Phase 2 | `songs/T{N}-track.md` | Core paradox/Hook/emotional arc for each track |
| Phase 6 | `templates/artist-story.md` | Artist story template (4 formats) |
| Phase 5 | `generate/loudness-report.txt` | Production scale data |

---

## Execution

### ⚠️ Modification Scope
- **Read**: Phase 1-5 output files, template files
- **Write**: `docs/artist-story-cn.md`, `docs/artist-story-en.md`, `docs/artist-story-short.md`, `docs/artist-story-quotes.md`
- **Forbidden**: Modify template files or any files in `songs/`/`generate/` directories

### Narrative Strategy (Core Principle)

**Do not hide AI generation fact; transform it into the album's most honest metaphor.**

Core narrative: "Borrowed voices singing real pain" — collaboration, not replacement. AI is a tool; the pain is real.

### Output File 1: Chinese Long Version (~1800 words)

`docs/artist-story-cn.md`

**Five-Paragraph Structure:**
1. **Starting Question**: Why make this album? What is the core paradox?
2. **Nine Songs, Nine Stages**: Narrative axis overview + one line per song
3. **Production Notes**: MiniMax music-2.6 generation process (scale/rounds/selection criteria)
4. **Who Is This For**: Target audience + what to expect
5. **One-Line Summary**: The most powerful single sentence

**Requirements:**
- First person
- Sincere, no marketing tone
- Explicitly note AI generation fact
- ~1800 words
- If album contains instrumental tracks, mark "instrumental, no lyrics" in "nine songs nine stages" section
- Narrative strategy equally applies to instrumentals: "borrowed voices singing real pain" — instrumental can also be collaboration, not replacement

### Output File 2: English Long Version (~1400 words)

`docs/artist-story-en.md`

- Corresponds to Chinese version structure
- Independent English voice, not a translation
- ~1400 words

### Output File 3: Chinese/English Short Version

`docs/artist-story-short.md`

- Chinese ~400 words + English ~400 words
- Suitable for direct use on NetEase Cloud comments/Weibo/Xiaohongshu
- Retains core narrative + production info

### Output File 4: Quote Extraction

`docs/artist-story-quotes.md`

- 5 quotes, Chinese-English pairs
- Each independently shareable
- Suitable for posters/cards/repost quotes

---

## Checklist

| # | Check Item | Completion Criteria |
|---|------------|---------------------|
| 1 | Chinese long version complete | ~1800 words, five-paragraph structure complete |
| 2 | English long version complete | ~1400 words, independent English voice, not translation |
| 3 | Short version complete | Chinese/English each ~400 words/words |
| 4 | 5 quotes | Chinese-English pairs, each independently shareable |
| 5 | AI fact not hidden | Explicitly note music-2.6 generation |
| 6 | Narrative strategy consistent | "Collaboration, not replacement" runs through all copy |
| 7 | All 4 files generated | artist-story-cn/en/short/quotes all exist |

All ✅ → Proceed to next step (phase6-cover-designer)
