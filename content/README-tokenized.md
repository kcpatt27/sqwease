# Tokenized sentence schema

Tokenized sentences are used for **token-based alignment** (JA ↔ romaji ↔ EN) and **particle-aware coloring**. Romaji is derived from kana via `Romaji.kanaToRomaji(kana)` (modified Hepburn).

## Sentence (top level)

| Field         | Type   | Description |
| ------------- | ------ | ----------- |
| `id`          | string | Optional. e.g. `ex-0001`, `boxes-likes-3`. |
| `ja`          | string | Full Japanese text (source of truth for `start`/`end`). |
| `romaji`      | string | Full romaji; should equal space-joined `tokens[].romaji`. |
| `en`          | string | Full English (natural or literal). |
| `tokens`      | array  | Ordered token list. |
| `version`     | string | Optional. Sentence or deck version (e.g. `"1.0"`) to avoid silent changes. |
| `lastUpdated` | string | Optional. ISO date or timestamp when sentence was last edited. |
| `checked`     | boolean | Optional. Mark as verified in the editor (for QA). |
| `register`    | string | Optional. Politeness/register: e.g. `"polite"`, `"casual"`, `"very-formal"`. |

## Token

| Field         | Type    | Description |
| ------------- | ------- | ----------- |
| `ja`          | string  | Surface form (substring of `sentence.ja`). |
| `kana`        | string  | Reading (hiragana/katakana); romaji is derived from this. |
| `romaji`      | string  | From `Romaji.kanaToRomaji(token.kana)`. |
| `en`          | string \| null | Literal gloss for alignment; `null` for particles/copula. |
| `start`       | number  | Start index in `sentence.ja` (inclusive). |
| `end`         | number  | End index in `sentence.ja` (exclusive). |
| `pos`         | string  | Optional. e.g. `noun`, `particle`, `copula`. |
| `isParticle`  | boolean | If true, do not color (overrides romaji-based guess). |
| `lemma`       | string  | Optional. Dictionary base form (e.g. for variation tracking). |

## Coloring rule

Color a token iff: `/\u4e00-\u9faf/.test(token.ja) && !Romaji.isParticleToken(token)`.

Use token `start`/`end` for Japanese spans; align romaji and English by token order (no reversal).

## Related

- **romaji.js** — `kanaToRomaji(kana)`, `isParticleToken(token)`, `containsKanji(token)`, `shouldColorToken(token)`.
- **editor.html** — Load/edit tokenized JSON; add/remove sentence and token; TinySegmenter pre-fill; recompute romaji from kana; export JSON/CSV.
- **scripts/build-boxes-data.js** — Reads `content/boxes-tokenized.json`, emits `BOXES_TOKENIZED_SENTENCES` and `BOXES_TOKENIZED_VERSION` into `boxes-data.js`.
