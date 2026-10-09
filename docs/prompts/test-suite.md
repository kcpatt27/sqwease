# Next-session prompt: build the SQWease test suite (T-065)

Paste the block below into a fresh session to implement the test suite cold.
It is self-sufficient: it assumes no memory of prior sessions.

---

## Context

Repo: `C:\Users\kcpat\projects\personal-projects\sqwease` (static vanilla
HTML/CSS/JS language-learning app; no framework, no runtime dependencies, no
`package.json`; must keep working from `file://`).

There is **no test framework**. The only checks are:
- `romaji-test.js` / `run-romaji-test.js` — 7 duplicated kana cases.
- `scripts/check.js` — the gate: romaji smoke test + inline-script syntax +
  presence of the three Japanese generated data files (`node scripts/check.js`).

Recurring bugs (coloring drift, SRS interval overflow, CSV corruption, invalid
language decks) had no failing test.

## Decision to implement

**ADR-011** (`DECISIONS.md`): use Node's built-in test runner (`node --test`,
Node 18+) with `node:assert/strict`. Tests in `test/**/*.test.js`. Wire the suite
into `node scripts/check.js` so the gate is unchanged. **No third-party test
framework, no `package.json`, no `npm install`.**

## Task

On a new branch `test/suite` off `main`:

1. Add `test/` with one file per area:
   - `romaji.test.js` — shared case array; edge cases from T-015: orphan `ー`,
     `ヴ`/`ゔ`, `ティ`/`ファ`/`ウィ`/`シェ`, combining dakuten, sokuon before a
     vowel, ん + full-size ヤ; plus `isParticleToken`/`shouldColorToken`
     (T-016) and homophone kanji (蚊/野/屋/戸/藻/駄).
   - `srs.test.js` — state transitions, `getIntervalDisplay`, and the T-009/T-010
     fixes: assert no `RangeError` after many Easy ratings (interval/ease capped)
     and locale-independent ISO day keys.
   - `coloring.test.js` — `syllable-color.js` / `boxes-coloring.js` with a small
     `document` stub: `shouldColor` decisions, no empty colored `<span>`, the
     fixed JA↔EN fixtures (T-005/T-006), and palette contrast invariants (T-034).
     Prefer extracting a pure function over stubbing the DOM heavily.
   - `build-lang-vocab.test.js` — run `scripts/build-lang-vocab.js` on a small
     fixture TSV; assert stable ids (`<code>-0001`), dedupe, symbol filtering,
     deterministic output.
   - `decks.test.js` — every `data/<lang>/vocab.js` has ≥1 word, unique `w` and
     ids, strictly increasing ranks, and matches its `content/<code>/source.tsv`
     row count (T-106).
2. Update `scripts/check.js` to run `node --test test/` first (fail the gate on
   any failure), then the existing checks.
3. Keep the romaji case list in ONE place (T-023); remove the duplicated copy.
4. Run `node scripts/check.js` and confirm green. Then break one invariant
   locally (e.g. remove the SRS interval cap) and confirm the gate goes red, then
   revert.

## Constraints
- No runtime/third-party dependency; no `package.json`; keep `file://` working.
- Do not hand-edit generated data files.
- Docs in the same commit: flip `tickets/T-065.md` to done with evidence; note
  ADR-011 is implemented.
- Commit on `test/suite` only.

## Definition of done
- `node scripts/check.js` runs the unit suite and is the single gate.
- Each suite above exists and covers its listed cases.
- A deliberate break in a covered module makes the gate fail.
- `tickets/T-065.md` updated with evidence (test count + commit).
