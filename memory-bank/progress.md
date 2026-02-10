# Progress

## What works

- 1-2-3 Boxes: list view and practice cards; SRS; set tabs; collapsible box groups; token-based coloring using boxes-specific rules; UI layout refinements (instructions open by default, controls aligned, dropdown styled).
- Flashcards: token-based and word-based coloring; SRS.
- Editor: token editing; JA preview coloring.
- Kanji page: character lookup; color from SyllableColor.getColorForRomaji.
- Build: boxes-data.js, flashcards-vocab.js, common-kanji from scripts and content JSON/CSV.

## In progress / planned

- **Boxes coloring refactor:** Implemented and stabilized. `boxes-coloring.js` owns boxes rules (skip list, helpers, no-color, phrases, time-mapping); boxes.html includes token normalization for common compounds.

## Known issues

- **Boxes coloring:** Refactor implemented (boxes-coloring.js). If new coloring bugs appear on Boxes, update boxes-coloring.js/boxes.html only; verify on all 5 tabs and list + practice after any change.

## Last updated

February 2026.
