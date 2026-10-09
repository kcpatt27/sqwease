# Spanish deck (`es`)

Starter vocabulary for the Spanish target language. **30 words, unreviewed** — a native
speaker must review before this leaves "starter" status.

## Files

- `source.tsv` — the human-editable source (tab-separated).
- `../data/es/vocab.js` — generated; do not edit by hand.

## Columns

`rank  word  reading  pos  english  example  example_english`

## Sources

Starter list compiled from common learner word lists (frequency-first daily core). The
full 2,500-word pass should draw from a proper frequency corpus — evaluate `wordfreq`
(Spanish), SUBTLEX-ESP, and OpenSubtitles frequency lists — and record the exact source,
URL, license, and date here.

## Rebuild

```bash
node scripts/build-lang-vocab.js es
```

## Review checklist

- [ ] Native-speaker spot check (grammar, natural translations).
- [ ] Confirm the `reading` convention is consistent.
- [ ] Accept/expand toward 2,500 words.
