# Deck data (`data/<lang>/vocab.js`)

Each target language provides one deck module here:

```js
// data/<code>/vocab.js
(function () {
  SqweaseVocab.provide('<code>', {
    lang: '<code>',
    version: 1,
    generatedAt: 'YYYY-MM-DD',
    words: [
      { id: '<code>-0001', w: '…', p: '…', d: '…', s: '…' }
    ]
  });
})();
```

- `id` must be **stable** (never derived from array position) so SRS progress survives rebuilds.
- `w` = word, `p` = pronunciation/reading, `d` = English gloss, `s` = example sentence.
- `tokens` is optional (Japanese only for now).

`data/ja/vocab.js` is an adapter for the legacy generated file. New languages add a
generated module produced by `scripts/build-<code>-vocab.js`. See
`docs/specs/SPEC-language-scaffolding.md`.
