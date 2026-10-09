# SPEC: Language Scaffolding — Plumbling and Dataset Acquisition

| Field | Value |
|-------|-------|
| Status | Approved for implementation |
| Applies to | `lang/spanish`, `lang/french`, `lang/korean`, `lang/mandarin` (each branched from `ui/intl-a11y-perf`) |
| Created | 2026-10-09 |
| Related | `SPEC-ui-intl-a11y-perf.md`, tickets T-003, T-004, T-047, T-049, T-061, T-070 |

This is the shared plan every language branch follows. It has two halves: **(A) the
config/UI plumbing** each branch must satisfy, and **(B) how to source, generate, and
validate a word dataset** — including the prompt workflow that produced the Japanese
data.

## A. Config / UI plumbing

### A.1 What already exists (from the UI branch)

| Concern | Module | Storage key |
|---------|--------|-------------|
| UI chrome strings | `assets/i18n.js` (`SqweaseI18n`) | `sqwease-ui-locale` |
| Target-language metadata | `assets/langs.js` (`SqweaseLangs`) | `sqwease-target-lang` |
| Deck loading | `assets/vocab.js` (`SqweaseVocab`) | — |
| Safe storage | `assets/store.js` (`SqweaseStore`) | `sqwease-*` |

`SqweaseLangs` already declares `ja, zh, es, fr, ko`. A branch does **not** edit
`langs.js` unless its metadata entry is missing/wrong — if it is, that is a one-line
data change, and it is the only core-adjacent file a branch may touch.

### A.2 What a branch adds (no other core edits)

```
data/<code>/vocab.js          # generated deck module (calls SqweaseVocab.provide)
content/<code>/source.tsv     # the human-editable source list (tab-separated)
content/<code>/README.md      # sources, licensing, how it was generated, review status
```

The shared `scripts/build-lang-vocab.js <code>` turns the source into the deck
module; a branch does not need its own builder.

### A.3 Deck contract (must hold)

```js
// data/<code>/vocab.js  (generated; do not hand-edit)
(function () {
  SqweaseVocab.provide('<code>', {
    lang: '<code>',             // must equal the folder name and the langs.js code
    version: 1,
    generatedAt: 'YYYY-MM-DD',
    words: [
      {
        id: '<code>-0001',      // STABLE. Never derive from array position (T-061).
        w: 'agua',              // the word/phrase in the target language
        p: 'AH-gwah',           // pronunciation hint (pinyin for zh, romanization, or '')
        d: 'water',             // English gloss (UI locale glosses are a later concern)
        s: 'Quiero agua, por favor.', // example sentence
        tokens: undefined       // optional; see A.5
      }
    ]
  });
})();
```

Setting `window.SQWEASE_VOCAB = deck` also works (`assets/vocab.js` accepts it),
but `provide` is preferred: it keys the deck by code and avoids clobbering when the
user switches languages.

The flashcards page also reads an optional English sentence field on tokens; keep the
existing `flashcards.html` shape (`w,p,d,s`) and only add fields.

### A.4 Build script requirements (learn from the Japanese bugs)

The shared builder already enforces these; keep it that way.

- **Quote-aware CSV parsing** — do not repeat `scripts/build-flashcards-vocab.js`
  (T-003). Handle `"..."`, doubled `""`, and commas inside fields.
- **No silent caps** — if truncating to N words, `console.warn` the omitted count.
- **Filter non-words** — drop symbols/punctuation and duplicate rows (T-027/T-028).
- **Deterministic output** — stable `id`s and ordering so SRS progress survives rebuilds
  (T-061).
- **Fail loudly** on missing/malformed source (T-064).
- `node scripts/build-lang-vocab.js <code>` must run with **zero npm dependencies**.

### A.5 Tokenization (optional, per language)

- Japanese uses `romaji.js` + `TinySegmenter` and the token schema in
  `content/README-tokenized.md`. Coloring is triggered only by tokens that contain kanji.
- Spanish/French: whitespace tokenization is sufficient; accent-bearing letters are
  fine. Coloring is optional and only if it maps to a teaching goal (see the language
  specs — default: **no color coding** for v0).
- Mandarin: words are not space-delimited; use a segmenter (jieba/pkuseg offline, or a
  shipped word list) if tokens are wanted. v0 may ship without tokens.
- Korean: whitespace-delimited; eojeol can be tokenized simply.

## B. Dataset acquisition

### B.1 How the Japanese dataset was produced (the template to copy)

1. **Frequency source.** Compiled `content/first-2500-words-for-fluency.txt` (and a
   broader `content/15000-japanese-words.txt`) from corpus/word-frequency references.
2. **Enrichment.** Each word expanded to four columns — `word, pronunciation, definition,
   example` — into `content/japanese-fluency-vocab.csv` (2,507 rows).
3. **Build.** `scripts/build-flashcards-vocab.js` turned the CSV into
   `flashcards-vocab.js` (1,500 items; the 1,500 cap is a bug, see T-003).
