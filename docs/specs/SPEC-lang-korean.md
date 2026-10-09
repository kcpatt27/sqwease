# SPEC: Korean Starting Version

| Field | Value |
|-------|-------|
| Status | Approved for implementation |
| Branch | `lang/korean` (from `ui/intl-a11y-perf`) |
| Target code | `ko` |
| Created | 2026-10-09 |
| Shared plan | `SPEC-language-scaffolding.md` |
| UI shell | `SPEC-ui-intl-a11y-perf.md` |

## 1. Language profile

| Attribute | Value |
|-----------|-------|
| Script | Hangul (음절 블록) + occasional Hanja (excluded for v0) |
| Direction | LTR |
| Romanization | Revised Romanization of Korean (RR); `reading` = RR with hyphens |
| Word segmentation | Whitespace (eojeol); particles are glued to the stem, kept as one word for v0 |
| Font stack addition | `"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif` |
| Tokenization | Optional; whitespace split is enough for v0 |
| Color coding | **Off for v0**. A future idea: color by initial consonant of the syllable block (analogous to Gojūon), which would reuse the *idea* but not the Japanese tables. |

## 2. UI implications

- No core edits. The shell supplies UI locale `ko` and target `ko`.
- `langs.js` entry must declare `fontStack` with the Korean stack and
  `romanization: 'romaji'`-equivalent label `'rr'` (display only).
- Korean↔English word order differs (SOV↔SVO), but v0 does not color-code, so no
  remapping is implemented; note it for the future.
- Line-breaking must allow Hangul word wrapping (default behavior; avoid `word-break: break-all`).

## 3. Dataset plan

- **Sources to evaluate:** `wordfreq` (Korean), Sejong corpus frequency lists, Korean
  OpenSubtitles frequency. Record source + license in `content/ko/README.md`.
- **Starter scope:** top **40** daily words/phrases (include common verbs and particles
  as their own entries where useful).
- **Columns:** `rank, word, reading, pos, english, example, example_english`.
- **Builder:** `scripts/build-ko-vocab.js` → `data/ko/vocab.js` (deterministic `ko-####` ids).
- **Reading rule:** Revised Romanization; keep hyphenation consistent.
- **Example row:** `1\t물\tmul\tnoun\twater\t물 좀 주세요.\tPlease give me some water.`

## 4. Files added by this branch

```
content/ko/source.tsv
content/ko/README.md
scripts/build-ko-vocab.js
data/ko/vocab.js
```

## 5. Acceptance criteria

1. Target Korean → Flashcards renders the 40-word deck with a Korean-capable font.
2. Hangul renders and wraps correctly on phone and desktop.
3. Builder is dependency-free and deterministic.
4. No core edits beyond an optional one-line `langs.js` fix.
5. `file://` still works.

## 6. Follow-up (not in v0)

- Expand to 2,500 words with native review.
- Particle/decomposition metadata (stem + particle) for grammar practice.
- Optional initial-consonant color coding.
- Optional `ko-KR` audio via SpeechSynthesis.
