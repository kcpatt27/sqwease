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
- Not yet a full 2,500-word multi-language product — non-Japanese decks are
  30-word **starters** on branches.
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
assets/       shared theme/i18n/langs/store/deck-loader (on the UI branch)
content/      human-editable sources (CSV/JSON/TSV/MD)
data/<lang>/  per-language deck modules (on the language branches)
scripts/      Node data builders + the gate
tickets/      local markdown backlog (77 items) + INDEX.md
docs/specs/   specifications
memory-bank/  durable context for AI sessions
```

## Status

**Working state as of 2026-10-09.**

On `main` (shipped): six Japanese-focused pages; simplified SM-2 SRS in
`flashcards.html` and `boxes.html`; a 1,500-word flashcard deck generated from a
2,507-row CSV; 240 common kanji; token-based coloring; the gate passes
(`node scripts/check.js`: romaji 7/7, 12 inline scripts across 6 pages, generated
data present).

On branches (built, **not yet merged**):

- `ui/intl-a11y-perf` — language-agnostic shell: 6 UI locales, target-language
  registry, safe storage, deck loader, real buttons/keyboard, contrast-compliant
  light+dark palette, `main` landmarks. Ad-hoc Lighthouse accessibility **1.0,
  zero failures on all six pages**.
- `lang/spanish`, `lang/french`, `lang/korean`, `lang/mandarin` — 30-word starter
  decks + sources, built by the shared `scripts/build-lang-vocab.js`.

**Honest gaps:** 77 open tickets (1 critical, 20 high — see `tickets/INDEX.md`);
coloring alignment is the known weak point; non-Japanese decks are unreviewed
starters; no automated CI (the gate is manual); kanji lookup needs network.

## Documentation

| Doc | Covers |
| --- | --- |
| `ROADMAP.md` | plan and current frontier |
| `ARCHITECTURE.md` | design and as-built truth |
| `PROJECT_CONTEXT.md` | map, environment, conventions, glossary |
| `DECISIONS.md` | why things are the way they are (ADRs) |
| `AGENTS.md` | the contract for agent sessions |
| `docs/specs/` | per-branch specifications |
| `tickets/INDEX.md` | the backlog |

Reading order: `PROJECT_CONTEXT.md` → `ARCHITECTURE.md` → `ROADMAP.md` →
`DECISIONS.md`; agents read `AGENTS.md` too.

## Contributing

Solo project for now. If you do contribute: run `node scripts/check.js`, keep the
vanilla/no-dependency rule, edit `content/` (never generated files), and update
the docs in the same commit as the change.
