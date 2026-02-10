# SRS (Spaced Repetition) status

## Implementation (Feb 2026)

- **Algorithm:** `srs.js` — simplified SM-2 style: 4 ratings (Again, Hard, Good, Easy), learning steps [1, 10] minutes, graduating interval 1 day, ease factor with min 1.3. Exposes `initCard`, `reviewCard`, `isDue`, `getIntervalDisplay`.
- **Flashcards:** `flashcards.html` uses SRS: card id `fc-{vocabIndex}`, localStorage key `sqwease-flashcards-srs`, daily new limit `newCardsPerDay`, `sqwease-flashcards-date` and `sqwease-flashcards-new-today` for new-cards-per-day. Due queue order: review → learning → new. Rating buttons show interval labels; `rateCard` saves updated card from `SRS.reviewCard(srsCard, rating)`.
- **Boxes:** No SRS yet; practice view has no scheduling or ratings.

## Verification (plan Phase 3)

- **Persistence:** Updated card from `reviewCard` is assigned to `srsCards[itemId]` and `saveSRS()` writes full object to localStorage. Correct.
- **Intervals:** Review phase uses `addDays` (days); learning uses `addMinutes(LEARNING_STEPS)`. `getIntervalDisplay` returns e.g. "1d", "4d", "<1m". Correct.
- **Due queue:** `buildDueQueue` includes only cards where `SRS.isDue(srsCard)` for learning/review; new cards limited by `newCardsIntroduced < newCardsPerDay`. Order review → learning → new. Correct.
- **Edge cases:** Again on review resets to learning and reschedules in minutes; graduation from learning to review on Good/Easy; ease factor clamped to EASE_MIN. Correct.

## Optional later

- Expose SRS constants (e.g. LEARNING_STEPS, newCardsPerDay) for tuning.
- Add SRS to Boxes practice view (card id by sentence or set+item, localStorage key for Boxes, rating buttons, due queue).
