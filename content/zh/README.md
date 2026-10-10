# Mandarin deck (`zh`)

Frequency-ranked Simplified Chinese vocabulary for the SQWease target language.
**2,500 words.**

> **UNREVIEWED — needs native-speaker review.** Every field below is sourced from
> an open, licensed dataset (no machine translation, no fabrication), but the
> readings, glosses, parts of speech and example sentences have not been checked
> by a native speaker.

## Files

- `source.tsv` — human-editable source (tab-separated), 2,500 rows.
- `enrich_source.py` — the sourcing pipeline that regenerates `source.tsv`
  (download → filter → enrich → emit) from the raw sources. Kept here (next to
  its output) because the sourcing task restricted writes to `content/zh/**` and
  `data/zh/**`.
- `../../data/zh/vocab.js` — generated; do not edit by hand.

## Columns

`rank  word  reading  pos  english  example  example_english` (header unchanged).

- `word` — Simplified Chinese (Han only).
- `reading` — **Pinyin with tone marks** (`shuǐ`, `nǐ hǎo`). Never passed through
  `Romaji.kanaToRomaji` (Japanese-only).
- `pos` — dominant part of speech, from a licensed tagged lexicon (blank when
  none). See *Provenance* below.
- `english` — first usable CC-CEDICT definition (a dictionary gloss, not MT).
- `example` / `example_english` — a short Tatoeba Mandarin–English sentence pair
  containing the word. Blank when no licensed pair exists.

## Sources (all fetched 2026-10-09)

| Role | Dataset | URL | Licence |
|---|---|---|---|
| Rank + headwords | FrequencyWords `zh_cn_50k` (Hermit Dave), tokenized from OpenSubtitles 2018 (OPUS) | <https://github.com/hermitdave/FrequencyWords> — `content/2018/zh_cn/zh_cn_50k.txt` | content **CC BY-SA 4.0** (code MIT) |
| Reading + gloss | CC-CEDICT (MDBG export, `cedict_1_0_ts_utf-8_mdbg`) | <https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz> | **CC BY-SA 4.0** |
| Single-char reading | Unihan `Unihan_Readings.txt` (`kMandarin`) | <https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip> | **Unicode License V3** |
| POS (primary) | kaikki.org / Wiktextract — Chinese extract (English Wiktionary) | <https://kaikki.org/dictionary/Chinese/kaikki.org-dictionary-Chinese.jsonl.gz> | **CC BY-SA 3.0** |
| POS (fallback / tie-break) | jieba `dict.txt` (`word freq pos`) | <https://raw.githubusercontent.com/fxsjy/jieba/master/jieba/dict.txt> | **MIT** |
| Examples | Tatoeba `cmn_sentences`, `eng_sentences`, `links` | <https://downloads.tatoeba.org/exports/> | **CC BY 2.0 FR** |

> **Licence note.** The derived `source.tsv` combines ShareAlike sources
> (CC BY-SA 4.0 + CC BY-SA 3.0) with CC BY 2.0 FR examples and MIT jieba tags.
> Redistribution must keep attribution for all datasets; the derived deck
> inherits ShareAlike for the FrequencyWords / CC-CEDICT / Wiktionary parts.

## How it was produced (`enrich_source.py`)

1. **Frequency.** Read `zh_cn_50k.txt`; keep all-Han tokens; convert each token
   to Simplified with CC-CEDICT's own `Traditional → Simplified` table and
   **merge** counts, so `說/说` and `這/这` do not split one word's frequency.
2. **Rank + select.** Rank by merged count (ties by first appearance). Scan until
   2,500 CC-CEDICT-matched words are found. Tokens absent from CC-CEDICT are
   **skipped, never guessed** (264 skipped). *The word set is frozen here.*
3. **Reading + gloss.** CC-CEDICT pinyin (`shui3`) → tone marks (`shuǐ`)
   (`u:`/`v` → `ü`, neutral tone unmarked). For single characters, Unihan
   `kMandarin` picks the common reading and the matching CC-CEDICT entry supplies
   the gloss.
4. **POS.** kaikki Chinese uses the **Traditional** form as its page title and
   emits the Simplified form only as a `soft-redirect`, so each kaikki entry is
   indexed by the Simplified form of its headword (via the same CC-CEDICT
   `trad → simp` table). Where kaikki gives **one** part of speech it wins; where
   it gives several, **jieba's** corpus-frequency tag breaks the tie when it is
   one of them; otherwise kaikki's most frequent is used. Words kaikki does not
   tag (mostly single Han characters, which Wiktionary files as `character`) fall
   back to jieba. Readable POS mapping: kaikki `particle→part`, `classifier→
   counter`, `intj→interj`, `proverb→phrase`, …; jieba `n→noun`, `v→verb`,
   `a/ad→adj`, `d→adv`, `r→pron`, `m→num`, `q→counter`, `p→prep`, `c→conj`,
   `u/ul/uj/ud/uv→part`, `b→adj` (区别词), `nrt/nr/ns/nt/nz→name`, `t/tg→noun`, ….
