# Hill-climb plan: stages to full language coverage

| Field | Value |
|-------|-------|
| Date | 2026-10-12 |
| Status | Plan — not scheduled |
| Method | greedy local search on a measurable score (§1) |
| Related | `tickets/INDEX.md`, `docs/specs/SPEC-language-scaffolding.md`, `DECISIONS.md` |

Goal: bring **Spanish, French, Korean, Mandarin** up to Japanese-level coverage —
and improve **Japanese** itself, which has a few small issues that make it hard to
use. "Japanese level" means *both* data parity and feature coverage; today Japanese
is the **feature** bar (tokens/coloring, Boxes, kana, kanji) while its **data** is
weaker (a 1,500-word deck, no per-word POS/examples).

## 1. The method (reusable)

Turn the goal into a **score**, then iterate:

1. `score = w1·gloss% + w2·reading% + w3·pos% + w4·example%` (weights by value).
2. Measure the baseline from `content/<code>/source.tsv`.
3. Make **one** change; re-measure; **keep only if the score rises**; commit; repeat
   until it hits the target or plateaus.
4. Constraints: **licensed sources only**, no fabrication, no unofficial translate
   endpoints, and a committed `enrich.py` so a "win" survives a rebuild.
5. The score measures **coverage, not correctness** — native review is always the
   last stage.

**Current anchors (measured 2026-10-12, on `main`):**

| Lang | reading | gloss | pos | examples | note |
|------|---------|-------|-----|----------|------|
| fr | 99.9% IPA | 100% dict | ~100% | 98.1% | quality bar |
| es | 99.0% IPA | 100% dict | 100% | 98.8% | |
| ko | 100% (32% sourced RR) | 100% dict | 94.5% | 91.2% | thinnest; MT-free since the climb |
| zh | 100% pinyin | 100% dict | 99.7% | 98.6% | |
| ja | romaji | 1,500-word deck | n/a | 1 sentence/word | feature-rich, data-capped (T-003) |

## 2. Track A — raise es/fr/ko/zh to Japanese level

### A1. Data polish (per language)
- **A1.1 Native review** — the gating step (T-102). Record reviewer + date per language.
- **A1.2 Lemma / normalization** — frequency lists are surface forms; add a lemma
  (or a documented decision not to) and merge accent/variant duplicates (T-104).
- **A1.3 Fill residual blanks** — ko pos/examples, zh 7 POS + 35 examples, es 25 IPA;
  only from licensed sources.
- **A1.4 Reading quality** — push *sourced* IPA/romanization coverage up (Korean's
  32% sourced reading is the weakest; consider a better RR source or Wiktionary forms).

### A2. Feature parity (make cross-language features real)
- **A2.1 Tokenization + coloring per language.** The Gojūon color system is Japanese
  phonics; other languages need a documented strategy (likely *no coloring*, or an
  optional vowel/tone scheme). Isolate language assumptions (extends T-047).
- **A2.2 Audio** — Web Speech API pronunciation for every target (T-097).
- **A2.3 Images** — multimodal input beside example sentences (T-101).
- **A2.4 Boxes / grammar patterns** — Japanese-only today; design a language-agnostic
  sentence-pattern feature (new spec needed).
- **A2.5 SRS/FSRS parity** — one scheduler across all decks (T-096), with the
  per-language daily budget fix (T-085).

### A3. Breadth
- **A3.1** Expand to 5,000 words per language once 2,500 are reviewed.
- **A3.2** Add a 5th language from the scaffolding template (German/Italian/…).

## 3. Track B — improve Japanese (the "hard to use" issues)

Ordered by user impact, all already ticketed:

- **B1 Coloring correctness** — the recurring weak point: EN↔JA drift, question-word
  swaps, empty spans, silent fallbacks (T-005, T-006, T-007, T-008, T-016, T-017,
  T-018). Fix the mapping and add fixtures.
- **B2 SRS data integrity** — interval/ease overflow (T-009), locale day keys
  (T-010), ids derived from array position (T-061), shared per-day new-card budget
  (T-085).
- **B3 Deck build** — naive CSV splitter + silent 1,500 cap (T-003), token romaji
  from the pronunciation field (T-004); add a 5th reading column and raise the deck
  toward 2,500.
- **B4 Dead control** — the flashcards "Display phase" selector does nothing
  (T-078).
- **B5 Per-word enrichment** — add POS + a real example for each Japanese word, like
  the other decks (T-003 follow-up).
- **B6 Romaji edge cases** — ー, ヴ/ゔ, small-katakana combos, sokuon, ん (T-015).
- **B7 Ops** — offline kanji (T-014), gate validation for decks (T-106), test suite
  (T-065).

## 4. Suggested working order

1. **T-065 test suite** — the safety net for everything below (ADR-011).
2. **T-102 native review** of the five decks.
3. **Japanese correctness** — B1 coloring + B2 SRS + B3 build (the usability wins).
4. **Feature parity** — audio (T-097), images (T-101), FSRS (T-096).
5. **Breadth** — 5,000 words, then a 5th language.

## 5. Definition of done, per language

- 2,500 reviewed words; 100% gloss + reading; ≥95% POS + example.
- Audio (and image where feasible), FSRS scheduling.
- Correct token rendering, or an explicit, documented decision not to color.
- A recorded native reviewer + date in `content/<code>/README.md`.
