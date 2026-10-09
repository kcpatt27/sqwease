# Korean deck (`ko`)

Frequency-ranked Korean vocabulary for the multi-language deck. **2,500 words —
UNREVIEWED — needs native-speaker review.**

`source.tsv` is the human-editable source; `../../data/ko/vocab.js` is generated
(`node scripts/build-lang-vocab.js ko`). Do not edit the generated file by hand.

## Files

- `source.tsv` — the human-editable source (tab-separated).
- `../../data/ko/vocab.js` — generated; do not edit by hand.

## Columns

`rank  word  reading  pos  english  example  example_english`

- `word` — the Hangul token exactly as it appears in the frequency corpus
  (whitespace-delimited eojeol, so inflected forms and particle-attached words
  such as `내가`, `있어요`, `집에` are included as-is).
- `reading` — Revised Romanization (RR), lower-case, no syllable separators.
- `pos` — part of speech where sourced; blank when unknown.
- `example` / `example_english` — intentionally blank (no clean, licensed
  example-sentence source was used; see "Coverage").

## Sources (all URLs fetched 2026-10-09)

1. **Frequency list — Hermit Dave FrequencyWords, Korean 2018 (`ko_50k.txt`)**
   - URL: `https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ko/ko_50k.txt`
   - `word<TAB>count`, 50,000 rows, derived from the OpenSubtitles2018 corpus.
   - License: content **CC BY-SA 4.0** (code MIT) — per the repo README.
   - Used for: word selection and ranking. 49,985 unique Hangul-containing
     tokens remain after filtering out number/symbol/letter-only rows; the top
     2,500 by frequency were taken.

2. **English glosses + Romanization — Wiktextract Korean extract (kaikki.org)**
   - URL: `https://kaikki.org/dictionary/Korean/kaikki.org-dictionary-Korean.jsonl` (~205 MB).
   - Source: English Wiktionary via the Wiktextract project.
   - License: Wiktionary text is **CC BY-SA** (3.0); the Wiktextract/kaikki.org
     extraction carries the same share-alike terms.
   - Used for: direct dictionary glosses, glosses of inflected forms via each
     entry's `forms` table (lemma → gloss), and 952 Romanizations.

3. **kengdic (evaluated, not used in the final glosses)**
   - URL: `https://raw.githubusercontent.com/garfieldnate/kengdic/master/kengdic.tsv`
   - License: **MPL 2.0 / LGPL 2.0+** (dual).
   - Its flat `surface → gloss` table selected non-dominant homograph senses
     (e.g. `가` → "border", `말` → "horse") and so was dropped in favour of
     Wiktionary + machine translation.

4. **Machine translation — Google Translate (unofficial public endpoint)**
   - Endpoint: `https://translate.googleapis.com/translate_a/single` (`sl=ko&tl=en`).
   - Used for glosses not covered by a clear Wiktionary entry. Output is raw,
     isolated-token machine translation and is **unreviewed**; context-sensitive
     function words are often wrong (e.g. `게` → "crab", `걸` → "girl").

Word-list, gloss and reading *content* from sources 1–2 is CC BY-SA; the derived
`source.tsv` / `data/ko/vocab.js` are therefore share-alike in that part.

## How the data was produced

1. Download `ko_50k.txt`; keep tokens containing ≥1 Hangul syllable; drop
   control chars, letter-only rows and single Latin letters; dedupe preserving
   frequency order; take the top 2,500.
2. Enrich from the Wiktextract Korean JSONL, stream-filtered to those headwords.
3. **Gloss selection.** A Wiktionary gloss is used only when the headword has a
   single content part-of-speech (this avoids the homograph mis-picks of a raw
   "first entry" rule). Inflected forms are mapped to their lemma when the lemma
   is itself a frequent word. Everything else falls back to Google Translate.
   95 high-frequency function words (`내가`, `게`, `걸`, `못`, `제` …) were then
   hand-corrected, because both automatic sources mishandle them.
4. **Romanization.** Wiktionary's `romanization` field/form is preferred (952
   words). The remaining 1,548 use a small deterministic Revised-Romanization
   script written for this pass. That script implements liaison, nasal
   assimilation, ㄹ-assimilation, palatalization and ㅎ-aspiration, and was
   validated against the 1,605 Wiktionary Romanizations available for the
   top-3,000 headwords: **96.6% exact agreement** (mismatches are almost all
   morpheme-boundary 하/히 forms where Wiktionary keeps the `h`). Readings are
   lower-cased and normalised to plain `a–z` (Wiktionary's non-standard
   apostrophes/hyphens, e.g. `chin'gu` → `chingu`, and stray `?`/leading `-`
   are removed).
5. Rebuild with the shared builder; verify no diff on rebuild, `node
   scripts/check.js` green, no duplicate `w`, Hangul intact.

## Coverage

| Field | Filled | Notes |
| --- | --- | --- |
| `word` | 2,500 / 2,500 (100%) | unique, Hangul |
| `english` | 2,500 / 2,500 (100%) | 635 (25.4%) dictionary-sourced, 1,865 (74.6%) MT/curated |
| `reading` | 2,500 / 2,500 (100%) | 952 (38.1%) Wiktionary, 1,548 (61.9%) derived RR |
| `pos` | 664 / 2,500 (26.6%) | Wiktionary-sourced only; blank elsewhere |
| `example` | 0 / 2,500 (0%) | no clean licensed sentence source used |

Gloss breakdown: Wiktionary direct 485, Wiktionary inflected-form→lemma 150,
hand-corrected 95, Google Translate 1,770.

## Known limitations

- The corpus is OpenSubtitles, so the list contains inflected verb endings,
  particle-attached forms and a few character names — not a lemma list.
  Glosses for inflected tokens describe the underlying lemma, not the exact
  surface grammar.
- The MT gloss tier (1,865 rows) is unreviewed and, for short ambiguous
  function words, is often inaccurate. Treat it as a placeholder.
- Romanization of 1,548 words is algorithmically derived (validated, not
  native-checked).

## Review checklist

- [ ] Native-speaker spot check (glosses, romanization, naturalness).
- [ ] Replace/fix the Google-Translate gloss tier, prioritising ranks < 500.
- [ ] Confirm Revised Romanization consistency (esp. derived rows).
- [ ] Accept/expand toward 5,000 words if a licensed bilingual source is added.

## Rebuild

```bash
node scripts/build-lang-vocab.js ko
node scripts/check.js
```
