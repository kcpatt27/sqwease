# SQWease — agent contract

*Short enough to actually be read. Stable; operator-owned. If an agent reads only
this file, it should follow the project's discipline.*

## Read order

`PROJECT_CONTEXT.md` → `ARCHITECTURE.md` → `ROADMAP.md` → `DECISIONS.md`, then the
relevant `docs/specs/*` and `tickets/*`. Grep every caller of anything you touch
before editing it.

## Build discipline

### Before writing code

1. Find the owning ticket in `tickets/` (or write one). Confirm the spec it
   belongs to in `docs/specs/`.
2. Understand the whole flow first (ponytail: read fully, then be lazy). Grep
   callers; trace data end to end.
3. One seam at a time — never widen scope beyond the ticket.

### While building

- **Vanilla only.** No runtime dependency without an admitting ADR.
- **Never hand-edit generated files** (`flashcards-vocab.js`, `boxes-data.js`,
  `content/common-kanji.js`, `data/<lang>/vocab.js`). Edit `content/` and rebuild.
- **Guard untrusted input.** Anything from `localStorage` goes through the safe
  store helper, never a bare `JSON.parse`.
- **Accessibility basics are never simplified away**: real buttons/links,
  keyboard operable, names, visible focus.
- **Ponytail applies**: prefer deletion, the standard library, and native
  platform features. Mark deliberate shortfalls with a `ponytail:` comment.
- **Keep `file://` working**: core data is `<script>`-loaded, never `fetch()`ed.
- Color rules: generic → `syllable-color.js`; Boxes-only → `boxes-coloring.js`;
  particles → `romaji.js`. Do not add Boxes data to the shared lists.

### Before committing

- **Gate:** `node scripts/check.js` — no exceptions, must be green.
- **Docs in the same commit:** flip the ticket's `status`/evidence; update
  `ROADMAP.md` statuses with evidence; update `ARCHITECTURE.md` if a boundary,
  seam, or stub changed; add a `DECISIONS.md` ADR for any architectural choice or
  new dependency; refresh `README.md` status if the shipped surface changed.
- Scan for `ponytail:` markers and deferred work before finishing.

### After the milestone

- Session record: `Did / Left / Next / Evidence` (in the ticket or a handoff).
- Update `memory-bank/activeContext.md` + `progress.md`.

## What this project does NOT do

- No framework/bundler/npm runtime dependency.
- No backend, accounts, or server-side rendering.
- No hand-edited generated data.
- No pushing branches or opening PRs without the operator asking.
- No claiming a feature exists because a branch has it (say "on branch X").
- No percentages or metrics without a denominator and a run behind them.

## Where things live

- **Issue tracker:** local markdown, `tickets/` (index at `tickets/INDEX.md`).
- **Labels (frontmatter):** `severity` (critical/high/medium/low/nit),
  `priority` (P0–P3), `type` (bug, edge-case, a11y, i18n, responsive,
  performance, over-engineering, data, data-integrity, test, docs,
  maintainability, privacy, delete, shrink, yagni, nit), `area`, plus
  `related`/`blocks`.
- **Specs:** `docs/specs/`.
- **Sources:** `content/`. **Builders:** `scripts/`. **Gate:** `scripts/check.js`.
- **Durable context:** `memory-bank/`.
