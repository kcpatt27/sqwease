# SQWease Specifications

## Project Vision

A language learning application that combines comprehensive input with spaced repetition to help learners efficiently master the 2500 most common words in any language, starting with Japanese. The app targets travelers, students, and self-learners who want maximum learning efficiency through evidence-based methods.

## Current Status

- **Version:** Pre-alpha (v0.1)
- **Completion:** ~5% complete
- **Last Updated:** January 2026
- **Availability:** Private (early development)

## Technology Stack

- **Backend:** None (currently client-side only)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Database:** CSV files (vocabulary data), planned: PostgreSQL for user progress
- **External APIs:** None currently, planned: Text-to-speech API for pronunciation
- **Hosting:** Local development, planned: Static hosting (Vercel/Netlify) + backend (TBD)
- **AI Tools Used:** Cursor (Claude 3.5 for scaffolding and documentation)

## Key Features (Completed)

- [x] Basic flashcard interface with flip animation
- [x] Vocabulary data for first 263 most common Japanese words
- [x] CSV export format compatible with Anki
- [x] Keyboard navigation (arrow keys, spacebar)
- [x] Progress tracking (current card position)
- [x] Shuffle mode for randomized practice
- [x] Example sentences with translations for each word

## Features In Progress

- [ ] Spaced repetition algorithm implementation (SM-2 or similar) — Core feature for retention
- [ ] Audio pronunciation integration — Essential for comprehensive input
- [ ] Image association system — Visual learning support
- [ ] Improved UI/UX with better styling and responsiveness

## Planned Features

- [ ] Backend API for user progress tracking — Enable persistent learning across sessions
- [ ] User authentication and profiles — Personalize learning experience
- [ ] Full 2500-word vocabulary set — Complete the target word list
- [ ] Mobile-responsive design — Access learning on any device
- [ ] Spaced repetition scheduling — Automatic review reminders
- [ ] Multi-language support — Expand beyond Japanese
- [ ] Analytics dashboard — Track learning patterns and retention rates
- [ ] Offline PWA support — Learn without internet connection

## Key Decisions

- **Why start with HTML/CSS/JS?** Rapid prototyping without build complexity. Allows quick iteration on core flashcard functionality before adding backend complexity.
- **Why CSV format?** Easy to edit, version control friendly, and compatible with Anki for users who prefer that workflow. Can be migrated to database later.
- **Why 2500 words?** Research shows this covers 80-90% of everyday conversation—the "minimum effective value" for language learning efficiency.
- **Why comprehensive input + spaced repetition?** Combines two proven learning methods: contextual understanding (comprehensive input) with optimal review timing (spaced repetition) for maximum retention.

## Success Metrics

- **Learning Efficiency:** Users master 2500 words within 3-6 months of consistent practice
- **Retention Rate:** 80%+ word retention after 30 days without review
- **User Engagement:** Average session length of 10-15 minutes, 4-5 sessions per week
- **Feature Adoption:** 70%+ of users utilize audio pronunciation feature
- **Completion Rate:** 40%+ of users complete the full 2500-word set

## Known Limitations

- **No persistent progress tracking** — Progress resets on page refresh (planned for next phase)
- **No spaced repetition algorithm** — Currently just sequential/flashcard mode (core feature in progress)
- **Limited to 263 words** — Full 2500-word set not yet implemented
- **No audio pronunciation** — Text-only learning currently (audio integration planned)
- **No image associations** — Visual learning not yet implemented
- **Desktop-only optimized** — Mobile responsiveness needs improvement
- **No user accounts** — Can't track progress across devices (planned for backend phase)
- **Static vocabulary** — Words are hardcoded in JavaScript (will move to database/API)

## Important URLs/Credentials

- **GitHub repo:** https://github.com/kcpatt27/sqwease (private)
- **Local development:** `http://localhost:8000` (when using local server)
- **Documentation:** See README.md, ARCHITECTURE.md, ROADMAP.md
