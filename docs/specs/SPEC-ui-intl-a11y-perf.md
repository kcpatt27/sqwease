# SPEC: UI — Multi-Language, Accessibility, Multi-Device, Performance

| Field | Value |
|-------|-------|
| Status | Approved for implementation |
| Branch | `ui/intl-a11y-perf` |
| Base | `main` |
| Owner | SQWease maintainer |
| Created | 2026-10-09 |
| Related tickets | T-032…T-037, T-040, T-044…T-048, T-051…T-056, T-060 |
| Producing tickets (bugs fixed here) | T-001, T-004, T-006, T-034, T-035, T-054 |

## 1. Problem

The app ships Japanese-only UI chrome, hardcoded English strings, mouse-only primary
controls, fixed pixel layouts, six copies of the same theme/SRS code, and a blocking
1500-word data module. It cannot present a second target language, cannot be used
comfortably by keyboard or screen-reader users, and degrades on small/large screens.
This spec defines one UI pass that makes the shell language-agnostic, accessible to
WCAG 2.2 AA for the primary flow, responsive across phone/tablet/desktop, and lighter
to load — without a framework, build step, or new runtime dependency.

## 2. Goals

- **G1 — Language-agnostic shell.** UI chrome is translated from a string table; a UI
  locale (`en/ja/es/fr/ko/zh`) and a *target* language (`ja/zh/es/fr/ko`) are selectable
  and persisted. The flashcard deck loads from the active target language's data.
- **G2 — Accessibility (WCAG 2.2 AA) for the primary flow** (menu → flashcards study).
- **G3 — Multi-device.** Usable from 320 px phones through desktop, portrait and
  landscape, with touch and keyboard.
- **G4 — Performance.** No per-render re-tokenization, no telemetry, deferred data
  modules, batched storage writes.

## 3. Non-goals

- No framework / bundler / npm runtime dependency (vanilla + static hosting stays).
- No switch to `fetch()` for core data (would break `file://` usage).
- No rewriting of every page's page-specific CSS; only shared concerns are extracted.
- Non-Japanese sentence features (Boxes) and kana/kanji remain Japanese-only and are
  capability-gated in this pass (see §8).
- Visual redesign beyond the accessibility/contrast and responsive fixes listed here.

## 4. Architecture

### 4.1 Shared assets (new)

```
assets/
  theme.css    # design tokens (light+dark), base reset/typography, focus-visible,
               # reduced-motion, safe-area helpers, shared .theme-toggle/.site-nav/.btn
  theme.js     # no-flash theme bootstrap + SqweaseTheme.toggle()/get()
  store.js     # SqweaseStore: safe, namespaced localStorage get/set JSON|string/remove
  i18n.js      # SqweaseI18n: dictionaries, t(), apply(root), setLocale(), getLocale()
  langs.js     # SqweaseLangs: target-language metadata + getActive()/setActive()/list()
  vocab.js     # SqweaseVocab: loads the active language's deck via <script> injection
```

Rules:
- Assets are plain ES5-compatible IIFEs exposing one global each. No modules, no build.
- Pages keep their page-specific `<style>`; they drop only the duplicated pieces
  (tokens + theme toggle + nav base) that move into `theme.css`.
- Load order per page: `theme.js` (head, inline theme bootstrap may remain) →
  `store.js` → `i18n.js` → `langs.js` → `vocab.js` → page script. Use `defer`.

### 4.2 `SqweaseStore` (T-060, T-002, T-011, T-012)

```
get(key, fallback)        // JSON-parses, try/catch, returns fallback on failure
set(key, value)           // JSON stringifies, try/catch, returns boolean
getString(key, fallback)  // plain string with fallback
setString(key, value)
remove(key)
```
All keys remain `sqwease-*`. A corrupt value is removed on next failed read.

### 4.3 `SqweaseI18n` (T-045, T-036, T-046)

- Dictionaries: `en, ja, es, fr, ko, zh`. Keys are dotted, e.g. `nav.flashcards`,
  `flashcards.rate.good`, `common.menu`.
- `t(key, vars?)` interpolates `{name}` placeholders.
- `apply(root=document)` replaces `[data-i18n]` textContent and
  `[data-i18n-attr]` (format `attr:key`), and updates `document.title`.
- `setLocale(code)` persists to `sqwease-ui-locale`, sets `<html lang>` and `<html dir>`,
  and re-applies strings.
- Default: `navigator.language` if supported, else `en`.

### 4.4 `SqweaseLangs` (T-045, T-047)

```
{ code, name, nativeName, script, direction, romanization: 'romaji'|'pinyin'|'none',
  fontStack, dataModule, tokenizable, wordSegmentation, capabilities: {flashcards, boxes, kana, kanji} }
```
Supported targets: `ja` (default), `zh`, `es`, `fr`, `ko`. Stored under
`sqwease-target-lang`. `setActive(code)` sets `document.body.dataset.targetLang` so CSS
can switch font stacks per target.

### 4.5 `SqweaseVocab` (G1, T-055)

- Contract a data module must satisfy (language branches add these files):

```js
// data/<code>/vocab.js
window.SQWEASE_VOCAB = {
  lang: 'es',
  version: 1,
  generatedAt: '2026-10-09',
  words: [ { id, w, p, d, s, tokens? } ]   // word, pronunciation, definition, sentence
};
```

