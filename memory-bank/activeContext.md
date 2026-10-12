# Active context

## Current focus

- **Multi-language shell + four 2,500-word decks are merged on `main` and pushed.**
  The UI shell (`assets/`: 6 UI locales, target registry, safe store, deck loader,
  a11y) and the es/fr/ko/zh decks (dictionary glosses, POS, Tatoeba examples) are
  live. Next frontier: the test suite (T-065) and native review of the decks (T-102).

## Recent decisions

- Tickets/specs are local markdown (`tickets/`, `docs/specs/`); no hosted tracker.
- Multi-language: one shared deck contract (`data/<code>/vocab.js` via
  `SqweaseVocab.provide`) + `assets/langs.js`; language branches add data only.
- UI strings come from a small table (`assets/i18n.js`); no i18n framework.
- WCAG 2.2 AA is a requirement; the coloring palette has contrast-compliant light
  and dark variants.
- Keep `file://` support: core data is script-loaded, never `fetch()`ed.
- Testing strategy: Node's built-in `node --test`, wired into `scripts/check.js`
  (ADR-011).
- Full ADR list: `DECISIONS.md`.

## Known issues (for future AI)

- **Coloring alignment** remains the known weak point (T-005…T-008, T-016, T-018).
  Rules: generic → `syllable-color.js`; Boxes-only → `boxes-coloring.js`;
  particles → `romaji.js`. Do not add Boxes data to shared lists.
- **Telemetry** (T-001) was removed by the UI-shell merge — verified gone on `main`.
- The four decks are **unreviewed** (T-102). Korean has the thinnest POS/example
  coverage; zh POS came from Wiktextract + jieba; es/fr/ko/zh glosses are
  dictionary-sourced (no machine translation).
- Japanese is still a 1,500-word deck (T-003) and lacks POS/examples per word.
- See `tickets/INDEX.md` for the ranked list.

## Last updated

2026-10-12.
