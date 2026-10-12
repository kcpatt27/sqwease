# SQWease — learn the most common words in any language

*The front door. Shipped surface only — no live detail (that is the tickets) and
no plan (that is `ROADMAP.md`).*

SQWease (**Speak Quite Well with Ease**) is a static, client-side language app
that combines **comprehensive input** with **spaced repetition** to master the
~2,500 most common words of a language. It starts with Japanese and is being
extended to Mandarin, Spanish, French, and Korean.

> **The one rule:** everything the app shows is reproducible from a
> human-editable source in `content/`, and the app must keep working opened
> straight from disk (`file://`) with no server.

## What this project is not

- Not a backend service, and it has no accounts or cloud sync — progress lives
  in the browser's `localStorage`.
- Not a framework app: no React/Vue/bundler and no runtime npm dependencies.
- Not yet a fully reviewed multilingual product — the es/fr/ko/zh decks are
  2,500-word **unreviewed** datasets (native review pending, T-102).
- Not a promise of fluency; the SRS helps retention, the learner does the rest.

## How it works

```
content/<source> ──(node scripts/build-*.js)──► generated *.js data
                                                    │
   index.html ──► flashcards.html (SRS study) ◄─────┘
              └► boxes.html · kana-charts.html · kanji.html · editor.html
```

Pick a target language → study the deck as flip flashcards (word → reading →
meaning → example) → rate each card (Again/Hard/Good/Easy) → the scheduler
decides when it comes back. Japanese adds 1-2-3 Boxes sentence practice, kana
charts, a kanji list, and a tokenized-sentence editor.

## Quick start

```bash
# Option A: open the folder directly
#   open index.html in a browser (no server needed)

# Option B: serve locally
python -m http.server 8000     # or: npx http-server
#   open http://localhost:8000

# Rebuild data after editing sources
node scripts/build-flashcards-vocab.js
node scripts/build-boxes-data.js
node scripts/build-common-kanji.js   # needs network

# Gate (run before committing)
node scripts/check.js
```

## Repository layout

```
index.html flashcards.html boxes.html kana-charts.html kanji.html editor.html
              the six static pages
romaji.js syllable-color.js boxes-coloring.js srs.js tiny-segmenter.js
              shared client libraries
assets/       shared theme/i18n/langs/store/deck-loader
content/      human-editable sources (CSV/JSON/TSV/MD)
data/<lang>/  per-language deck modules (2,500 words: es·fr·ko·zh, plus ja)
scripts/      Node data builders + the gate
tickets/      local markdown backlog (106 items) + INDEX.md
docs/specs/   specifications
memory-bank/  durable context for AI sessions
```

## Status

**Working state as of 2026-10-12.**

On `main` (shipped, pushed):

- **Six pages** wired to the shared `assets/` shell (6 UI locales, target-language
  registry, safe storage, deck loader, real buttons/keyboard, contrast-compliant
  light+dark palette, `main` landmarks). Lighthouse accessibility **1.0 / zero
  failures on all six pages**.
- **Four 2,500-word decks** — Spanish, French, Korean, Mandarin — each with
  dictionary-sourced glosses (no machine translation), POS, and example sentences
  from licensed sources (coverage + provenance in each `content/<lang>/README.md`).
  All remain **unreviewed** pending native review (T-102).
- **Japanese**: six pages, simplified SM-2 SRS, 240 kanji, token-based coloring;
  a 1,500-word deck from a 2,507-row CSV (the 1,500 cap is T-003).

**Honest gaps:** 106 tickets (103 open; 0 critical, 23 high — see
`tickets/INDEX.md`); coloring alignment is the known weak point; the decks need
native review; no automated CI (the gate is manual; T-065 adds a Node test suite);
kanji lookup needs network (T-014).

## Documentation

| Doc | Covers |
| --- | --- |
| `ROADMAP.md` | plan and current frontier |
| `ARCHITECTURE.md` | design and as-built truth |
| `PROJECT_CONTEXT.md` | map, environment, conventions, glossary |
| `DECISIONS.md` | why things are the way they are (ADRs) |
| `AGENTS.md` | the contract for agent sessions |
| `docs/specs/` | per-branch specifications |
| `docs/research/` | research passes (FSRS/SRS, colors, Perplexica evaluation) |
| `docs/plans/` | forward plans (hill-climb stages) |
| `docs/prompts/` | next-session build prompts (test suite) |
| `tickets/INDEX.md` | the backlog |

Reading order: `PROJECT_CONTEXT.md` → `ARCHITECTURE.md` → `ROADMAP.md` →
`DECISIONS.md`; agents read `AGENTS.md` too.

## Contributing

Solo project for now. If you do contribute: run `node scripts/check.js`, keep the
vanilla/no-dependency rule, edit `content/` (never generated files), and update
the docs in the same commit as the change.
