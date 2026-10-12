# Progress

## What works (on `main`, pushed)

- **Multi-language shell**: shared `assets/` (theme, i18n, langs, safe store, deck
  loader); all six pages wired; Lighthouse a11y 1.0 / 0 failures on all six pages.
- **Flashcards + SRS** for all five targets (Japanese deck 1,500 words from a
  2,507-row CSV; the 1,500 cap is T-003).
- **Decks**: es/fr/ko/zh at 2,500 words each with dictionary glosses, POS, and
  Tatoeba examples (all unreviewed; coverage + provenance in each
  `content/<lang>/README.md`). zh also has reproducible `enrich_source.py`; ko has
  `enrich.py` + `romaja.py`; es/fr have `enrich.py`.
- **Japanese extras**: 1-2-3 Boxes, kana charts, kanji list, tokenized-sentence editor.
- **Build + gate**: Node data builders; `node scripts/check.js`. 106 tickets, specs,
  docs, and a research pass (FSRS/SRS + Perplexica evaluation).

## In progress / planned

- Test suite (T-065, ADR-011) + native review of the five decks (T-102).
- Coloring correctness pass; FSRS-6 scheduling (T-096); audio (T-097); PWA (T-098);
  multimodal input (T-101).
- Japanese: raise the deck toward 2,500 (T-003) and fix the coloring/SRS edge cases.

## Known issues

- See `tickets/INDEX.md`. Coloring alignment and SRS interval caps are the recurring
  risks.

## Last updated

2026-10-12.
