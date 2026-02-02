# Color alignment (JA ↔ Romaji ↔ EN): theory and improvements

## Current approach

- **Japanese:** Split into N segments by proportional character count (one segment per romaji word). Only segments whose romaji word is a content word (non-particle) get a color.
- **Romaji:** Content words colored by first-syllable; particles left plain.
- **English:** Content words (non-helper) colored in **reverse** order so SOV (kohi, suki) aligns with SVO (like, coffee).

## Remaining issues

1. **Proportional split ignores word boundaries** – We slice Japanese by character count, so we can cut inside a word (e.g. 好|き) or group が with the wrong segment. Real boundaries need morphology.
2. **Particle list is incomplete** – More particles/conjugations exist; some content words may be misclassified.
3. **English reversal is a heuristic** – Works for simple SOV↔SVO; fails for more complex word order or multiple clauses.
4. **No reading info** – We don’t know which Japanese characters “spell” which romaji word; we only infer from position.

## Ways to improve

### 1. Use a Japanese tokenizer (best accuracy for runtime)

- **TinySegmenter** (pure JS, no WASM):  
  - Segments e.g. `"コーヒーが好きです"` → `["コーヒー", "が", "好き", "です"]`.  
  - Align by index with romaji words (same order).  
  - Lightweight; accuracy is good but not perfect (no readings).
- **MeCab WASM** (e.g. mecab-emscripten, mecab-wasm):  
  - Full morphological analysis + readings.  
  - Can map each token to surface form and reading (→ romaji).  
  - Heavier (WASM + dictionary); best for “correct” boundaries and alignment.

**Idea:** Run tokenizer on JA → get JA segments. Assume romaji string is space-separated in the same order → zip JA segments with romaji words. Color only pairs where romaji word is not a particle. No proportional split.

### 2. Pre-segmented data (best accuracy, no tokenizer)

- In the **source data** (CSV/JSON for flashcards and boxes), store:
  - `ja_segments`: `["コーヒー", "が", "好き", "です"]`
  - `romaji_segments`: `["kohi", "ga", "suki", "desu"]`
  - Optional: `en_segments` or indices mapping JA segments to EN words
- The app then **only** colors by index: no splitting, no guessing. Build step or data pipeline does segmentation once (e.g. with MeCab/fugashi in Python).

### 3. Furigana / ruby as alignment source

- If the data has furigana (e.g. `日本[にほん]` or `<ruby>日本<rt>にほん</rt></ruby>`), we know which base characters map to which reading.
- Convert reading to romaji (e.g. にほん → nihon) and use that for coloring and for aligning JA↔romaji↔EN. Good for kanji-heavy text; need a consistent furigana format in the data.

### 4. Heuristic refinements (no new deps)

- **Particle-aware segment lengths:** When the corresponding romaji word is a known particle (が, です, は, etc.), assign a fixed length (e.g. 1 for が, 2 for です) instead of proportional. Reduces bad cuts on particles.
- **Expand particle list:** Add more particles and conjugations (e.g. でしょう, ません, ている) so they stay uncolored.
- **Expand EN helper list:** So “do”, “does”, “can”, etc. stay plain.

### 5. English alignment beyond reversal

- Reversal works when there’s one object and one verb (SOV ↔ SVO). For more complex sentences, we’d need:
  - Parallel segments (JA segment i ↔ EN segment j) from data, or
  - Semantic similarity (embeddings) to pair words – likely overkill for this app.
- Pragmatic approach: keep reversal; optionally allow the data to specify `en_content_order` or explicit JA↔EN indices for tricky cards.

## Suggested order of implementation

1. **Short term:** Particle-aware segment lengths + expanded particle/helper lists (quick win).
2. **Medium term:** Integrate **TinySegmenter** (or similar) in the app: segment JA, align 1:1 with romaji words, color only content-word pairs. Drop proportional split.
3. **Long term / best quality:** Pre-segment in the build pipeline or data; store `ja_segments` / `romaji_segments` (and optionally EN mapping) so the app just renders colors by index.

## References (from research)

- MeCab in browser: mecab-emscripten, mecab-wasm, mecab-web-worker, Birch-san’s mecab-web.
- TinySegmenter: pure JS, npm `tiny-segmenter`, no WASM.
- Japanese word boundaries: Stack Exchange “How to separate words in a Japanese sentence”; fugashi, nagisa, JUMAN, KyTea (Python).
- Ruby/furigana: W3C Ruby Annotation; character-range mapping (mono vs group ruby).
