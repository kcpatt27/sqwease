# Active context

## Current focus

- **Planning + UI/multi-language foundation.** A 77-item backlog, specs, and a
  docs set were added to `main`. The multi-language/a11y UI shell is on branch
  `ui/intl-a11y-perf`; starter decks are on `lang/spanish|french|korean|mandarin`.
  None of the branches are merged yet.

## Recent decisions

- Tickets/specs are local markdown (`tickets/`, `docs/specs/`); no hosted tracker.
- Branches are local-only; the operator reviews and pushes.
- Multi-language: one shared deck contract (`data/<code>/vocab.js` via
  `SqweaseVocab.provide`) + `assets/langs.js`; language branches add data only.
- UI strings come from a small table (`assets/i18n.js`); no i18n framework.
- WCAG 2.2 AA is a requirement; the coloring palette now has contrast-compliant
  light and dark variants.
- Keep `file://` support: core data is script-loaded, never `fetch()`ed.
- Full ADR list: `DECISIONS.md`.

## Known issues (for future AI)

- **Coloring alignment** remains the known weak point (T-005…T-008, T-016, T-018).
  Rules: generic → `syllable-color.js`; Boxes-only → `boxes-coloring.js`;
  particles → `romaji.js`. Do not add Boxes data to shared lists.
- **Critical:** leftover localhost telemetry was removed on the UI branch
  (T-001) — verify it is gone before shipping; it is still present on `main`.
- See `tickets/INDEX.md` for the ranked list.

## Last updated

2026-10-09.
