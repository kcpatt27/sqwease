# Evaluation: how effective was Perplexica for this research pass?

| Field | Value |
|-------|-------|
| Date | 2026-10-09 |
| Backend | Perplexica MCP (SearxNG + Ollama, Docker) |
| Task | FSRS/SRS research + general upgrade research for SQWease |
| Companion | `docs/research/2026-10-09-srs-fsrs-and-upgrade-research.md` |
| Verdict | **Partially helpful** — good for breadth/orientation, unreliable for facts, slow, and 5 of 8 calls failed |

## 1. Environment at call time

`perplexica_health` reported:

- `ready (direct): true`, `backendReady: true`, `docker: true`, all three
  containers up, `searxng: reachable=true returnsResults=true`.
- **`ollama chat = qwen3.5:4b` → `installed=true, usable=false`** (ping timed
  out; "likely cold-starting").
- **`ollama embed = nomic-embed-text:latest` → `installed=true, usable=false`**
  (Ollama rejected it: "The operation was aborted due to timeout").
- Backend API is `legacy`.

The health check's `ready=true` did **not** mean "the tools work": the quick path
and the academic path both depend on the Ollama models, and both failed.

## 2. Tool-by-tool results

| # | Tool | Query (short) | Time | Result |
|---|------|---------------|------|--------|
| 1 | `perplexica_research` | FSRS vs SM-2 | **214.5 s** | ✅ success |
| 2 | `perplexica_research` | language-app best practices | **101.9 s** | ✅ success |
| 3 | `perplexica_academic_search` | spaced repetition scheduling | **120.0 s** | ❌ timeout |
| 4 | `perplexica_web_search` | ts-fsrs library | **45.0 s** | ❌ timeout |
| 5 | `perplexica_web_search` | Web Speech API | **45.0 s** | ❌ timeout |
| 6 | `perplexica_web_search` | ts-fsrs (retry) | **45.0 s** | ❌ timeout |
| 7 | `perplexica_academic_search` | spaced repetition (retry) | **120.0 s** | ❌ timeout |
| 8 | `perplexica_research` | PWA/offline | **100.6 s** | ✅ success |

**Score: 3/8 succeeded.** The deep `research` tool worked every time (3/3); the
"fast" `web_search` (0/3) and `academic_search` (0/2) never worked, even on
retry. Failures returned clear, non-hanging errors naming the stage and elapsed
ms — that part of the design is good.

## 3. Quality of the successful runs

### Strengths
- **Cited output.** Every answer came back with a numbered source list and
  inline `[n]` citations, which made verification straightforward.
- **Useful starting points.** It surfaced sources I would not have found quickly:
  the Southern Adventist MSc thesis on a Japanese SRS + AI voice app, the FSRS
  JS ecosystem, and the `awesome-fsrs` app list.
- **Self-filtering.** The synthesis explicitly noted and excluded off-topic
  snippets ("sources regarding political conventions, particle physics, retail
  stores … were not applicable"), so the prose stayed usable even when retrieval
  was noisy.
- **Structured.** Answers arrived as headed sections + a comparison table, ready
  to adapt.

### Weaknesses
- **Retrieval noise (~40–60% junk).** The FSRS query pulled SAM.gov "FSRS"
  subaward pages and FSR (feedback shift register) papers. The "best practices"
  query pulled **Best Buy** (3 sources), a **Republican convention** article, and
  **LHC/ATLAS** physics papers. The PWA query pulled **Progressive Insurance**
  (5 sources) and more physics. Root cause: SearxNG keyword collision on
  "FSRS"/"Best"/"Progressive" with no semantic gate (the embed model was down).
- **Generic synthesis.** Once the noise is removed, the remaining claims are
  broad and mostly restate the cited pages; there was little synthesis value-add
  over just reading the top sources.
- **No academic results.** With the embedding model failing, `academic_search`
  never ran, so the FSRS papers were only reachable by fetching the repos
  directly.
- **Slow.** The only working tool averaged **~139 s** (100–215 s). That is fine
  for a background pass, painful for interactive research.
- **Misleading readiness.** `health` said ready/backendReady while half the
  tools were dead; the `help` playbook claims web_search works when `ready=true`.
- **Acronym/name collisions** require defensive query phrasing, which the tool
  does not warn about.

## 4. Did it help the actual deliverable?

| Research need | Perplexica contribution | Primary source needed? |
|---|---|---|
| What FSRS is / DSR model | ✅ good summary | repo confirmed |
| FSRS vs SM-2 differences | ✅ usable table | vendor claims unverified |
| JS/browser implementations | ⚠️ partial (ts-fsrs, Rust, Py; not the JS-how) | ✅ `ts-fsrs`, `awesome-fsrs` |
| Migration mechanics | ✅ directional (ratings in, log out) | ✅ my own analysis |
| Language-app best practices | ⚠️ generic + noisy | ⚠️ windowed by relevance |
| PWA/offline mechanics | ✅ generic (SW + IndexedDB + manifest) | ✅ MDN |
| Audio/TTS feasibility | ❌ (query timed out) | ✅ MDN Web Speech API |

**Net:** it accelerated *orientation* and *source discovery*; it did not deliver
authoritative facts, and it could not answer the two quick factual questions at
all. Roughly: **7/10 for "get me started", 3/10 for "authoritative", 2/10 for
"fast"** → **partial**.

## 5. Recommendations for using Perplexica here

1. **Fix the models first.** Pull/keep-alive the chat model and
   `ollama pull nomic-embed-text` + set `OLLAMA_EMBED_MODEL` (the health hint
   says exactly this). Until then, `web_search` and `academic_search` are dead.
2. **Prefer `perplexica_research`** while `web_search` is broken; budget ~2–4
   minutes per query.
3. **Write collision-resistant queries** — add qualifiers
   ("FSRS spaced-repetition scheduler, not shift registers").
4. **Treat every claim as a lead, never a fact.** Fetch the primary source
   before it enters a report (which is what was done here).
5. **Report readiness honestly** downstream: do not trust `ready=true`; check the
   per-tool path you intend to use.

## 6. Bottom line

Perplexica was **helpful as a breadth-first scout and citation source**, and its
failure modes are honest (clear errors, no hangs). But in this environment it was
**too slow, too noisy, and half-broken** to be a primary research tool; the
report's load-bearing claims were all verified against primary sources. Fix the
Ollama chat/embed models and tighten retrieval, and it would move from "partial"
to "useful".
