# Spanish deck (`es`)

Frequency-ranked Spanish vocabulary: **2,500 words, all UNREVIEWED** — a native
speaker must review before this leaves "starter" status. This replaces the earlier
30-word starter list.

## Files

- `source.tsv` — the human-editable source (tab-separated, 2,500 data rows).
- `../../data/es/vocab.js` — generated; do not edit by hand.

## Columns

`rank  word  reading  pos  english  example  example_english`

- `rank` — strictly increasing, 1..2500, frequency order from the source corpus.
- `word` — lowercased surface form from the frequency corpus (so it includes
  inflected verbs and plurals, not only dictionary lemmas).
- `reading` — IPA pronunciation hint from Wiktionary (via kaikki), with the
  surrounding slashes/brackets removed. When the extract had no IPA for a word the
  field falls back to the word itself (Spanish orthography is largely phonemic).
- `pos` — part of speech (noun, verb, adj, adv, pron, det, prep, conj, interj, num).
- `english` — English gloss (see provenance below).
- `example` / `example_english` — a Tatoeba sentence containing the word and (when
  available) its English translation.

## Sources

1. **Frequency list** — Hermit Dave `FrequencyWords`, Spanish 50k
   (`content/2018/es/es_50k.txt`), downloaded 2026-10-09.
   URL: `https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt`
   Derived from the **OpenSubtitles2018** corpus (OPUS).
   License: code MIT; **content CC BY-SA 4.0**.
2. **Pronunciation + cross-check** — Wiktextract / kaikki.org machine-readable
   Spanish dictionary (`kaikki.org-dictionary-Spanish.jsonl.gz`), downloaded
   2026-10-09. Extracted from the English Wiktionary dump dated 2026-09-02
   (kaikki extraction 2026-10-03) with Wiktextract.
   URL: `https://kaikki.org/dictionary/Spanish/kaikki.org-dictionary-Spanish.jsonl.gz`
   License: Wiktionary content is **CC BY-SA 3.0 / GFDL**.
3. **Examples** — Tatoeba weekly exports, downloaded 2026-10-09.
   URLs:
   - `https://downloads.tatoeba.org/exports/links.tar.bz2`
   - `https://downloads.tatoeba.org/exports/per_language/spa/spa_sentences.tsv.bz2`
   - `https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2`
   License: **CC BY 2.0 FR** (some sentences CC0 1.0).

## How each field was produced

- **`english` + `pos`** — the English gloss and part of speech were **written by
  the agent (machine-translated, UNREVIEWED)** for all 2,500 words, using the
  kaikki/Wiktionary Spanish definitions as a cross-check. They were **not** copied
  from a curated human bilingual dictionary, so treat them as machine translation:
  accurate for common words, but a native reviewer must confirm sense, register,
  and the primary reading of polysemous words.
- **`reading`** — taken from the Wiktionary IPA in the kaikki extract where present
  (**~2,091 / 2,500 words**); for the remaining **409** words no IPA was available,
  so the field is the word itself.
- **`example` / `example_english`** — automatically selected from Tatoeba: the
  shortest Spanish sentence (10–100 characters) that contains the headword as a
  whole token, preferring a sentence that already has an English translation.
  Sentences are real Tatoeba data, but they are **unreviewed** and may illustrate a
  different sense of the word than the gloss.

## Filtering

From `es_50k.txt`: keep tokens matching Unicode letters only
(`^[^\W\d_]+$`), length ≥ 2, dedupe, then keep the top 2,500 tokens that have an
entry in the kaikki Spanish extract. This drops digits, punctuation, single
letters, and proper nouns / English words that are absent from the Spanish
Wiktionary (e.g. `john`, `sam`, `the`). Three tokens that *do* have Spanish
Wiktionary entries were dropped by hand because they are English given names
(`bob`, `tony`, `charles`); the next three frequency-ranked valid words fill their
place. A small number of names / proper nouns with Wiktionary entries remain
(e.g. `maría`, `parís`, `california`).

## Coverage

- Words total: **2,500**
- With `english`: **100.0%** (2,500)
- With `reading`: **100.0%** (2,500) — of which **83.6%** are sourced Wiktionary IPA
  and **16.4%** fall back to the word itself
- With `pos`: **100.0%** (2,500)
- With `example`: **99.4%** (2,486)
- With `example` **and** `example_english`: **99.1%** (2,477)

## UNREVIEWED — needs native-speaker review

Every English gloss and example in this deck is machine-produced and has **not**
been checked by a native speaker. Do not treat it as reviewed content.

## Rebuild

```bash
node scripts/build-lang-vocab.js es
```

The build is deterministic (stable ids `es-0001…`, same input → byte-identical
output on the same day).

## Review checklist

- [ ] Native-speaker pass over the English glosses (sense, register, primary reading).
- [ ] Confirm `reading` convention (IPA, with per-word fallback) is acceptable.
- [ ] Spot-check Tatoeba examples for sense fit and length.
- [ ] Decide whether to reduce surface forms toward lemmas.
