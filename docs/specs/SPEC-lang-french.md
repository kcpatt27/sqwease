# SPEC: French Starting Version

| Field | Value |
|-------|-------|
| Status | Approved for implementation |
| Branch | `lang/french` (from `ui/intl-a11y-perf`) |
| Target code | `fr` |
| Created | 2026-10-09 |
| Shared plan | `SPEC-language-scaffolding.md` |
| UI shell | `SPEC-ui-intl-a11y-perf.md` |

## 1. Language profile

| Attribute | Value |
|-----------|-------|
| Script | Latin (with accents é è ê à â ç î ï ô ù û œ) |
| Direction | LTR |
| Romanization | None needed; `reading` = a simple pronunciation hint |
| Word segmentation | Whitespace (note elision `l'`, `d'`, `qu'`) |
| Font stack addition | `"Noto Sans", "Segoe UI", system-ui` |
| Tokenization | Not required for v0; if added later, keep elided forms as one token |
| Color coding | **Off for v0** (same rationale as Spanish) |

## 2. UI implications

- No core edits. The shell supplies UI locale `fr` and target `fr`.
- French↔English is SVO↔SVO; no word-order remap needed.
- Avoid hard line-breaks inside elided forms; card text should wrap normally.

## 3. Dataset plan

- **Sources to evaluate:** `wordfreq` (French), SUBTLEX-FR, OpenSubtitles, Lexique 3.
  Record source + license in `content/fr/README.md`.
- **Starter scope:** top **30** daily-conversation words/phrases (shipped).
- **Columns:** `rank, word, reading, pos, english, example, example_english`.
- **Builder:** `node scripts/build-lang-vocab.js fr` → `data/fr/vocab.js` (deterministic `fr-####` ids).
- **Elision rule:** keep `l'eau`, `d'accord`, `qu'est-ce que` as single `word` values.
- **Example row:** `1\teau\tOH\tnoun\twater\tJe voudrais de l'eau.\tI would like some water.`

## 4. Files added by this branch

```
content/fr/source.tsv
content/fr/README.md
data/fr/vocab.js
```

## 5. Acceptance criteria

1. Target French → Flashcards renders the 30-word deck.
2. Accents and apostrophes (including curly `’`) display and build correctly.
3. Builder is dependency-free and deterministic.
4. No core edits beyond an optional one-line `langs.js` fix.
5. `file://` still works.

## 6. Follow-up (not in v0)

- Expand to 2,500 words with native review.
- Optional gender metadata for nouns.
- Optional `fr-FR` audio via SpeechSynthesis.