- `SqweaseVocab.load(code)` injects `<script src="data/<code>/vocab.js">` once and
  resolves `window.SQWEASE_VOCAB`; if `code === 'ja'` and the legacy
  `FLASHCARDS_VOCAB` exists, it adapts it (see `data/ja/vocab.js`). Missing module →
  reject with a user-facing message and keep the page usable.
- The flashcards page renders `SqweaseVocab.get()`; it never references
  `FLASHCARDS_VOCAB` directly.
- Starter language branches add `data/<code>/vocab.js` only — **no edits to core
  files**, so all four merge cleanly (see the language specs).

## 5. Requirements

### R1 — Language (i18n)
- R1.1 All chrome in `index.html` and `flashcards.html` uses `data-i18n`; nav/heading/
  main actions in the other four pages do too. Remaining literals are ticketed (T-045).
- R1.2 UI language selector on `index.html`; target-language selector on `index.html`.
- R1.3 `<html lang>` reflects the UI locale; ALL Japanese/target-language content
  carries the target `lang` (T-036).
- R1.4 Dictionaries exist for `en/ja/es/fr/ko/zh` (machine-quality is acceptable for
  non-English; native review is a follow-up task).
- R1.5 Switching UI locale or target language is instant (no reload) and persists.

### R2 — Accessibility (WCAG 2.2 AA, primary flow)
- R2.1 Theme toggle is a `<button aria-label aria-pressed>` (T-032).
- R2.2 Flashcard flip and Boxes practice/info toggles are keyboard-operable semantic
  controls with visible focus and correct ARIA state (T-033).
- R2.3 Status/progress regions use `role="status" aria-live="polite"` (T-037).
- R2.4 Tables have `<caption>` and `scope`; token inputs are labelled (T-038, T-041).
- R2.5 One `h1` per page; valid heading outline; section titles are headings (T-039).
- R2.6 `prefers-reduced-motion` collapses transitions/animations (T-040).
- R2.7 Text and the syllable palette meet 4.5:1; color is not the sole cue for the
  JA↔romaji↔EN mapping (T-034, T-035).
- R2.8 Fixed controls respect safe-area insets; viewport uses `viewport-fit=cover` (T-044).
- R2.9 Every interactive target is ≥44×44 CSS px (T-053).

### R3 — Multi-device
- R3.1 Flashcard uses fluid sizing (`min-height` + viewport-cap + `clamp()` type) with no
  clipping of long words/sentences, portrait or landscape (T-051).
- R3.2 Boxes faces never clip long content (T-052).
- R3.3 Base font stacks include CJK fallbacks and switch per target via
  `body[data-target-lang]` / `:lang()` (T-046).

### R4 — Performance
- R4.1 No telemetry / hardcoded localhost fetches (T-001).
- R4.2 Data scripts are `defer`ed; deck parse does not block first paint (T-055).
- R4.3 Boxes builds tokens once per item, hoists the segmenter/regexes, and removes
  nested index scans (T-056).
- R4.4 Storage writes happen once per user action, not per rendered card (T-057).

## 6. Acceptance criteria (definition of done)

1. `index.html` → choose UI locale `es`, target `fr` → all chrome updates with no reload;
   `<html lang="es">`; reload persists both choices.
2. Open flashcards for target `fr` → deck renders from `data/fr/vocab.js`; a missing data
   file shows a friendly message, not a crash.
3. Keyboard-only: Tab reaches the theme toggle and the flip card; Enter/Space flips;
   focus ring visible; pressed/expanded states exposed; no keyboard trap.
4. `prefers-reduced-motion: reduce` → flips/transitions effectively instant.
5. A 320 px-wide viewport and a short landscape phone: no horizontal scroll, no clipped
   card content, all targets ≥44 px.
6. Axe (or equivalent) on `index.html` and `flashcards.html`: no critical/serious issues.
7. `boxes.html` makes zero network requests other than its own assets, and re-rendering a
   full set does not re-tokenize (spot-check via breakpoints/console).
8. All six pages load with the shared assets; changing a token in `theme.css` changes
   every page.
9. `file://` opening of `index.html` still works.

## 7. Documentation

- Every shipped fix flips its ticket to `status: done` with a commit reference.
- `ARCHITECTURE.md` documents the assets layer and the vocab contract.
- `docs/specs/SPEC-language-scaffolding.md` documents how the four language branches add
  data on top of this shell.

## 8. Capability gating (interim)

Until a language has its own Boxes/Kana/Kanji, `index.html` renders those cards disabled
with a short "not available for <language> yet" note when the target is not `ja`.
Flashcards is the only cross-language activity in v0.

## 9. Risks and open questions

- Non-English UI dictionaries need native review (follow-up ticket).
- `file://` + script injection for `SqweaseVocab` must be verified per browser.
- Full `data-i18n` coverage of `boxes.html`/`editor.html` is deferred; those pages get the
  shared mechanism and nav/headings only, remainder tracked by T-045.
- Ponytail: no templating engine, no virtual DOM, no i18n framework — the string table and
  a script-injection loader are sufficient at this scale.
