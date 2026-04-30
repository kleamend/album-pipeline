# Changelog

All notable changes to Album Pipeline will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0-beta] — 2026-04-30

### Added
- **6 Phase pipeline** — concept → songwriting → lyrics formatting → music generation → audio transcoding → album packaging
- **5-Expert iteration system** — lyrics, arrangement, rhyme, market, scoring experts per song
- **Quality gate** — score ≥ 80 required, 3-6 rounds per song
- **Bilingual album support** — Chinese + English produced in parallel
- **Absolute File Contracts** — strict input/output path and format definitions (inspired by Claude Code)
- **MiniMax CLI integration** — music generation, cover image, promo video
- **ClawHub distribution link**
- **Full documentation** — SKILL.md × 21, FILE_CONTRACTS.md, 5 templates, 2 examples, 1 retrospective

### Fixed
- Promo video duration corrected to 6s (MiniMax video model limit)
- MiniMax Music acknowledgment description

### Project
- MIT license
- OpenClaw Skill architecture with sub-agent orchestration
