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
| Flashcard tokenization | tokenization_ui_srs plan | Build script adds `tokens` (single token) for all-kana words; Flashcards use `colorizeByTokens` when present. |
| UI/UX pass | tokenization_ui_srs plan | `:focus-visible` on all pages; touch targets min 44px (buttons, nav, set tabs, rating); breakpoints unchanged. |
| Boxes coloring refactor | boxes_coloring_refactor_cb4505d3 plan | **Completed Feb 2026.** Implemented boxes-coloring.js with all boxes rules (skip list, helpers, no-color, phrases, time-mapping); reverted romaji.js to grammatical-only; simplified syllable-color.js. Added token normalization in boxes.html for compounds. Verified with debug mode runtime evidence on all 5 tabs. |
| Boxes UI polish | boxes_ui_layout_f0d65607 plan | **Completed Feb 2026.** Instructions open by default, toggle in header, collapse arrows right-aligned, dropdown styled to match buttons, control row order adjusted, spacing tightened. |

Last updated: Feb 2026.
