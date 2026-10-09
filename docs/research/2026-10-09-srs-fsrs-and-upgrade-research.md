# Research: SRS → FSRS, and a general upgrade pass for SQWease

| Field | Value |
|-------|-------|
| Date | 2026-10-09 |
| Author | AI research pass (Perplexica + primary sources) |
| Status | Findings; recommendations below are candidates, not commitments |
| Related | `memory-bank/srs-status.md`, `ROADMAP.md`, tickets T-009, T-010, T-061, T-085, T-096+ |

> **Provenance.** The breadth scan was done with the Perplexica MCP
> (`perplexica_research`). Because Perplexica's synthesis was noisy and its
> quick/academic tools failed (see the companion evaluation), every load-bearing
> claim below is cross-checked against a primary source (linked in §7). Claims
> that come only from Perplexica are marked **[P]**.

## 1. Scope and method

Two questions:

- **A.** Should SQWease move from its simplified SM-2 scheduler to **FSRS**, and
  if so how — given the project's constraints (static site, no runtime deps,
  `file://` support, `localStorage`)?
- **B.** What is the next tier of upgrades for the product overall?

Method: 3 `perplexica_research` queries (FSRS vs SM-2; language-app best
practices; PWA/offline) plus attempted `perplexica_web_search` and
`perplexica_academic_search`, then verification against the FSRS project repos,
the fsrs4anki/awesome-fsrs docs, and MDN. Queries and timings are recorded in
`docs/research/2026-10-09-perplexica-evaluation.md`.

## 2. Current state of SQWease SRS

- `srs.js` implements a **simplified SM-2**: four ratings (Again/Hard/Good/Easy),
  learning steps `[1, 10]` min, graduating interval 1 day, ease factor ≥1.3.
- Known defects already ticketed: uncapped intervals/ease (T-009), locale day
  keys (T-010), ids derived from array position/content (T-061), and a shared
  per-day new-card budget across languages (T-085).
- Data lives in `localStorage` under `sqwease-*-srs`; no review-log schema beyond
  the per-card fields.

**Implication:** before any FSRS migration, T-009/T-010/T-061/T-085 must be
closed — they are exactly the foundations FSRS needs (stable ids, sane date
math, real logging).

## 3. What FSRS is, and how it differs from SM-2

FSRS (**Free Spaced Repetition Scheduler**) is an open, data-driven scheduler
based on the **DSR model** — **D**ifficulty, **S**tability, **R**etrievability —
descended from MaiMemo's DHP model and Piotr Woźniak's three-component memory
model [fsrs-free-repo]. It is now built into Anki (23.10+) and has SDKs in many
languages [fsrs4anki, awesome-fsrs].

| Dimension | SM-2 (SQWease today) | FSRS-6 |
|---|---|---|
| Model | heuristic rules over ratings | statistical DSR memory model |
| Parameters | fixed constants | ~21 trainable weights (defaults shipped) |
| Interval logic | `interval * ease`, ease nudged ±0.15 | predicted stability × desired retention |
| User control | implicit | explicit **desired retention** (workload vs recall) |
| Fuzz | none | optional deterministic fuzz |
| Optimizer | none | optional; fits weights to your review log |
| "Free" | n/a | supports reviewing early/late and adapts [fsrs-free-repo] |

Community consensus and the FSRS docs claim FSRS predicts the forgetting curve
more accurately than SM-2 and is a drop-in replacement at the **rating** level
(same Again/Hard/Good/Easy input) [fsrs4anki][revu **[P]**]. This is plausible
and widely adopted, but note: the strong "more accurate" claims are mostly from
the FSRS project's own material and vendor glossaries, not independent RCTs
**[P, low-confidence]**. Treat the win as "better model + tunable workload", not
as a proven retention guarantee.

**Language-learning-specific alternative.** Duolingo's **HLR** (Half-Life
Regression) is an SRS model built specifically for second-language acquisition
and is a legitimate alternative to FSRS for a vocabulary app [awesome-fsrs →
Duolingo HLR]. Worth a short spike (§5, T-099) before locking in FSRS.

## 4. Implementation options for a vanilla, dependency-free, `file://` app

