# SQWease Roadmap

## Vision Statement

SQWease aims to become the most efficient way to learn any language, by combining comprehensive input (images, audio, context) with scientifically-backed spaced repetition. Our goal is to help learners master the 2500 most common words—covering 80-90% of everyday conversation—in 3-6 months of consistent practice.

**What problem does it solve?** Traditional language learning apps either focus on rote memorization (boring) or lack proper spaced repetition (inefficient). SQWease combines engaging, multi-modal learning with optimal review timing.

**Who is it for?** Travelers preparing for trips, students learning languages, self-learners seeking efficient methods, and anyone who wants to maximize learning ROI.

**What success looks like in 1-2 years?** A polished web and mobile app supporting 5+ languages, with 10,000+ active users who report 80%+ retention rates and complete the 2500-word curriculum within 6 months.

## Current Status

- **Latest Version:** v0.1 (Pre-alpha)
- **Release Date:** March 2026 (initial development)
- **Key Milestones Completed:**
  - Basic flashcard interface with flip animations
  - First 263 Japanese words with pronunciation, definitions, and example sentences
  - CSV export format for Anki compatibility
  - Keyboard navigation and shuffle mode
  - Project documentation structure

- **Metrics:**
  - Vocabulary coverage: 263/2500 words (10.5%)
  - Features complete: 7 core features
  - Codebase: ~580 lines (HTML/CSS/JS)
  - Documentation: README, PROJECT_SPECS, ARCHITECTURE, ROADMAP complete

## Recently completed (from product backlog)

- **Kana charts:** Main menu card + page (Gojuon grid, row color-coding, monographs/diacritics/digraphs).
- **Kanji section:** Main menu card + kanji.html — Grade 1+2 list (240 common kanji from kanjiapi.dev), Personal list (localStorage), lookup by character/meaning/reading, add/remove personal entries.
- **Boxes cards:** Front = Japanese + Romaji; back = Japanese + Romaji + English; token-based coloring when tokenized data present; deck version and optional register label.
- **Syllable color-coding:** Token-based when `item.tokens` exists (`colorizeByTokens`); otherwise word-based with particle-aware fallback. Applied on Flashcards (word, pronunciation, definition), Boxes (front/back), Kanji list (character, readings).
- **Tokenization:** Romaji standard (`romaji.js`), tokenized sentence schema (`content/README-tokenized.md`), `boxes-tokenized.json` + build pipeline, token editor (`editor.html` with add/remove sentence/token, TinySegmenter, register/lemma, export JSON/CSV).
- **Romaji phase toggle:** Boxes and Flashcards — Phase 1 (romaji + EN), Phase 2 (no romaji), Phase 3 (Japanese only); preference in `sqwease-romaji-phase`.
- **Index:** Separate h1 for mobile (“SQWease · JP”) vs PC/tablet (“Speak Quite Well with Ease · Japanese”) via CSS at 600px breakpoint.

## Planned (from product backlog)

- **Kanji pictures:** Optional images for Kanji entries (deferred).
- **Audio / Image:** See Now section below.

## Now (Next 4 weeks)

### Spaced Repetition Algorithm Implementation
**Why**: This is the core differentiator. Without proper spaced repetition, SQWease is just another flashcard app. The SM-2 algorithm (or similar) will ensure words are reviewed at optimal intervals for long-term retention.

**Impact**: Transforms the app from a simple flashcard tool into a scientifically-backed learning system. Expected to improve retention rates from ~30% (typical flashcard apps) to 80%+ (proper spaced repetition).

**Status**: Planned

**Effort**: ~1-2 weeks

### Audio Pronunciation Integration
<!-- small browser ai + Whisper??? -->
**Why**: Comprehensive input requires audio. Many learners struggle with Japanese pronunciation, and hearing native pronunciation is essential for proper learning. This addresses a critical gap in the current text-only approach.

**Impact**: Enables true comprehensive input learning. Expected to improve pronunciation accuracy by 40% and overall word recognition by 25%.

**Status**: Planned

**Effort**: ~1 week (integration with text-to-speech API)

### Image Association System
**Why**: Visual learning is a key component of comprehensive input. Associating words with images creates stronger memory connections than text alone. This is especially valuable for concrete nouns.

**Impact**: Improves retention for visual learners (estimated 30% of users). Makes learning more engaging and memorable.

**Status**: Planned

**Effort**: ~1 week (image sourcing/integration)

### UI/UX Improvements
**Why**: Current interface is functional but basic. Better styling, responsiveness, and user experience will make the app more enjoyable to use daily.

**Impact**: Increases daily active usage by 20-30% through improved usability and visual appeal.

**Status**: Planned

**Effort**: ~3-5 days

## Next (Months 2-3)

### Backend API for Progress Tracking
**Why**: Currently, progress resets on page refresh. Users need persistent tracking across sessions to maintain motivation and see long-term progress.

**Impact**: Enables multi-device usage and long-term learning journeys. Critical for user retention.

**Blocked by**: Completing spaced repetition algorithm (need to know what data to track)

**Effort**: ~2 weeks

### User Authentication and Profiles
**Why**: Personalization requires user accounts. Each learner has different strengths/weaknesses, and the system should adapt.

**Impact**: Enables personalized learning paths and progress analytics. Increases user engagement by 35%.

**Effort**: ~1-2 weeks

### Expand to Full 2500-Word Set
**Why**: Current implementation only has 263 words. Completing the full set is essential to deliver on the core value proposition.

**Impact**: Delivers complete learning curriculum. Enables users to achieve stated goal of mastering 2500 words.

**Effort**: ~1 week (data entry/validation)

