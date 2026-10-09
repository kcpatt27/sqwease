# SQWease Ticket Backlog

Maintainer view. 84 tickets. Regenerate with `node scripts/build-ticket-index.js`.

Severity: `critical` blocks shipping · `high` next · `medium` soon · `low`/`nit` cleanup. Priority: `P0` immediate · `P1` next · `P2` scheduled · `P3` opportunistic.

## Critical (1)

| ID | Title | Area | Type | Source |
|----|-------|------|------|--------|
| [T-001](./T-001.md) | Remove hardcoded localhost debug telemetry from production pages | boxes | bug, privacy, performance | ponytail-audit, bug-hunt |

## High (20)

| ID | Title | Area | Type | Source |
|----|-------|------|------|--------|
| [T-002](./T-002.md) | Guard JSON.parse of persisted state so corrupt localStorage cannot crash a page | core | bug | bug-hunt |
| [T-003](./T-003.md) | Make the flashcards CSV build quote-aware and stop silently dropping 1,007 rows | build | bug, data | bug-hunt, ponytail-audit |
| [T-004](./T-004.md) | Generate flashcard token romaji from kanaToRomaji, not the pronunciation field | build | bug, coloring, i18n | bug-hunt |
| [T-005](./T-005.md) | Unify particle/helper detection across romaji.js, syllable-color.js and boxes-coloring.js | coloring | bug, coloring, over-engineering | bug-hunt, ponytail-audit |
| [T-006](./T-006.md) | Fix Boxes EN<->JA color mapping for question-word and 3-group sentences | boxes | bug, coloring | bug-hunt |
| [T-007](./T-007.md) | Build the romaji line from sentence romaji/offsets, not space-joined token fragments | coloring | bug, i18n, coloring | bug-hunt, data |
| [T-008](./T-008.md) | Assign token.en during runtime segmentation so slot-filled EN colors align | boxes | bug, coloring | bug-hunt, docs |
| [T-009](./T-009.md) | Cap SRS interval and ease growth to prevent RangeError on repeated Easy | srs | edge-case | bug-hunt |
| [T-013](./T-013.md) | Replace positional-index removal in the Kanji personal list with a stable id | kanji | edge-case | bug-hunt |
| [T-032](./T-032.md) | Make the theme toggle a real focusable button on all six pages | core | a11y | bug-hunt |
| [T-033](./T-033.md) | Make flip/practice cards and the info toggle keyboard-operable semantic controls | core | a11y | bug-hunt |
| [T-034](./T-034.md) | Add a non-color cue and fix contrast for syllable coloring | coloring | a11y, coloring | bug-hunt |
| [T-035](./T-035.md) | Fix low-contrast text tokens (#ccc instruction, #747d8c table headers/loading) | core | a11y | bug-hunt |
| [T-036](./T-036.md) | Set language metadata correctly (dynamic html lang, lang=\"ja\" on Japanese content) | core | a11y, i18n | bug-hunt |
| [T-045](./T-045.md) | Extract hardcoded UI strings into a locale table with data-i18n | core | i18n | bug-hunt |
| [T-051](./T-051.md) | Replace fixed flashcard dimensions with fluid min/max-height and clamp() type | flashcards | responsive | bug-hunt |
| [T-055](./T-055.md) | Defer large data modules and page scripts to reduce blocking parse/execute | core | performance | bug-hunt |
| [T-060](./T-060.md) | Extract shared theme.css/theme.js/srs-deck.js/util to remove 6x duplication | core | over-engineering, maintainability | ponytail-audit |
| [T-066](./T-066.md) | Correct top-level docs that claim 263 words / 5% / no SRS / single page | docs | docs | data |
| [T-067](./T-067.md) | Fix README references to a CSV file that does not exist | docs | docs | data |

## Medium (31)

| ID | Title | Area | Type | Source |
|----|-------|------|------|--------|
| [T-010](./T-010.md) | Replace locale-formatted toDateString day keys with ISO dates | core | i18n, edge-case | bug-hunt |
| [T-014](./T-014.md) | Bundle a local kanji dictionary; use kanjiapi.dev only as a fallback | kanji | edge-case, privacy | bug-hunt |
| [T-015](./T-015.md) | Fix kanaToRomaji edge cases and expand its tests | romaji | i18n, edge-case | bug-hunt |
| [T-016](./T-016.md) | Particle detection by romaji misclassifies kanji homophones | romaji | edge-case, coloring | bug-hunt |
| [T-017](./T-017.md) | Stop colorizeByWords emitting empty colored spans on count mismatch | coloring | bug, coloring | bug-hunt |
| [T-018](./T-018.md) | Surface (do not silently swallow) segment-count mismatch in Boxes tokenization | boxes | maintainability, coloring | bug-hunt, docs |
| [T-020](./T-020.md) | DARK palette is byte-identical to LIGHT; remove or implement the dark branch | coloring | yagni, over-engineering | ponytail-audit |
| [T-022](./T-022.md) | Collapse duplicated escapeHtml/normalize/containsKanji/EN_HELPERS into one util | coloring | shrink, over-engineering | ponytail-audit |
| [T-037](./T-037.md) | Announce dynamic status/progress regions | core | a11y | bug-hunt |
| [T-038](./T-038.md) | Add caption/scope semantics to data tables | core | a11y | bug-hunt |
| [T-039](./T-039.md) | Fix heading order, duplicate h1, and div section titles | core | a11y | bug-hunt |
| [T-040](./T-040.md) | Respect prefers-reduced-motion | core | a11y | bug-hunt |
| [T-041](./T-041.md) | Programmatically label token-editor inputs | editor | a11y | bug-hunt |
| [T-046](./T-046.md) | Add CJK-capable font stack and :lang(ja) font selection | core | i18n | bug-hunt |
| [T-047](./T-047.md) | Isolate Japanese-specific romaji/SOV assumptions from shared coloring | coloring | i18n, over-engineering | bug-hunt, ponytail-audit |
| [T-049](./T-049.md) | Unify romanization convention across all content | content | i18n, data | data, bug-hunt |
| [T-052](./T-052.md) | Fix Boxes practice faces clipping on long content | boxes | responsive | bug-hunt |
| [T-053](./T-053.md) | Enforce >=44px touch targets by default | core | responsive, a11y | bug-hunt |
| [T-054](./T-054.md) | Define missing CSS custom properties (--secondary-text, --text-muted) | core | bug | bug-hunt |
| [T-056](./T-056.md) | Memoize tokens/coloring, hoist the segmenter, and remove O(n^2) scans | boxes | performance | bug-hunt |
| [T-061](./T-061.md) | Use stable SRS card ids decoupled from mutable content | srs | data-integrity | bug-hunt |
| [T-062](./T-062.md) | Regenerate boxes-data.js and add build validation | build | data-integrity | bug-hunt |
| [T-065](./T-065.md) | Add a real test runner and coverage for romaji/coloring/SRS | core | test | ponytail-audit, bug-hunt |
| [T-068](./T-068.md) | Update srs-status.md: Boxes SRS is implemented | docs | docs | data |
| [T-069](./T-069.md) | Resolve README build-step contradiction and menu-count drift | docs | docs | data |
| [T-070](./T-070.md) | Document the content -> build script -> generated JS data pipeline | docs | docs | data |
| [T-078](./T-078.md) | Flashcards Display-phase selector does nothing and shows for non-Japanese targets | flashcards | ui, bug, i18n | ui-review |
| [T-079](./T-079.md) | boxes.html overflows horizontally on narrow phones (mode-tabs do not wrap) | boxes | ui, responsive | ui-review |
| [T-080](./T-080.md) | editor.html overflows horizontally on narrow phones (token table cannot scroll) | editor | ui, responsive | ui-review |
| [T-081](./T-081.md) | boxes.html controls stay light in dark mode and rating colors fail contrast | boxes | ui, a11y, bug | ui-review |
| [T-082](./T-082.md) | editor.html inputs and secondary buttons stay light in dark mode | editor | ui, a11y | ui-review |

## Low (24)

| ID | Title | Area | Type | Source |
|----|-------|------|------|--------|
| [T-011](./T-011.md) | Guard newCardsIntroduced parse against NaN | core | edge-case | bug-hunt |
| [T-012](./T-012.md) | Guard localStorage writes against quota/disabled storage | core | bug | bug-hunt |
| [T-019](./T-019.md) | Move content-specific merge/split hacks out of boxes.html into data | boxes | over-engineering, maintainability | ponytail-audit |
| [T-021](./T-021.md) | Remove dead exports in romaji.js and syllable-color.js | coloring | delete, over-engineering | ponytail-audit |
| [T-023](./T-023.md) | De-duplicate the romaji test cases into one shared array | romaji | shrink, test | ponytail-audit |
| [T-024](./T-024.md) | Delete no-op ternaries, duplicate object keys, dead normalize block and duplicate JSON key | boxes | delete, over-engineering | ponytail-audit |
| [T-026](./T-026.md) | De-duplicate common-kanji.json and common-kanji.js generated artifacts | build | delete, data | ponytail-audit, docs |
| [T-027](./T-027.md) | Decide fate of the orphan/noisy 15000-japanese-words.txt corpus | content | data, delete | data, ponytail-audit |
| [T-028](./T-028.md) | Fix or drop orphan first-100-most-common-words.md (mislabeled, contains symbols) | content | docs, data | data |
| [T-029](./T-029.md) | Replace inline onclick handlers with delegated listeners | core | maintainability | ponytail-audit |
| [T-042](./T-042.md) | Replace confirm() reset with an accessible confirmation | boxes | a11y | bug-hunt |
| [T-043](./T-043.md) | Replace title-only accessible names with aria-label/label | core | a11y | bug-hunt |
| [T-044](./T-044.md) | Add safe-area insets and viewport-fit=cover | core | a11y, responsive | bug-hunt |
| [T-048](./T-048.md) | Use logical CSS properties to allow future RTL/vertical locales | core | i18n | bug-hunt |
| [T-057](./T-057.md) | Reduce localStorage writes per card interaction | core | performance | bug-hunt |
| [T-058](./T-058.md) | Avoid painting both absolutely positioned card faces | core | performance | bug-hunt |
| [T-059](./T-059.md) | Update box lists incrementally on word edits | boxes | performance | bug-hunt |
| [T-063](./T-063.md) | Harden build-common-kanji.js (timeout, retries, fail on partial) | build | data-integrity | bug-hunt |
| [T-064](./T-064.md) | Stop build-boxes-data.js swallowing malformed JSON | build | data-integrity | bug-hunt |
| [T-071](./T-071.md) | Fix stale dates and broken cross-doc links | docs | docs | data |
| [T-073](./T-073.md) | Do not show developer build instructions in user-facing errors | core | bug, docs | bug-hunt |
| [T-076](./T-076.md) | Correct false invariants in README-tokenized.md | docs | docs | bug-hunt, data |
| [T-083](./T-083.md) | kana-charts dark mode shows a bright table-header band | kana | ui, a11y | ui-review |
| [T-084](./T-084.md) | index disabled activity cards are still activatable links | index | ui, a11y | ui-review |

## Nit (8)

| ID | Title | Area | Type | Source |
|----|-------|------|------|--------|
| [T-025](./T-025.md) | Remove commented-out dead code in tiny-segmenter.js | vendor | delete, nit | ponytail-audit |
| [T-030](./T-030.md) | Standardize the var/let/const baseline | core | nit, maintainability | ponytail-audit |
| [T-031](./T-031.md) | Delete or rotate the 34MB .cursor/debug.log workspace artifact | repo | nit | data |
| [T-050](./T-050.md) | Remove stale hardcoded year from example sentence | content | i18n, data, nit | data |
| [T-072](./T-072.md) | Standardize the token editor name across surfaces | editor | docs, nit | data |
| [T-074](./T-074.md) | Remove or hide decorative flag emoji in headings | flashcards | nit, a11y | bug-hunt |
| [T-075](./T-075.md) | Remove leftover commented-out markup in editor.html | editor | delete, nit | bug-hunt |
| [T-077](./T-077.md) | Repair stale absolute paths in .cursor plans after the repo rename | repo | docs, nit | data |
