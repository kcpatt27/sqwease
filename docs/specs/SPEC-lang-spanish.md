# SPEC: Spanish Starting Version

| Field | Value |
|-------|-------|
| Status | Approved for implementation |
| Branch | `lang/spanish` (from `ui/intl-a11y-perf`) |
| Target code | `es` |
| Created | 2026-10-09 |
| Shared plan | `SPEC-language-scaffolding.md` |
| UI shell | `SPEC-ui-intl-a11y-perf.md` |

## 1. Language profile

| Attribute | Value |
|-----------|-------|
| Script | Latin (with accents á é í ó ú ü ñ) |
| Direction | LTR |
| Romanization | None needed; `reading` = a simple stress-marked pronunciation hint |
| Word segmentation | Whitespace |
| Font stack addition | `"Noto Sans", "Segoe UI", system-ui` (already Latin-safe) |
| Tokenization | Not required (v0 ships without tokens) |
| Color coding | **Off for v0** (the syllable-color device is Japanese phonics; optional vowel-color study is a future idea, not in scope) |

## 2. UI implications

- The multilingual shell from `SPEC-ui-intl-a11y-perf.md` supplies the UI locale `es`
  and target `es`. This branch must not edit `assets/*` or page markup.
- No word-order remapping is needed for Spanish↔English (both SVO), so the Japanese
  SOV↔SVO color alignment is irrelevant; cards show word / reading / gloss / example.
- Cards must render accents correctly (already covered by the shared Latin font stack).

## 3. Dataset plan

- **Sources to evaluate:** `wordfreq` (Spanish), SUBTLEX-ESP, OpenSubtitles frequency
  lists, Wiktionary frequency lists. Record the chosen source + license in
  `content/es/README.md`.
- **Starter scope:** top **30** daily-conversation words/phrases (shipped).
- **Columns** (TSV → built): `rank, word, reading, pos, english, example,
  example_english`.
- **Builder:** `node scripts/build-lang-vocab.js es` → `data/es/vocab.js`
  (TSV-aware, deterministic `id: "es-####"`, no silent cap, fails loudly).
- **Example row:** `1\tagua\tAH-gwah\tnoun\twater\tQuiero agua, por favor.\tI want water, please.`

## 4. Files added by this branch

```
content/es/source.tsv          # the raw generated list
content/es/README.md           # sources, license, review status
data/es/vocab.js               # generated deck (SqweaseVocab.provide('es', ...))
```

`assets/langs.js` already contains the `es` entry; only correct it if metadata is wrong.

## 5. Acceptance criteria

1. Target picker → Spanish → Flashcards shows the 30-word Spanish deck.
2. Accented characters render and search/copy correctly.
3. `node scripts/build-lang-vocab.js es` runs with no dependencies and is
   deterministic (same-day rebuild produces no diff).
4. No edits to core files other than, if needed, one `langs.js` metadata line.
5. `file://` open still works.

## 6. Follow-up (not in v0)

- Expand to 2,500 words with native review.
- Optional gender/article metadata per noun.
- Optional audio (browser SpeechSynthesis supports `es-ES`).
