# Progress

## What works (on `main`)

- Flashcards with SRS (simplified SM-2), 1,500-word Japanese deck.
- 1-2-3 Boxes: list/practice/word lists + SRS.
- Kana charts, kanji list, tokenized-sentence editor.
- Node data builders and the gate (`node scripts/check.js`).
- 77-item ticket backlog + specs + starter docs.

## On branches (not merged)

- `ui/intl-a11y-perf`: shared theme/i18n/langs/store/deck-loader; all six pages
  wired; keyboard-operable controls; contrast-compliant light+dark palette;
  `main` landmarks; meta descriptions. Lighthouse accessibility 1.0/0 failures
  on all six pages (verified via the desktop browser).
- `lang/spanish`, `lang/french`, `lang/korean`, `lang/mandarin`: 30-word starter
  decks + sources, built by `scripts/build-lang-vocab.js`. Verified rendering for
  `es`, `zh`, `ko`.

## In progress / planned

- Merge the UI + language branches; close P0/P1 tickets.
- Coloring correctness pass + test coverage.
- Full datasets + native review; audio; PWA; offline kanji.

## Known issues

- See `tickets/INDEX.md`. Critical: T-001 (telemetry on `main`).
- Coloring alignment and SRS interval caps are the recurring risks.

## Last updated

2026-10-09.