5. **Examples.** The 156,170 Tatoeba `cmn`↔`eng` sentence pairs are script-
   normalized to Simplified (same CC-CEDICT table — Tatoeba mixes scripts and
   the deck is Simplified), then for each deck word the shortest pair
   (2–40 Han chars, ≤100 English chars) that contains it is chosen, preferring a
   single occurrence. No pair → blank.
6. **No machine translation.** No translation endpoint is used anywhere; every
   non-blank field is copied from a licensed dictionary or corpus.

Deterministic: the same inputs reproduce a **byte-identical** `source.tsv`
(verified across two consecutive runs, see *Hill-climb*).

## Coverage

| Field | Filled | % | Provenance |
|---|---|---|---|
| `word` | 2500 / 2500 | 100.0% | FrequencyWords `zh_cn_50k` (CC BY-SA 4.0) |
| `reading` | 2500 / 2500 | 100.0% | CC-CEDICT pinyin → tone marks; single chars guided by Unihan `kMandarin`. 11 rows are neutral-tone (correctly unmarked). |
| `english` | 2500 / 2500 | 100.0% | **dictionary-only**: CC-CEDICT first usable definition. **0% machine translation.** |
| `pos` | 2493 / 2500 | 99.7% | kaikki 1338 (53.5%), kaikki+jieba tie-break 503 (20.1%), jieba 652 (26.1%); blank 7 (0.3%) |
| `example` + `example_english` | 2465 / 2500 | 98.6% | Tatoeba `cmn`↔`eng` pairs (CC BY 2.0 FR); blank 35 (1.4%) |

Single-character words: 624 of 2,500 (their POS almost always comes from jieba,
because Wiktionary tags single characters as `character`). CC-CEDICT match rate:
2,500 of 2,764 unique Simplified headwords scanned (264 skipped), 39,276 unique
Simplified tokens available in the 50k list.

## Hill-climb score

Score = `0.3·pos% + 0.3·(example+example_english)% + 0.2·reading% + 0.2·english%`
over the 2,500 rows.

| Iteration | reading | english | pos | example | Score |
|---|---|---|---|---|---|
| Baseline (`main`, merged deck `80f0a0f`) | 100.0% | 100.0% | 0.0% | 0.0% | 0.4000 |
| + kaikki POS indexed by Simplified + jieba fallback; + Tatoeba examples (≤30 / ≤90) | 100.0% | 100.0% | 99.3% | 98.5% | 0.9935 |
| + complete jieba tag map (`nrt`,`b`,`tg`,`ud`,`uv`,`rz`,`df` …) + relaxed example bounds (≤40 / ≤100) | 100.0% | 100.0% | 99.7% | 98.6% | **0.9950** |

Both targets are met (`pos` ≥ 95%, `example+example_english` ≥ 95%) and the
remaining gap is genuine source absence, not a tunable threshold.

## Known limitations

- **7 words have no sourced POS** (`pos` blank): `笵`, `试着`, `过得`, `扂`,
  `瞷`, `蟿`, `长得` — rare characters / colloquial compounds absent from both
  kaikki and jieba. Left blank rather than guessed.
- **35 words have no example** (`example` blank): mostly character names absent
  from the Tatoeba `cmn` corpus (`克莱尔`, `凯文`, `泰勒`, `莎拉`), military ranks
  (`上校`, `上尉`, `中尉`), and rare characters (`碞`, `笵`, `扂`, `瞷`, `蟿`, `癸`).
  Longer candidate sentences exist for a few (`弧`, `神父`) but their English
  translations run 230+ characters — excluded as poor flashcard examples.
- Examples are Tatoeba sentences **script-normalized to Simplified** with
  CC-CEDICT; the original may have been Traditional. Examples are not
  native-reviewed, and a short sentence often contains several deck words, so
  some examples repeat across rows.
- POS sense selection is automatic and imperfect: the dominant corpus/Wiktionary
  sense may differ from the sense of the CC-CEDICT gloss on multi-sense words.
  jieba's `b` → `adj` (区别词 / attributive-only) mapping is a judgment call.
- Sense selection for the CC-CEDICT gloss itself is unchanged from the previous
  deck: 120 of 2,500 headwords have multiple readings, and Simplified-merge
  characters (e.g. `里`, `后`) can take a less common sense.

## Reproduce

```bash
# downloads to %TEMP%/sqwease-zh-src on first run (~330 MB), then regenerates
# source.tsv (kaikki 155 MB + Tatoeba links 150 MB + eng sentences 25 MB)
python content/zh/enrich_source.py
node scripts/build-lang-vocab.js zh     # source.tsv -> data/zh/vocab.js
node scripts/check.js                   # the gate
```

`source.tsv` is deterministic (byte-identical across runs) given the fetched
sources; `data/zh/vocab.js` is deterministic given `source.tsv` (its
`generatedAt` stamp is the build date).

## Review checklist

- [ ] Native-speaker spot check (tones, natural translations, sense of homographs).
- [ ] Confirm tone marks render (`nǐ`, `shuǐ`, `lǜ`) and are not mangled.
- [ ] Fix the multi-reading / merge-character senses noted above.
- [ ] Fill the 7 missing POS and 35 missing examples, or accept them as blanks.
- [ ] Confirm `source.tsv` has no duplicate `word` and stable ids.
