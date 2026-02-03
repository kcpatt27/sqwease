# Completed steps (tokenization, editor, learner UI, kanji, index)

Summary so commit history and plans stay aligned. See individual plan files for full detail.

| Step | Plan file | What was done |
|------|-----------|----------------|
| Step 1 | [token-based_alignment_step_1_e03ab0df.plan.md](token-based_alignment_step_1_e03ab0df.plan.md) | Romaji standard (`romaji.js`), particle/polite sets, `isParticleToken()` / `shouldColorToken()`; schema in `content/README-tokenized.md`. |
| Step 2 | [step2-restructure-data.plan.md](step2-restructure-data.plan.md) | Tokenized JSON (`boxes-tokenized.json`), build script → `BOXES_TOKENIZED_SENTENCES` / `BOXES_TOKENIZED_VERSION`. |
| Step 3 | [step_3_editor_page_993e05f5.plan.md](step_3_editor_page_993e05f5.plan.md) | Token editor (`editor.html`): load/edit JSON, token table, recompute romaji, mark as checked, export JSON/CSV; later: add/remove sentence and token, TinySegmenter, register, lemma. |
| Step 4 | [step_4_wire_learner_ui_72736933.plan.md](step_4_wire_learner_ui_72736933.plan.md) | Boxes and Flashcards wired to token data; `colorizeByTokens` when `item.tokens` present; romaji phase toggle (Phase 1/2/3); deck version and register on Boxes. |
| Kanji | — | Lookup by character/meaning/reading; Grade 1+2 list (240) vs Personal list; `content/common-kanji.json` + build script; kanjiapi.dev. |
| Index | — | Separate h1 for mobile (“SQWease · JP”) vs PC/tablet (“Speak Quite Well with Ease · Japanese”) at 600px breakpoint. |

Last updated: Feb 2026.
