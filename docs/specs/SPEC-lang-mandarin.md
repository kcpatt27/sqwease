# SPEC: Mandarin Starting Version

| Field | Value |
|-------|-------|
| Status | Approved for implementation |
| Branch | `lang/mandarin` (from `ui/intl-a11y-perf`) |
| Target code | `zh` |
| Created | 2026-10-09 |
| Shared plan | `SPEC-language-scaffolding.md` |
| UI shell | `SPEC-ui-intl-a11y-perf.md` |

## 1. Language profile

| Attribute | Value |
|-----------|-------|
| Script | Simplified Chinese (Han) + Latin Pinyin |
| Direction | LTR |
| Reading | Pinyin with tone marks (ā á ǎ à, etc.) |
| Word segmentation | **Required** — Chinese is not space-delimited. v0 keeps each deck entry a fixed word/phrase; sentence tokens are optional and, if added, require a segmenter. |
| Font stack addition | `"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif` |
| Tokenization | Deferred. If enabled, use an offline segmenter (jieba/pkuseg) at build time, not in the browser. |
| Color coding | **Off for v0**. Future candidate: tone-based coloring (1–4 tones + neutral). This does not reuse the Japanese Gojūon palette. |

## 2. UI implications

- No core edits. The shell supplies UI locale `zh` and target `zh`.
- `langs.js` entry must declare the Chinese font stack and `romanization: 'pinyin'`.
- `p` (pronunciation) holds Pinyin with tones; it must not be run through
  `Romaji.kanaToRomaji` (that module is Japanese-only and this branch does not call it).
- Cards show: Han word → Pinyin → English gloss → example + translation.
- Ensure tone-marked pinyin renders (Latin + combining/precomposed diacritics).

## 3. Dataset plan

- **Sources to evaluate:** `wordfreq` (Chinese), SUBTLEX-CH, HSK 1–6 word lists, Tatoeba
  frequency. Prefer an HSK-ordered starter for learner relevance. Record source + license
  in `content/zh/README.md`.
- **Starter scope:** top **30** words (HSK 1 core, shipped), each a single word or fixed phrase.
- **Columns:** `rank, word, reading, pos, english, example, example_english`
  (`reading` holds Pinyin with tone marks).
- **Builder:** `node scripts/build-lang-vocab.js zh` → `data/zh/vocab.js` (deterministic `zh-####` ids).
- **Example row:** `1\t水\tshuǐ\tnoun\twater\t我要水。\tI want water.`

## 4. Files added by this branch

```
content/zh/source.tsv
content/zh/README.md
data/zh/vocab.js
```

## 5. Acceptance criteria

1. Target Mandarin → Flashcards renders the 30-word deck with Han + Pinyin.
2. Tone marks display correctly and are not mangled by any romaji path.
3. Builder is dependency-free and deterministic.
4. No core edits beyond an optional one-line `langs.js` fix.
5. `file://` still works.

## 6. Follow-up (not in v0)

- Expand to 2,500 words (HSK-ordered) with native review.
- Sentence tokenization via an offline segmenter at build time.
- Optional tone-color coding.
- Optional `zh-CN` audio via SpeechSynthesis.
