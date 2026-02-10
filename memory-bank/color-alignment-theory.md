# Color Alignment Theory

## Purpose

Colors help learners **map meaning across languages** (JA ↔ EN). If a Japanese word contains kanji and is colored, its **English translation gets the same color** so the brain can quickly encode the relationship. Content words (like, studying, job, go) are colored in EN because they correspond to colored JA/romaji—not because they are "special," but so users can see the mapping.

---

## For future AI / maintainers

**Boxes coloring has been a recurring problem.** Rules were scattered across `romaji.js` (particle lists), `syllable-color.js` (PARTICLES, EN_HELPERS, EN_PHRASES), and ad-hoc logic. Fixes were applied by adding more entries to those shared lists (naze, anime, dorama, karaoke in POLITE_ROMAJI; phrase grouping in colorizeByTokens), which overloaded generic modules with boxes-only behavior and made the system hard to reason about.

**Refactor plan:** A dedicated **boxes-coloring.js** module should own all boxes-specific rules (JA/romaji skip list, EN helpers, EN no-color, EN phrases like "hot springs" and "X o'clock"). **romaji.js** should answer only "is this a grammatical particle?" **syllable-color.js** should stay generic (no boxes-only lists or phrase grouping). Plan file: `.cursor/plans/boxes_coloring_refactor_cb4505d3.plan.md`. **Implementing the refactor is not guaranteed to fix every edge case**; treat it as the target architecture and verify behavior on all 5 Boxes tabs and list + practice after any change.

---

## What gets colored

### Japanese / Romaji

- **Colored:** All tokens that contain kanji and are not particles (e.g. 好き/suki, 勉強/benkyō, 仕事/shigoto, 行きたい/ikitai).
- **Not colored:** Grammatical particles (が/ga, は/wa, を/o, に/ni, で/de, と/to, か/ka, ね/ne, よ/yo, です/desu, ます/masu, して/shite, います/imasu, etc.). Pure kana question word なぜ/naze is not colored (not kanji). Loanwords that are not colored in boxes: anime, dorama, karaoke (boxes-specific; see refactor plan).

### English

- **Colored:** Content words that correspond to colored JA/romaji (like, studying, job, go, Japanese, student, etc.) so the mapping is visible.
- **Not colored:** Grammatical function words (I, you, am, is, are, do, does, at, to, because, etc.). Boxes-specific: anime, dramas, karaoke are not colored (loanwords). Some EN nouns are also excluded in Boxes to align with desired learning focus (see `EN_NO_COLOR` in `boxes-coloring.js`).

### Special cases (boxes)

- **"hot springs"** and **"X o'clock"** (e.g. 7 o'clock) are treated as **one phrase** and get one color (same as 温泉, 7時).
- **Time phrases** at the end of EN (night, weekend, noon, every day) map to the **first** JA time token when there are three content groups (time + object + verb).
- **に** (ni) in e.g. "shichi-ji ni okimasu" is a particle and is not colored.

---

## Color assignment

- Colors come from the **first syllable** of the romaji (e.g. "ko" → orange, "su" → yellow).
- English inherits colors via **SOV↔SVO mapping**: first EN content word maps to last JA content color; remaining EN content words map to JA content colors in order.
- When there are more EN content words than JA colors (e.g. Routine: time + verb), content words are **grouped** so each JA color maps to a phrase (e.g. "get up" vs "7 o'clock"). For time-tail sentences with three groups, use full reverse to map EN time → JA time.

---

## Where rules live (current vs after refactor)

| Concern | Current (pre-refactor) | After refactor (target) |
|--------|------------------------|-------------------------|
| Grammatical particles | romaji.js: PARTICLES_ROMAJI, POLITE_ROMAJI | romaji.js only (no naze/anime/dorama/karaoke in POLITE_ROMAJI) |
| Boxes "don't color" (naze, anime, etc.) | romaji.js POLITE_ROMAJI + syllable-color.js PARTICLES | boxes-coloring.js: BOXES_SKIP_ROMAJI |
| EN grammatical helpers | syllable-color.js EN_HELPERS | boxes-coloring.js (for boxes); syllable-color.js EN_HELPERS generic only |
| EN no-color (anime, dramas, karaoke) | syllable-color.js EN_HELPERS | boxes-coloring.js: EN_NO_COLOR |
| EN phrases (hot springs, o'clock) | syllable-color.js EN_PHRASES + logic in colorizeByTokens | boxes-coloring.js: EN_PHRASES + logic in colorizeBoxesItem |
| Token "should color" (kanji + not particle) | syllable-color.js shouldColor using Romaji.isParticleToken | boxes: boxes-coloring.js shouldColorTokenForBoxes; generic: syllable-color.js (hasKanji && !isParticle) |

---

## Implementation (current)

- **syllable-color.js:** `colorizeByTokens(ja, tokens, isDark, fullEn)` — token-based path; when fullEn is provided, builds EN from full sentence with content groups and SOV mapping. `colorizeByWords(ja, romaji, en, isDark, maxEnColors)` — word-based fallback using PARTICLES and EN_HELPERS.
- **romaji.js:** `isParticleToken(token)`, `shouldColorToken(token)`, `containsKanji(token)`. PARTICLES_ROMAJI and POLITE_ROMAJI (currently include naze, anime, dorama, karaoke for boxes behavior).
- **boxes.html:** Calls `BoxesColoring.colorizeBoxesItem(item.ja, tokens, isDark, item.en)` for list and practice; fallback to SyllableColor only when needed. Includes token normalization for common compounds (digit+時, ごはん splits/joins, お好み焼き, ます/か handling) to align with romaji.

After refactor, boxes.html will call `BoxesColoring.colorizeBoxesItem(item.ja, tokens, isDark, item.en)` when tokens exist; boxes-coloring.js will own all boxes rules and use Romaji + SyllableColor only as utilities.

---

## Learner UI

- Boxes and Flashcards: Phase 1 (romaji + EN), Phase 2 (no romaji), Phase 3 (Japanese only) via `sqwease-romaji-phase`.
- Deck version and optional register label on Boxes.
