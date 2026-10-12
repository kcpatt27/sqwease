# SQWease — ROADMAP

*The plan. Flip statuses in the same commit as the work; done items carry a date
and evidence. Estimates are honest, not padded. Status markers: **[DONE]**,
**[NEXT]**, **[ ]**.*

Long-horizon ladder: EASY → MEDIUM → HARD → VERY HARD → IMPOSSIBLE+ → VISION
COMPLETE.

Classes: **MVP** (required for the definition of done) / **P** (post-MVP) / **HA**
(high-assurance) / **R** (research). Complexity S / M / L.

Source of truth: `docs/specs/` (specs per branch) · Decisions: `DECISIONS.md` ·
Shipped surface: `README.md` · Backlog: `tickets/INDEX.md` (106 items).

## Stage 0 — EASY (conventional engineering)

| Item | Purpose | Deps | Complexity | Class | Status |
| --- | --- | --- | --- | --- | --- |
| Flashcard deck + flip UI | Core study surface | — | S | MVP | **[DONE]** (2025) |
| Frequency vocab pipeline | Editable → generated data | — | S | MVP | **[DONE]** (2025) |
| Simplified SM-2 SRS | Retention scheduling | deck | M | MVP | **[DONE]** (2026-02, `srs.js`) |
| 1-2-3 Boxes | Sentence-pattern practice | vocab | M | MVP | **[DONE]** (2026-02, `boxes.html`) |
| Tokenizer + token editor | Token-based coloring data | — | M | MVP | **[DONE]** (2026, `editor.html`) |
| Kana charts | Reference | — | S | P | **[DONE]** (2026, `kana-charts.html`) |
| Kanji list | Reference + personal list | — | S | P | **[DONE]** (2026, `kanji.html`) |
| Local ticket backlog + specs | Plan/discipline | — | S | MVP | **[DONE]** (2026-10-09, `tickets/`, `docs/specs/`) |
| Gate command | One runnable check | — | S | MVP | **[DONE]** (2026-10-09, `scripts/check.js`) |
| Multi-language UI shell | i18n + a11y + responsive + perf | — | M | MVP | **[DONE]** (2026-10-12, merged; Lighthouse a11y 1.0/0 failures ×6) |
| Full decks (es/fr/ko/zh, 2,500 words each) | Deliver the promise | UI shell | M | MVP | **[DONE]** (2026-10-12, merged; dict glosses + POS + examples; **unreviewed**) |
| Bug/edge-case fixes | Correctness | — | M | MVP | [ ] (T-001…T-020) |

### Test suite + native review **[NEXT]**
- **Purpose:** lock in correctness with real tests, and get the five decks reviewed.
- **Dependencies:** none.
- **Complexity:** M.
- **Threats introduced:** none (tests only), plus reviewer time.
- **Tests required:** `node scripts/check.js` runs the new `node --test` suite (T-065).
- **Acceptance:** the gate runs unit tests for romaji/SRS/coloring/builders/decks; each deck has a recorded native review (T-102).

## Stage 1 — MEDIUM (deliberate systems engineering)

| Item | Purpose | Deps | Complexity | Class | Status |
| --- | --- | --- | --- | --- | --- |
| Coloring correctness pass | Fix T-004…T-008, T-016, T-018 | token data | M | MVP | [ ] |
| Test coverage for romaji/coloring/SRS | Catch regressions | — | M | MVP | [ ] (T-065) |
| Full 2,500-word dataset per language | Deliver the promise | corpus choice | L | MVP | **[DONE]** (2026-10-12, es/fr/ko/zh merged; Japanese still 1,500 — T-003) |
| Native review of UI strings + decks | Language quality | datasets | M | MVP | [ ] |
| FSRS-6 scheduling | Better scheduling | T-009/010/061/085 | M | P | [ ] (T-096) |
| Duolingo HLR vs FSRS spike | Language-specific scheduling | — | S | R | [ ] (T-099) |
| Audio pronunciation (Web Speech API) | Comprehensive input | — | M | P | [ ] (T-097) |
| Offline kanji lookup | Remove API dependency | bundled data | S | P | [ ] (T-014) |
| Multimodal input (images + audio) | Comprehensive input | assets/CDN | L | P | [ ] (T-101) |
| PWA / offline | Travelers, offline study | service worker | M | P | [ ] (T-098) |
| FSRS parameter optimizer | Personalization | T-096 + review log | M | P | [ ] (T-100) |
| Build validation in the gate | No stale artifacts | builders | S | HA | [ ] (T-062, T-064) |

## Stage 2 — HARD (substantial engineering)

*Each item names failure modes and what gates it. Not scheduled; do not start
without a spec.*

- **H1 — Cross-device progress sync.** _Failure modes:_ auth, data loss,
  conflicts, privacy. _Gates:_ auth model + migration + backfill; a spec; an
  admitting ADR. Needs a backend. Class MVP.
- **H2 — Full data pipeline at scale (2,500 × N languages).** _Failure modes:_
  licensing, quality, build time, repo size. _Gates:_ recorded sources/licences,
  native review, a reproducible builder, size budget. Class MVP.
- **H3 — Adaptive difficulty / retention analytics.** _Failure modes:_ false
  confidence in noisy predictions. _Gates:_ enough review history; eval harness.
  Class P.

## Stage 3 — VERY HARD (architecture-defining)

| Item | What it buys | Prerequisite | Class |
| --- | --- | --- | --- |
| Backend + database | Accounts, sync, analytics | H1 spec + ADR | P |
| Speech recognition practice | Speaking feedback | audio pipeline | R |
| Community decks / sharing | Network effects | accounts + moderation | R |

## IMPOSSIBLE+

| Requirement | Why it cannot be guaranteed | Engineering approximation | Residual risk |
| --- | --- | --- | --- |
| "Fluent in 3 months" | Language acquisition depends on the learner | Frequency-first curriculum + SRS | Overpromise; keep messaging honest |
| Perfect romaji/color alignment for all sentences | NLP ambiguity | Heuristics + token data + fixtures | Some sentences remain uncolored (T-006/T-018) |
| 100% cross-device sync | Networks fail | Optimistic local-first + retry | Temporary divergence |

*Documented so they never become marketing copy.*

## VISION COMPLETE

A polished, accessible, multi-language web app where a learner can pick any
supported language, study the most common words with comprehensive input and
spaced repetition, track progress, and get correct, consistent rendering of the
target script — on any device, from any static host.

Capability checklist for "complete":

- [ ] ≥5 target languages with reviewed 2,500-word decks
- [ ] Cross-device progress
- [ ] Audio + images
- [ ] Correct coloring on reviewed fixtures
- [ ] WCAG 2.2 AA on every page, verified
- [ ] Offline/PWA

## Working order (pick list)

1. **[NEXT]** Land the test suite (T-065) and native review of the five decks (T-102).
2. Close the P0/P1 correctness tickets (T-001…T-020).
3. Coloring correctness pass + tests (T-005…T-008, T-065).
4. Full datasets + native review per language.
5. Then Stage 1 features (audio, PWA, offline kanji).

## Maintenance

Update statuses in the session that ships a milestone, with evidence (commit,
test count, or Lighthouse result). If an item was harder than listed, say so
rather than re-labelling it. Re-run `node scripts/check.js` and the docs honesty
pass when the shipped surface changes.
