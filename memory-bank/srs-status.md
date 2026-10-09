# SRS (Spaced Repetition) status

## Implementation

- **Algorithm:** `srs.js` — simplified SM-2 style: 4 ratings (Again, Hard, Good,
  Easy), learning steps `[1, 10]` minutes, graduating interval 1 day, ease factor
  with min 1.3. Exposes `initCard`, `reviewCard`, `isDue`, `getIntervalDisplay`.
- **Flashcards:** `flashcards.html` uses SRS (card id from the deck item's stable
  id; on `main` it is still derived from the array index — T-061), localStorage
  key `sqwease-flashcards-srs`, daily new limit `newCardsPerDay`.
- **Boxes:** SRS implemented (key `sqwease-boxes-srs`); practice view has ratings
  and a due queue.

## Known weaknesses

- **Uncapped intervals (T-009):** repeated Easy grows the interval without bound
  and can throw `RangeError: Invalid time value`.
- **Day keys (T-010):** `main` uses a locale-formatted `toDateString()` key; the
  UI branch moved it to an ISO date.
- **Card ids (T-061):** `main` derives ids from array position / sentence text;
  rebuilds or reordering can orphan progress.
- **Constants not tunable:** `LEARNING_STEPS` and `newCardsPerDay` are hardcoded.

## Verification

- Manual + `node scripts/check.js` covers romaji/syntax only; SRS math has no
  automated tests yet (T-065).
- The `main` write path does not guard `localStorage` quota (T-012); the UI
  branch routes reads/writes through a safe storage helper.

## Last updated

2026-10-09.
