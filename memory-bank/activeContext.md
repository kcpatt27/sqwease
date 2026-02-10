# Active context

## Current focus

- **Boxes UI polish + coloring fixes.** Completed. Updated Boxes UI layout (instructions default open, dropdown style, control row order, collapse arrows) and finalized boxes coloring rules and token alignment for edge cases.

## Recent decisions

- Colors in EN must align with JA/romaji: if 好き is colored, "like" must be colored so learners see the mapping. Do not treat "like"/"studying"/"job"/"go" as EN-only helpers.
- Anime, dorama, karaoke should not be colored (boxes-specific).
- "Hot springs" and "X o'clock" are one phrase each for color assignment.
- Time phrases at the end of EN (night/weekend/noon/every day) map to the first JA time token when there are three content groups (time + object + verb).
- Token alignment fixes in boxes.html normalize common segments (digit+時, ごはん compounds, お好み焼き, ます/か splits).
- Boxes UI: instructions open by default; toggle in header; collapse arrows on right; display dropdown moved to the mode button row (right of buttons).
- なぜ (naze) is not colored (pure kana, not kanji).
- に (ni) is a particle and not colored.

## Known issues (for future AI)

- **Boxes coloring** has been a recurring source of bugs and confusion. Rules live in multiple places; adding a new rule often means touching romaji.js or syllable-color.js with boxes-only data. Future sessions should prefer implementing the refactor (boxes-coloring.js) rather than adding more entries to shared particle/helper lists. See `memory-bank/color-alignment-theory.md` and the refactor plan.