| Option | What it is | Fit for SQWease |
|---|---|---|
| **ts-fsrs** | official TypeScript FSRS-6 scheduler (`fsrs()`, `createEmptyCard()`, `scheduler.repeat()`, `scheduler.next()`); widely used client-side by language apps (Jolito, Jiaci, LinGoat, Read Frog) [ts-fsrs][awesome-fsrs] | Best correctness; but it is an ESM/TS package (Node ≥20 tooling, optimizer via a WASI binding). Needs a build/vendor step — conflicts with ADR-001's "no build". |
| **fsrs-rs / fsrs-browser** | Rust core, also compiled to WASM for the browser [fsrs-free-repo] | Powerful (scheduler + optimizer), but WASM + `file://` + no-build is awkward. |
| **Self-contained JS port** | "Implementing FSRS in 100 Lines" write-up + the published algorithm wiki [borretti][fsrs-algorithm] | Fits ADR-001: ~150–250 lines, no dependency, works from `file://`, fully auditable. Risk: re-implementation drift; mitigate with a golden-vector test against ts-fsrs/py-fsrs. |
| **Vendored prebuilt bundle** | Commit a small UMD/IIFE build of ts-fsrs | Compromise: exact upstream math, still no runtime download; adds a vendored artifact to maintain. |

**Recommended approach:** ship a **self-contained `fsrs.js` (or a vendored
prebuilt)** behind a scheduler interface, with a **golden-vector test** generated
from `py-fsrs`/`ts-fsrs` so parity is checkable. Keep `srs.js` (SM-2) as a
fallback for decks whose cards have no FSRS state.

### 4.1 Scheduler state and config that matter

- **DSR card state:** stability, difficulty, state (`new/learning/review/
  relearning`), due, last-review, reps/lapses — richer than SQWease's current
  `{state, due, interval, easeFactor, reps, lapses}`.
- **Desired retention (R):** the main user-facing knob; higher R = more reviews
  [fsrs4anki-opt **[P]**].
- **`maximum_interval`** and **`enable_fuzz`** are real MySummaries-produced
  config examples (`maximum_interval: 365`, `enable_fuzz: true`) [awesome-fsrs].
- **`enable_short_term`** toggle (sub-day steps vs day-granular) [awesome-fsrs].
- **Optimizer** fits the ~21 weights from review logs; browser-capable via the
  `@open-spaced-repetition/binding` WASI package [ts-fsrs]. **SQWease has no
  review-log volume yet**, so v1 should use the **default FSRS-6 weights** and
  add the optimizer later.

### 4.2 Migration plan (phased, reversible)

1. **Foundations (must precede FSRS):** close T-009 (interval/ease caps), T-010
   (ISO day keys), T-061 (stable ids), T-085 (per-language counters).
2. **Add a review log** per card (rating + timestamp + prior state) so an
   optimizer is possible later.
3. **Introduce a scheduler interface** (`initCard/reviewCard/isDue/
   getIntervalDisplay`) with two implementations; add `fsrs.js`.
4. **Shadow mode:** compute both SM-2 and FSRS schedules; persist FSRS state but
   keep serving SM-2 until a golden-vector + spot-check comparison passes.
5. **Switch default to FSRS**, keep SM-2 for cards lacking FSRS state; expose
   desired-retention + maximum-interval settings.
6. **Later:** optimizer once ~thousands of reviews exist; deterministic fuzz.

### 4.3 Risks

- **No optimizer on day one** — FSRS with default weights is still fine, but the
  headline personalization arrives only with the optimizer.
- **State migration** — old `{interval, easeFactor}` cards must map to DSR
  defaults without losing due dates.
- **Build/tooling tension** — ts-fsrs's ESM/WASI path vs ADR-001; the
  self-contained port avoids it but must be parity-tested.
- **Timezone/DST** — compute in a single timezone; reuse the T-010 fix.
- **Over-claiming** — do not promise retention gains the data does not yet show.

## 5. General upgrade pass — recommended next tier

Ordered by value-per-effort for this project. Maps onto `ROADMAP.md` Stage 1.

