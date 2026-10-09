# PROJECT_CONTEXT

*Stable map: what SQWease is, where it starts from, how to run it, and the
conventions that keep it from drifting. This is not a status page — live status
lives in `README.md` and the tickets. Design lives in `ARCHITECTURE.md`; the plan
lives in `ROADMAP.md`.*

## 1. What this project is

SQWease (**Speak Quite Well with Ease**) is a language-learning web app that
combines **comprehensive input** with **spaced repetition** to help a learner
master the ~2,500 most common words of a language — starting with Japanese.

- **For:** travelers, students, and self-learners who want maximum learning ROI.
- **Shape:** a static, client-side site (vanilla HTML/CSS/JS) that runs from a
  folder or any static host. No server, no account, no npm runtime dependency.
- **Method:** a frequency-ordered vocabulary deck; flip flashcards (word →
  romaji/reading → meaning → example); a simplified SM-2 scheduler; plus
  Japanese-specific extras (1-2-3 Boxes sentence practice, kana charts, a kanji
  list, and a token editor).

## 2. Repository state at start (historical)

The repo began as a single `index.html` flashcard page with 263 Japanese words
(the docs that said "~5% complete / single page" were true then). It has since
grown to six pages, an SRS engine, a tokenizer/editor, and a prose data pipeline.
The original README/ROADMAP/ARCHITECTURE had gone stale — correcting them is part
of this documentation pass.

## 3. Environment discovered

| Tool | Version seen | Notes |
| --- | --- | --- |
| Node.js | v24.x | Runs the build + gate scripts; **no npm install needed** |
| Browser | modern Chromium/Firefox/Safari | App is pure client-side |
| OS | Windows (dev) | Paths in notes may be absolute; core app is OS-agnostic |

There are **no runtime dependencies**. The only third-party code is a vendored
`tiny-segmenter.js`. `package.json` does not exist and is not required.

## 4. What is built (module map)

```
index.html            Landing menu + language selectors (selectors land on the UI branch)
flashcards.html       SRS flashcard study loop (the cross-language activity)
boxes.html            1-2-3 Boxes: generated sentences, practice, editable word lists
kana-charts.html      Hiragana/Katakana Gojuon reference grids
kanji.html            Kanji lookup + personal list
editor.html           Tokenized-sentence editor (authoring)

romaji.js             kana -> romaji (modified Hepburn), particle/kanji helpers
syllable-color.js     romaji-first syllable color coding (light/dark palettes)
boxes-coloring.js     Boxes-specific coloring rules
srs.js                simplified SM-2 scheduler (initCard/reviewCard/isDue)
tiny-segmenter.js     vendored Japanese segmenter
flashcards-vocab.js   GENERATED deck data (do not edit)
boxes-data.js         GENERATED 1-2-3 Boxes data (do not edit)
content/*.json|csv|md human-editable sources for the builders
scripts/build-*.js    data builders (Node)
scripts/check.js      the gate command
tickets/              local markdown ticket backlog (one file per ticket)
docs/specs/           specifications that authorize branch work
assets/               shared theme/i18n/langs/store/vocab (UI branch)
data/<lang>/vocab.js  per-language deck modules (language branches)
memory-bank/          durable project context for AI sessions
```

## 5. How to run

```bash
# Serve locally (any static server; direct file:// also works)
python -m http.server 8000
# then open http://localhost:8000

# Rebuild generated data after editing sources
node scripts/build-flashcards-vocab.js
node scripts/build-boxes-data.js
node scripts/build-common-kanji.js      # needs network (kanjiapi.dev)

# The gate (run before committing)
node scripts/check.js
```

## 6. Conventions

- **Vanilla only.** No framework, bundler, or runtime dependency without an
  admitting ADR (`DECISIONS.md`).
- **Generated files are never hand-edited.** Edit the source in `content/`, run
  the builder, commit both. Generated files say so at the top.
- **Stable ids.** SRS keys must not be derived from array position (see
  `tickets/T-061.md`).
- **Trust boundaries:** anything read from `localStorage` is untrusted input —
  parse through the safe storage helper, never a bare `JSON.parse`.
- **Accessibility is not optional.** Interactive controls are real
  buttons/links, keyboard operable, with names and visible focus.
- **Ponytail applies.** This repo prefers deletion over addition; the shortest
  working diff wins once the problem is understood.
- **Docs ship in the same commit as the work.** Stale docs are findings.

## 7. Non-goals for this stage

- No backend, accounts, or cloud sync (progress lives in `localStorage`).
- No native mobile app.
- No server-side rendering or SPA framework.
- No full 2,500-word dataset for non-Japanese languages yet (starters only).
- No paid/closed data sources without recorded licensing.

## 8. Domain glossary

- **Deck**: the ordered list of vocabulary items a learner studies.
- **Target language**: the language being learned (`sqwease-target-lang`).
- **UI locale**: the language of the interface chrome (`sqwease-ui-locale`).
  _Avoid_: "language" unqualified.
- **Token**: one unit of a Japanese sentence (kanji/kana span) with `ja`, `kana`,
  `romaji`, `en`, `start`, `end`; the unit of coloring and alignment.
- **SRS**: spaced-repetition scheduler; `srs.js`, ratings 1-4, state
  new/learning/review.
- **Coloring**: mapping a token's first romaji syllable to a Gojuon-row color so
  JA/romaji/EN reveal their alignment. _Avoid_: "highlighting".
- **Gate**: `node scripts/check.js`, the one command that must pass.
- **Ponytail**: the project's laziness discipline (YAGNI, stdlib/native first,
  deletion over addition).
