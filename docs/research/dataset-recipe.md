# Dataset recipe for a frequency-ranked vocabulary deck

How a language deck is produced, in a form that can be re-run and audited. The
Korean deck (`content/ko/README.md`) is the worked example; this note is the
procedure that generalises it to the es, fr, zh decks and to any new language.

The one rule of the project applies here: everything the app shows is
reproducible from a human-editable source in `content/`, and the build is
deterministic.

## 1. Pick the rank source first

Rank comes from a frequency list, and the list defines the deck. Record:

- the corpus and its date (for Korean: OpenSubtitles 2018 via
  Hermit Dave FrequencyWords `2018/ko/ko_50k.txt`);
- the token definition (whitespace-delimited eojeol, so particle-attached forms
  count as their own entries);
- the cut, and why (top 6,000 as the enrichment window, top 2,500 shipped).

A different corpus yields a different deck. Never mix two rank sources in one
deck, and never re-rank after enrichment: the rank is the input, not an output.

## 2. Take glosses from a dictionary, never from machine translation

Resolution order, stopping at the first hit:

1. a curated map for known contractions and clitics;
2. a direct dictionary entry for the exact surface token;
3. a reverse index over inflected forms to lemma plus part of speech;
4. a second dictionary as fallback (for Korean, kengdic after Wiktextract).

Machine translation is not in the order. A translated gloss is plausible and
unsourced, and a deck built from them reports high coverage over low quality. If
a token has no dictionary gloss, leave the field blank and count it as a gap.

Every gloss carries its source. The source is what the coverage number is
weighted by, and it is the difference between 74.6 percent of machine text and a
weighted score that reflects what is actually sourced.

## 3. Record a licence per source

One table row per dataset: role, dataset, URL, licence, fetch date. The derived
deck inherits the strictest terms of its inputs; a ShareAlike gloss source keeps
the derived deck ShareAlike. This table is the redistribution argument, so it
belongs in `content/<lang>/README.md`, not in a chat.

## 4. Examples are sentence pairs, not generated sentences

Use a parallel corpus with a stated licence (for Korean, Tatoeba via
manythings.org) or a dictionary's own example with its translation. A generated
example sentence cannot be checked against anything and teaches a form nobody
writes.

## 5. Emit a human-editable source, then build

Two distinct programs, never one:

- `enrich.py` (or equivalent) downloads, filters, enriches, and writes
  `source.tsv`. It is not part of the runtime build. It is committed so the
  dataset can be regenerated, and its output is reviewed by a person.
- `scripts/build-lang-vocab.js <lang>` reads `source.tsv` and writes
  `data/<lang>/vocab.js`. It is the only thing that writes generated data. Never
  hand-edit the generated file.

Columns are fixed across languages:
`rank, word, reading, pos, english, example, example_english`. A blank field
means unknown, not empty string with a different meaning.

## 6. Determinism is the acceptance check

Rebuild from `source.tsv` twice and diff. The generated file must be byte
identical. Then re-run the enrichment from the recorded source URLs into a temp
cache and diff `source.tsv`; a non-identical result means a source changed
upstream, and that is a decision, not a silent diff.

Record in the deck README: the fetch date for every source, the row count, and
whether a native speaker has reviewed it. Unreviewed is a status, stated plainly
("2,500 words, UNREVIEWED"), not an omission.

## 7. Do not let the count stand in for the quality

Report three numbers, not one:

- rows shipped;
- rows with a dictionary-sourced gloss (the weighted coverage);
- rows with no gloss at all.

A deck at 100 percent fill with half machine text is worse than a deck at 85
percent fill with every gloss sourced, and only the second set of numbers shows
the difference.

## Check

A new deck is done when the source table lists a licence and fetch date per
dataset, `source.tsv` rebuilds identically, `node scripts/build-lang-vocab.js
<lang>` produces a byte-identical `vocab.js`, the three counts are in the README,
and a native-speaker review is either done or named as pending.
