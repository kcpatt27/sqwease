# Mandarin deck (`zh`)

Starter vocabulary for the Mandarin target language. **30 words, unreviewed** — a native
speaker must review before this leaves "starter" status.

## Files

- `source.tsv` — the human-editable source (tab-separated).
- `../data/zh/vocab.js` — generated; do not edit by hand.

## Columns

`rank  word  reading  pos  english  example  example_english`

- `word` is Simplified Chinese (Han).
- `reading` is **Pinyin with tone marks**. It must not be passed through
  `Romaji.kanaToRomaji` (that module is Japanese-only); this branch never calls it.

## Notes

- Chinese is not space-delimited. Each deck entry is a fixed word/phrase, so v0 needs no
  tokenizer. Sentence tokenization, if added later, should run an offline segmenter
  (jieba/pkuseg) at build time — never in the browser.
- Tone marks must survive the build and render (`nǐ`, `shuǐ`, ...).

## Sources

Starter list compiled from HSK 1 core vocabulary and common frequency lists. The full
2,500-word pass should draw from a proper frequency corpus — evaluate `wordfreq`
(Chinese), SUBTLEX-CH, HSK 1-6 lists, and Tatoeba frequency — and record the exact source,
URL, license, and date here.

## Rebuild

```bash
node scripts/build-lang-vocab.js zh
```

## Review checklist

- [ ] Native-speaker spot check (tones, natural translations).
- [ ] Confirm tone marks render and are not mangled.
- [ ] Accept/expand toward 2,500 words (HSK-ordered).