1. **Audio pronunciation (TTS) — Web Speech API.** `SpeechSynthesis` (and
   on-device `SpeechRecognition`) are browser-native, require no server, and back
   the exact "hear the word" feature language apps ship [mdn-web-speech].
   Caveats: voice availability/latency varies by OS/browser; provide a graceful
   fallback and cache where possible. (Jolito and Jiaci pre-cache neural audio
   server-side [awesome-fsrs]; out of scope for a no-backend v1.)
2. **PWA / offline (T-098).** Service worker + manifest + IndexedDB makes the
   static app installable and offline-first [perplexica-pwa **[P]**; MDN for
   mechanics]. **Constraint:** service workers need HTTPS (or localhost), so
   `file://` would remain the no-SW path — keep both. IndexedDB can replace/augment
   `localStorage` for larger review logs.
3. **Full 2,500-word datasets + native review** (already on the roadmap): FSRS's
   benefit scales with review volume; this is the real product unlock.
4. **Comprehensible input / sentence mining (T-101).** Best-practice sources
   stress contextual example sentences + multimodal (image + audio) over isolated
   word lists [perplexica-upgrade **[P]**; WordCraft paper]. SQWease already has
   example sentences and token data — the gap is images and audio.
5. **Images.** The roadmap's "image association" is the largest content lift
   (sourcing, licensing, lazy loading); start with a small high-frequency set.
6. **Language-specific scheduling (T-099).** Evaluate Duolingo **HLR** vs FSRS
   for vocabulary; HLR is purpose-built for L2 learning [awesome-fsrs].
7. **Light gamification.** Streaks/achievements can lift engagement but are
   explicitly post-MVP; avoid Duolingo-style bloat (Jolito markets against it
   [awesome-fsrs]).
8. **Analytics / retention dashboard** — needs the review log from §4.2.

## 6. Concrete recommendations

| # | Recommendation | Ticket |
|---|---|---|
| 1 | Close SRS foundations (T-009/T-010/T-061/T-085) before FSRS | existing |
| 2 | Adopt FSRS-6 via a self-contained/vendored scheduler with golden-vector parity tests | **T-096** |
| 3 | Add a per-card review log (enables analytics + optimizer) | **T-096** (subtask) |
| 4 | Add Web Speech API pronunciation with fallback | **T-097** |
| 5 | PWA/offline (manifest + service worker + IndexedDB), HTTPS-only, keep `file://` path | **T-098** |
| 6 | Spike HLR vs FSRS for language-specific scheduling | **T-099** |
| 7 | Add FSRS optimizer once review volume exists | **T-100** |
| 8 | Multimodal comprehensible input (images + audio next to sentences) | **T-101** |

**Bottom line:** FSRS is a well-supported, worthwhile upgrade *after* the SRS
foundations are fixed; adopt it with default weights first and a parity test, and
keep SM-2 as a fallback. The broader product win is not the scheduler — it is
audio, images, offline, and full reviewed datasets layered on the working
multi-language shell.

## 7. Sources

**Primary (fetched directly):**
- FSRS principle / DSR model, "free" meaning — `open-spaced-repetition/free-spaced-repetition-scheduler` README.
- Scheduler API + optimizer package — `open-spaced-repetition/ts-fsrs` README.
- FSRS4Anki intro + research links — `open-spaced-repetition/fsrs4anki` README.
- Implementations, apps (Jolito/Jiaci/LinGoat/Read Frog/MySummaries), HLR, and
  the "Implementing FSRS in 100 Lines" pointer — `open-spaced-repetition/awesome-fsrs` README.
- Scheduler/recognition interfaces + browser caveats — MDN Web Speech API.

**Perplexica [P]** (see the evaluation for caveats): FSRS-vs-SM-2 synthesis;
language-app best practices; PWA/offline synthesis. Sources were noisy and
include acronym collisions (SAM.gov "FSRS", FSR shift-registers, Best Buy,
Progressive Insurance, and LHC/ATLAS papers), which is why no load-bearing claim
rests on them alone.

**Not independently verified:** specific retention-percentage gains from FSRS,
and the claim that migrating is risk-free — both are vendor/project claims.
