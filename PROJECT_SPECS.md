# SQWease Specifications

**Product spec.** This file is the product vision and status; per-branch
implementation specs live in [`docs/specs/`](docs/specs/). Architecture and
decisions live in `ARCHITECTURE.md` / `DECISIONS.md`.

## Vision

A language-learning app that combines comprehensive input with spaced repetition
so a learner can master the ~2,500 most common words of a language, starting with
Japanese and extending to Mandarin, Spanish, French, and Korean. It targets
travelers, students, and self-learners who want maximum learning ROI.

## Current status (2026-10-09)

- **Shipped (`main`):** six Japanese pages; simplified SM-2 SRS; token-based
  coloring; 1,500-word deck; 1-2-3 Boxes; kana charts; kanji list; token editor.
- **On branches (not merged):** multi-language/a11y UI shell
  (`ui/intl-a11y-perf`) and 30-word starter decks for `es/fr/ko/zh` (`lang/*`).
- **Backlog:** 77 tickets in `tickets/INDEX.md`.
- **Complete-ness:** early development; no backend, no accounts, no audio, no
  images. See `ROADMAP.md` for the honest ladder.

## Technology

- Frontend: HTML5, CSS3, vanilla JavaScript (no framework, no bundler).
- Data: human-editable `content/` sources → committed generated JS via Node
  builders. No runtime dependencies.
- Hosting: static (GitHub Pages or any static host); works from `file://`.
- Progress: `localStorage` only (no server).

## Key decisions

See `DECISIONS.md` (ADR-001…ADR-010). Highlights:

- Vanilla static client, no framework (ADR-001).
- Sources in `content/`, generated files committed (ADR-002).
- Local markdown tickets/specs (ADR-003); local-only branches (ADR-004).
- Simplified SM-2 with four ratings (ADR-005).
- Romaji-first coloring with Boxes rules isolated (ADR-006).
- Multi-language as a deck contract + loader; language branches add data only
  (ADR-007).
- Small string table for i18n (ADR-008); WCAG 2.2 AA required (ADR-009);
  keep `file://` (ADR-010).

## Success metrics (aspirational, not measured yet)

Retention ≥80% at 30 days; 2,500 words mastered in 3–6 months; 4–5 sessions/week.
These are targets with no baseline data behind them — treat as goals, not claims.

## Known limitations

The accurate list lives in `ROADMAP.md` "Deliberate stubs" + `README.md` "Honest
gaps". Summary: no backend/accounts/audio/images; coloring imperfect on some
sentences; non-Japanese decks are starters; kanji lookup needs network; SRS
intervals uncapped.

## Important URLs

- GitHub repo: https://github.com/kcpatt27/sqwease
- Local dev: `http://localhost:8000` (any static server) or open `index.html`.