4. **Examples/context.** `content/boxes-config.json` + `content/boxes-words.json` drive
   the 1-2-3 Boxes sentences; `content/boxes-tokenized.json` holds hand-tokenized
   sentences produced in `editor.html`.
5. **Iteration.** The known back-and-forth was: (a) getting the model to emit a clean,
   machine-parseable table, (b) fixing separator/quoting drift, (c) romanization
   consistency, (d) keeping translations natural rather than literal. The prompt template
   in B.3 front-loads those constraints.

**Lessons encoded as rules:**
- Never let the model use commas inside unquoted fields — require CSV quoting or TSV.
- Fix the romanization/reading convention up front (T-049).
- Ask for exactly the columns the builder expects, in order, with a header row.
- Validate row count, dedupe, and check for truncation before building (T-003, T-027).
- Native review is required before a language leaves "starter" status.

### B.2 Sources by language (starting points to evaluate)

| Language | Frequency sources to evaluate | Reading field |
|----------|-------------------------------|---------------|
| Spanish | `wordfreq`, SUBTLEX-ESP, OpenSubtitles frequency, Wiktionary frequency lists | accent-aware hint or IPA-lite |
| French | `wordfreq`, SUBTLEX-FR, OpenSubtitles, Lexique 3 | accent-aware hint or IPA-lite |
| Korean | `wordfreq`, Sejong corpus frequency lists, Korean OpenSubtitles | Revised Romanization |
| Mandarin | `wordfreq`, SUBTLEX-CH, HSK 1–6 lists, Tatoeba frequency | Pinyin (with tone marks) |

Record the chosen source, URL, license, and date in `content/<code>/README.md`.

### B.3 Reusable generation prompt (copy/paste, then iterate)

> You are compiling a frequency-ranked starter vocabulary list for a language-learning
> app. Target language: **{LANGUAGE}**. Produce the **top {N} most frequent,
> learner-relevant words** (daily conversational core; skip proper nouns, symbols, and
> single letters).
>
> Output **TSV** (tab-separated) with exactly this header and no extra prose:
>
> `rank<TAB>word<TAB>reading<TAB>pos<TAB>english<TAB>example<TAB>example_english`
>
> Rules:
> - `word`: the target-language word or fixed phrase.
> - `reading`: {READING_RULE} (for Spanish/French: a simple pronunciation hint; for
>   Korean: Revised Romanization; for Mandarin: Pinyin with tone marks).
> - `pos`: part of speech (`noun`, `verb`, `adj`, `adv`, `particle`, `phrase`, ...).
> - `english`: a short, natural English gloss (no leading article unless meaningful).
> - `example`: one short, natural sentence using the word.
> - `example_english`: its natural English translation (not literal).
> - Do not put tabs, newlines, or `|` inside fields. Escape or avoid commas.
> - Deduplicate by `word`. Keep `rank` strictly increasing.
> - Return CSV/TSV only — no markdown fences, no commentary.
>
> After the first batch, I will ask for corrections; keep the exact same column order.

Follow-up prompts that worked for Japanese (reuse as needed):
- "Ranks 51–100, same format."
- "Rows X–Y have a wrong reading/translation; return only the corrected rows."
- "Normalize all readings to the same convention."
- "Remove any row that is a symbol or a single letter; renumber ranks."

### B.4 Validation checklist (run before committing a dataset)

- [ ] Header/column count matches the builder's expectations exactly.
- [ ] Row count == requested N (or the omit count is logged and accepted).
- [ ] No duplicates by `word`; ranks strictly increasing.
- [ ] No symbols/punctuation/single Latin letters.
- [ ] Readings follow the single documented convention.
- [ ] Examples are short and grammatical; translations are natural.
- [ ] `node scripts/build-lang-vocab.js <code>` runs clean and is deterministic
  (same-day rebuild → no diff).
- [ ] `data/<code>/vocab.js` loads in the browser via `?lang=<code>` and renders.
- [ ] Native-speaker spot-check recorded in `content/<code>/README.md` (or explicitly
  marked "unreviewed starter").

### B.5 Starter scope for v0

Each language branch ships **25–50 words** as a functional starter (enough to prove the
pipeline end to end), the build script, the source file, and the README. Expanding to
2,500 words is follow-on work tracked per language. This keeps the branches small and
mergeable while satisfying "a starting version".

## C. Merge strategy

- Branch from `ui/intl-a11y-perf` after it stabilizes, or from `main` once it merges.
- A branch only **adds** files under `data/<code>/`, `content/<code>/`, `scripts/`, plus
  a `docs/` note. The sole possible shared edit is one `langs.js` entry, which merges
  trivially.
- Because core pages and assets are untouched, the four language branches do not conflict
  with each other or with future UI work.
- Bring a language to `main` by merging its branch; no rebase gymnastics required.
