# Korean deck (`ko`)

Starter vocabulary for the Korean target language. **30 words, unreviewed** — a native
speaker must review before this leaves "starter" status.

## Files

- `source.tsv` — the human-editable source (tab-separated).
- `../data/ko/vocab.js` — generated; do not edit by hand.

## Columns

`rank  word  reading  pos  english  example  example_english`

`reading` is **Revised Romanization** (RR). Keep hyphenation consistent.

## Sources

Starter list compiled from common learner word lists (frequency-first daily core). The
full 2,500-word pass should draw from a proper frequency corpus — evaluate `wordfreq`
(Korean), Sejong corpus frequency lists, and Korean OpenSubtitles frequency — and record
the exact source, URL, license, and date here.

## Rebuild

```bash
node scripts/build-lang-vocab.js ko
```

## Review checklist

- [ ] Native-speaker spot check (grammar, particles, natural translations).
- [ ] Confirm Revised Romanization is consistent.
- [ ] Accept/expand toward 2,500 words.
