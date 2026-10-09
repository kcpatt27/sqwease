# Mandarin deck (`zh`)

Frequency-ranked Mandarin vocabulary for the SQWease target language. **2,500 words.**

> **UNREVIEWED — needs native-speaker review.** Every field below is sourced, not
> invented, but the readings and glosses have not been checked by a native speaker.

## Files

- `source.tsv` — human-editable source (tab-separated), 2,500 rows.
- `enrich_source.py` — the sourcing pipeline that regenerates `source.tsv` from the
  raw sources. Kept here (next to its output) because the sourcing task restricted
  writes to `content/zh/**` and `data/zh/**`.
- `../data/zh/vocab.js` — generated; do not edit by hand.

## Columns

`rank  word  reading  pos  english  example  example_english`

- `word` — Simplified Chinese (Han only).
- `reading` — **Pinyin with tone marks** (`shuǐ`, `nǐ hǎo`). Never passed through
  `Romaji.kanaToRomaji` (Japanese-only).
- `english` — first usable CC-CEDICT definition.
- `pos`, `example`, `example_english` — left blank: no clean, licensed sentence
  source was used, so they are not guessed.

## Sources

| Source | URL | License | Fetched |
|---|---|---|---|
| FrequencyWords `zh_cn_50k` (Hermit Dave), tokenized from OpenSubtitles 2018 (OPUS) | https://github.com/hermitdave/FrequencyWords — `content/2018/zh_cn/zh_cn_50k.txt` | content **CC BY-SA 4.0** (code MIT) | 2026-10-09 |
| CC-CEDICT (MDBG export, `cedict_1_0_ts_utf-8_mdbg`) | https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz | **CC BY-SA 4.0** | 2026-10-09 |
| Unihan `Unihan_Readings.txt` (`kMandarin`) | https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip (UCD 2026-07-31) | **Unicode License V3** | 2026-10-09 |

The frequency list mixes Traditional and Simplified written forms (the corpus is not
script-normalized). Each token is converted to Simplified with CC-CEDICT's own
`Traditional -> Simplified` table and the counts are **merged** before ranking, so
`說/说` and `這/这` do not split one word's frequency.

## Reading + gloss method

- CC-CEDICT pinyin (`shui3`) is converted to tone marks (`shuǐ`); `u:`/`v` -> `ü`,
  neutral tone (5) unmarked.
- Single characters (624 of 2,500): **Unihan `kMandarin`** selects the common
  reading; the CC-CEDICT entry whose tone-marked pinyin matches supplies the gloss.
  This avoids CC-CEDICT's pinyin-alphabetical ordering picking rare senses
  (e.g. 都 `dū`/surname instead of `dōu`/"all").
- Among entries, preference is: matching reading > non-"variant of" gloss >
  non-proper-noun > non-onomatopoeia.
- Tokens absent from CC-CEDICT are **skipped, not guessed**.

## Coverage

- Words shipped: **2,500** (624 single-character, 1,876 multi-character).
- `reading`: 100% (2,500/2,500). `english`: 100% (2,500/2,500).
  `example`: 0% (intentionally blank).
- CC-CEDICT match rate: **90.5%** — 2,500 matched of 2,764 unique Simplified
  headwords scanned; **264 unmatched tokens skipped**. These are mostly transparent
  compounds CC-CEDICT does not list as entries (`很多`, `两个`, `一天`) and tokenizer
  bigrams (`这是`, `我要`, `我会`), plus a few rare textual variants (`什幺`, `裡`).
- 39,276 unique Simplified tokens were available in the 50k list.

## Caveats

- 120 of 2,500 headwords have **multiple CC-CEDICT readings**; the selected sense is
  the most common one, which may still need a native-speaker fix (e.g. `告诉` came
  out as "to press charges" rather than "to tell").
- Characters that Simplified merges from several Traditional forms can take the
  wrong sense (e.g. `里` = "unit of length" rather than "inside"; `后` = "empress"
  rather than "after"). Flagged by the unreviewed status.
- Proper nouns from the subtitle corpus (e.g. `凯文` "Kevin") are kept as-is.

## Rebuild

```bash
python content/zh/enrich_source.py      # regenerate source.tsv (downloads to temp)
node scripts/build-lang-vocab.js zh     # source.tsv -> data/zh/vocab.js
```

`source.tsv` is deterministic (byte-identical across runs) given the fetched
sources; `data/zh/vocab.js` is deterministic given `source.tsv`.

## Review checklist

- [ ] Native-speaker spot check (tones, natural translations, sense of homographs).
- [ ] Confirm tone marks render (`nǐ`, `shuǐ`, `lǜ`) and are not mangled.
- [ ] Fix the multi-reading/merge-character senses noted above.
- [ ] Optional: add `pos` and sentences from a licensed source (e.g. Tatoeba).