### Mobile-Responsive Design
**Why**: Many users want to learn on phones/tablets. Current design is desktop-focused and doesn't work well on mobile.

**Impact**: Expands addressable user base. Mobile users typically have higher engagement (more frequent, shorter sessions).

**Effort**: ~1 week

### Spaced Repetition Scheduling
**Why**: Users need reminders when words are due for review. Without scheduling, spaced repetition loses effectiveness.

**Impact**: Ensures users review at optimal times. Improves retention rates by 15-20%.

**Effort**: ~1 week

## Later (Exploratory/Future)

### Multi-Language Support
**Description**: Expand beyond Japanese to support Spanish, French, German, Korean, etc. Each language would have its own 2500-word frequency list.

**Priority**: High (core value proposition expansion)

**Effort**: ~2-3 weeks per language (vocabulary data + validation)

### Advanced Analytics Dashboard
**Description**: Show learning patterns, retention rates, weak areas, time-to-mastery metrics. Help users understand their progress.

**Priority**: Medium (valuable but not essential for MVP)

**Effort**: ~2 weeks

### Offline PWA Support
**Description**: Make the app work offline as a Progressive Web App. Users can learn without internet connection.

**Priority**: Medium (nice-to-have for travelers)

**Effort**: ~1-2 weeks

### Community Features
**Description**: Shared decks, leaderboards, study groups. Social learning elements.

**Priority**: Low (post-MVP enhancement)

**Effort**: ~3-4 weeks

### AI-Powered Personalization
**Description**: Machine learning to adapt difficulty, suggest focus areas, predict retention issues.

**Priority**: Low (ambitious, requires significant data)

**Effort**: ~4-6 weeks

### Gamification Elements
**Description**: Streaks, achievements, levels, badges. Increase engagement through game mechanics.

**Priority**: Low (nice-to-have)

**Effort**: ~2 weeks

### Voice Recognition Practice
**Description**: Users speak words/phrases, app provides feedback on pronunciation accuracy.

**Priority**: Medium (valuable for speaking practice)

**Effort**: ~2-3 weeks

### Sentence Mining Integration
**Description**: Extract vocabulary from user-provided texts (articles, books) and create custom decks.

**Priority**: Low (advanced feature)

**Effort**: ~3-4 weeks

## Decision Framework

Priorities are set based on:

1. **Core Value Delivery**: Features that directly enable the core value proposition (spaced repetition, comprehensive input) get highest priority
2. **User Blockers**: Issues that prevent users from completing their learning journey (e.g., no progress tracking)
3. **Learning Science**: Evidence-based features that improve retention/engagement
4. **Technical Debt**: Infrastructure improvements that enable future features (e.g., backend before analytics)
5. **User Feedback**: Once we have users, their feedback will heavily influence priorities

## Risks & Dependencies

### External Dependencies
- **Text-to-Speech API**: Need reliable, affordable API for audio pronunciation. Risk: API changes, cost increases. Mitigation: Evaluate multiple providers, consider self-hosted solutions.
- **Image Sources**: Need high-quality, license-free images for vocabulary. Risk: Limited availability for some words. Mitigation: Use multiple sources, allow user-uploaded images.

### Resource Constraints
- **Solo Development**: Limited time to implement all features. Risk: Slow progress, burnout. Mitigation: Focus on MVP, prioritize ruthlessly, consider open-source contributions.
- **Data Validation**: Ensuring 2500-word lists are accurate and properly formatted. Risk: Errors in vocabulary data. Mitigation: Cross-reference multiple sources, community validation.

### Unknown Technical Challenges
- **Spaced Repetition Algorithm**: Implementation complexity, edge cases. Risk: Algorithm doesn't work as expected. Mitigation: Research existing implementations, test thoroughly, iterate.
- **Performance at Scale**: Current architecture may not handle many concurrent users. Risk: Slow load times, crashes. Mitigation: Load testing, optimization, consider architecture changes early.

## Success Metrics

### User Growth
- **Target**: 1,000 users within 6 months of public launch
- **Stretch**: 5,000 users within 12 months

### Feature Adoption
- **Audio Usage**: 70%+ of users utilize audio pronunciation
- **Spaced Repetition**: 80%+ of users complete reviews when scheduled
- **Full Curriculum**: 40%+ of users complete all 2500 words

### Learning Outcomes
- **Retention Rate**: 80%+ word retention after 30 days
- **Completion Time**: Average 3-6 months to complete 2500 words
- **Session Frequency**: 4-5 sessions per week average

### Performance Benchmarks
- **Page Load**: <2 seconds on 3G connection
- **Card Flip Animation**: <100ms response time
- **API Response**: <200ms for progress tracking (when implemented)

### Community Feedback
- **User Satisfaction**: 4.5+ stars (if rating system implemented)
- **Feature Requests**: Track most-requested features
- **Bug Reports**: <5 critical bugs per month

## Feedback & Iteration

### How Users Can Influence Roadmap

- **GitHub Issues**: Primary method for feature requests and bug reports
- **Email**: Direct feedback channel (to be added)
- **In-App Feedback**: Planned feature for collecting user suggestions

### Review Frequency

- **Weekly**: Review GitHub issues and prioritize
- **Monthly**: Update roadmap based on user feedback and technical learnings
- **Quarterly**: Major roadmap revision and planning

### Community Input Weight

- **High Priority**: Features requested by 10+ users or blocking user goals
- **Medium Priority**: Features that align with vision and have 3-5 user requests
- **Low Priority**: Nice-to-haves, single-user requests (unless easy to implement)

### Transparency

- Roadmap is public and updated monthly
- Major decisions documented in GitHub discussions
- Users can see what's planned and why

---

**Last Updated**: February 2026  
**Next Review**: March 2026
