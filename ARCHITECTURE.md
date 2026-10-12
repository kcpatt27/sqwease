# ARCHITECTURE

*As designed **and** as built. Where a component is a stub it says so. The
multi-language shell and four 2,500-word decks (es/fr/ko/zh) are merged on `main`;
Japanese remains the only fully-featured language. Cite code as `file:line` where
useful so drift is detectable.*

## The one boundary that matters

**The app is a static client that never requires a server, and every generated
artifact is reproducible from a human-editable source.**

Mechanism: pages are plain HTML that load plain JS from the repo root; data files
are produced by `scripts/build-*.js` from `content/*`; `node scripts/check.js`
verifies the romaji engine, inline-script syntax, and the presence of the
generated files. Breaking this boundary (adding a runtime service or hand-editing
a generated file) is the failure the docs guard against.

## Planes / subsystems

```
┌────────────────────────────────────────────────────────────────────┐
│ Presentation (static HTML pages)                                   │
│ index · flashcards · boxes · kana-charts · kanji · editor          │
└───────────────┬────────────────────────────────────────────────────┘
                │ loads
┌───────────────▼────────────────────────────────────────────────────┐
│ Shared libraries (repo root JS)                                    │
│ romaji.js · syllable-color.js · boxes-coloring.js · srs.js         │
│ tiny-segmenter.js (vendored)                                       │
│ assets/ theme.css theme.js store.js i18n.js langs.js vocab.js *   │
└───────────────┬────────────────────────────────────────────────────┘
                │ loads
┌───────────────▼────────────────────────────────────────────────────┐
│ Generated data (committed)      build-*.js reads                    │
│ flashcards-vocab.js · boxes-data.js · content/common-kanji.js      │
│ data/<lang>/vocab.js           ◄──────── content/<lang>/source.tsv │
└────────────────────────────────────────────────────────────────────┘
```

\* `assets/*` and `data/<lang>/*` are on `main` (merged 2026-10-12).

| Plane | Code home | Responsibility |
| --- | --- | --- |
| Presentation | `*.html` | Markup + page CSS/JS; wires libraries to DOM |
| Shared libs | root `*.js` | Deterministic helpers with no page knowledge |
| Generated data | root `*.js`, `data/` | Deck/boxes/kanji data the pages load |
| Sources | `content/` | Human-editable CSV/JSON/TSV/MD |
| Builders | `scripts/build-*.js` | Source → generated; no dependencies |
| Gate | `scripts/check.js` | Runs tests + syntax + presence checks |
| Town square | `tickets/`, `docs/specs/` | Local backlog and authorizing specs |

## Request / data lifecycle

**Flashcard study (as built on `main`):**
1. Browser loads `flashcards.html`.
2. It loads `romaji.js`, `srs.js`, `syllable-color.js`, `flashcards-vocab.js`.
3. `initVocab()` reads the deck, loads SRS state from `localStorage`, renders
   stats.
4. `startStudy()` builds a due queue (review → learning → new, new capped by
   `newCardsPerDay`) and shows cards.
5. Flipping colors JA/romaji/EN from token data; rating calls
   `SRS.reviewCard`; the updated card is persisted.
6. Steps 2–3 use `SqweaseVocab.load(targetLang)`; UI strings come from
   `SqweaseI18n`, colors from `syllable-color.js`.

**Data build (Japanese):**
`content/japanese-fluency-vocab.csv` → `scripts/build-flashcards-vocab.js` →
`flashcards-vocab.js`; `content/boxes-*.json` → `build-boxes-data.js` →
`boxes-data.js`; `kanjiapi.dev` → `build-common-kanji.js` →
`content/common-kanji.{json,js}`.

**Data build (other languages):**
`content/<code>/source.tsv` → `scripts/build-lang-vocab.js <code>` →
`data/<code>/vocab.js` (deck contract, stable ids).

## Trust boundaries and seams

| Boundary / seam | Between | Fails | Notes |
| --- | --- | --- | --- |
| `localStorage` read | browser storage ↔ app state | corrupt JSON / quota / disabled storage | Must route through the safe store helper (T-002, T-012) |
| Generated file | builder ↔ pages | stale or hand-edited artifact | Builder output is authoritative; rebuild and commit |
| Third-party API | `kanji.html` ↔ `kanjiapi.dev` | offline / CORS / rate-limit | Should fall back to bundled `common-kanji.json` (T-014) |
| Deck contract | `data/<code>/vocab.js` ↔ pages | missing/short deck | Loader rejects with a user-facing message; no crash |
| Coloring | token data ↔ rendered spans | misalignment | Pure functions; the honest weak point (see below) |

## As built (on `main`, 2026-10-12)

- **Multi-language shell**: `assets/` (theme.css, theme.js, i18n.js with 6 UI
  locales, langs.js target registry, store.js safe storage, vocab.js deck loader);
  all six pages wired to it. Lighthouse accessibility 1.0 / zero failures on all
  six pages.
- **Decks**: `data/ja/vocab.js` (1,500 words) plus `data/es|fr|ko|zh/vocab.js`
  (2,500 words each; dictionary glosses, POS, Tatoeba examples; **unreviewed**).
  es/fr/ko/zh each ship a reproducible `content/<code>/enrich*.py`.
- **Flashcards SRS**: `flashcards.html`, `srs.js` — 4 ratings, learning steps
  `[1,10]` min, graduating interval 1d. Persisted under `sqwease-flashcards-srs`.
- **1-2-3 Boxes**: `boxes.html`, `boxes-coloring.js` — generated sentences, five
  sets, practice + editable word lists, SRS under `sqwease-boxes-srs`.
- **Kana charts**: `kana-charts.html` — four Gojuon grids with row colors.
- **Kanji**: `kanji.html` — Grade 1+2 list + personal list; network lookup.
- **Editor**: `editor.html` — tokenized-sentence authoring with TinySegmenter.
- **Gate**: `scripts/check.js` — romaji tests 7/7, inline scripts across 6 pages,
  generated data present.

## Deliberate stubs (do not mistake these for controls)

| Stub | Status | Note |
| --- | --- | --- |
| Non-Japanese Kana/Kanji/Boxes | not built | Only Flashcards is cross-language in v0; the menu greys the rest out |
| Coloring non-color cue | partial | Palette now meets AA; a non-color alignment cue is still open (T-034) |
| `romaji-test.js` coverage | stub | 7 cases; many edge cases untested (T-015, T-065) |
| `srs.js` interval cap | missing | Unbounded growth throws `RangeError` (T-009) |
| Kanji lookup offline | not a control | Depends on a third-party API (T-014) |
| `data/<lang>` datasets | unreviewed | es/fr/ko/zh have 2,500 words each; native review pending (T-102) |
| Progress sync | not built | `localStorage` only; no accounts |

## Extension seams

- **Add a language**: add `content/<code>/source.tsv` + `README.md`, run
  `build-lang-vocab.js`, and correct one `SqweaseLangs` entry if needed. No core
  page edits (see `docs/specs/SPEC-language-scaffolding.md`).
- **Add a page**: copy the shared `<head>` pattern (theme.css, theme.js, i18n,
  langs) and a `<main>` landmark.
- **Add a builder**: read from `content/`, write a generated root/`data/` file,
  then add a presence check to `scripts/check.js`.

## Deployment shapes (architected, not built)

GitHub Pages (root) is the intended host; any static host works. A backend for
cross-device progress is *planned* and has no code — it must not be described as
existing.
