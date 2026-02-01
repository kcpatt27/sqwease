# SQWease Architecture

## System Overview

SQWease is currently a client-side application that runs entirely in the browser. Users open `index.html` in their browser, and the application loads vocabulary data from an embedded JavaScript array. The flashcard interface allows users to flip cards, navigate through words, and practice vocabulary. All data and logic exist in a single HTML file with embedded CSS and JavaScript.

In the future, SQWease will evolve into a full-stack application with a backend API for user progress tracking, spaced repetition scheduling, and persistent data storage. The architecture is designed to support this evolution while maintaining simplicity in the current phase.

## Architecture Diagram

### Current Architecture (v0.1)

```
┌─────────────┐
│   Browser   │  User opens index.html directly or via local server
└──────┬──────┘
       │
┌──────▼──────────────────────────────┐
│  Single-Page Application             │
│  (index.html)                        │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  HTML Structure              │  │  Card container, controls, progress
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  CSS (Embedded)              │  │  Styling, animations, responsive
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  JavaScript (Embedded)       │  │  Vocabulary array, card logic,
│  │                               │  │  navigation, shuffle
│  └──────────────────────────────┘  │
└──────────────────────────────────────┘
       │
┌──────▼──────┐
│  CSV Files  │  Vocabulary data (for import/export)
│  (content/) │  - oneTo263-japanese-vocab.csv
│             │  - first-2500-words-for-fluency.txt
└─────────────┘
```

### Planned Architecture (Future)

```
┌─────────────┐
│   Browser   │  User accesses web app
└──────┬──────┘
       │ HTTPS
┌──────▼──────────────┐
│  Frontend (React)   │  Interactive learning interface
│  - Flashcards       │  - Progress dashboard
│  - Spaced Rep UI    │  - Audio playback
│  - User dashboard   │  - Settings
└──────┬──────────────┘
       │ REST API (JSON)
┌──────▼──────────────┐
│  Backend API        │  Node.js/Express
│  (Node.js/Express)  │  - Spaced repetition algorithm
│                     │  - User progress tracking
│                     │  - Authentication
│                     │  - Review scheduling
└──────┬──────────────┘
       │
┌──────▼──────┐
│  PostgreSQL │  User data, progress, review history
│  Database   │  - Users table
│             │  - Words table
│             │  - Reviews table
│             │  - Progress table
└─────────────┘
       │
┌──────▼──────┐
│  External   │  Text-to-speech API (pronunciation)
│  Services   │  Image CDN (vocabulary images)
└─────────────┘
```

## Key Components

### Frontend (Current: HTML/CSS/JS)

**Purpose:** User interface for vocabulary learning through flashcards

**Technology:** HTML5, CSS3, Vanilla JavaScript (no frameworks)

**Key Responsibilities:**
- Display flashcards with Japanese words, pronunciation, definitions, examples
- Handle card flip animations using CSS transforms
- Manage vocabulary array and current card index
- Provide navigation controls (prev, next, shuffle)
- Track and display progress (current card position)
- Support keyboard navigation (arrow keys, spacebar)

**Dependencies:**
- Modern web browser with JavaScript enabled
- No external dependencies (pure vanilla JS)

**Failure Mode:** If JavaScript fails or is disabled, the app won't function. The interface is entirely JavaScript-driven. Mitigation: Add basic HTML fallback or progressive enhancement in future versions.

**Hosted on:** Local file system or simple HTTP server (Python, Node.js, PHP)

### Vocabulary Data Layer (CSV Files)

**Purpose:** Store and provide vocabulary data in a format that's easy to edit and version control

**Technology:** CSV format, text files

**Key Responsibilities:**
- Store word lists organized by frequency
- Provide Anki-compatible export format
- Enable easy data entry and validation
- Support future database migration

**Dependencies:**
- Manual data entry and validation
- CSV parsing (currently done in JavaScript, future: backend parsing)

**Failure Mode:** If CSV files are corrupted or missing, vocabulary won't load. Mitigation: Validate CSV format, provide error handling, backup data files.

**Location:** `content/` directory

### Planned: Backend API (Node.js/Express)

**Purpose:** Handle business logic, user progress tracking, and spaced repetition algorithm

**Technology:** Node.js v18+, Express.js, planned: PostgreSQL

**Key Responsibilities:**
- Implement spaced repetition algorithm (SM-2 or similar)
- Store and retrieve user progress
- Schedule review reminders
- Handle user authentication
- Provide REST API endpoints for frontend

**Dependencies:**
- Database (PostgreSQL)
- Authentication service (JWT or OAuth)
- Text-to-speech API (for audio)

**Failure Mode:** If backend is down, users can't track progress or use spaced repetition features. Mitigation: Implement offline mode with local storage, graceful degradation.

**Hosted on:** GitHub Pages (static). Future: Cloudflare Pages or other static host; backend TBD (Railway, AWS, etc.).

### Planned: Database (PostgreSQL)

**Purpose:** Persist user data, progress tracking, and vocabulary data

**Technology:** PostgreSQL

**Key Tables (Planned):**
- `users` — User accounts and preferences
- `words` — Vocabulary data (2500 words per language)
- `reviews` — Review history and spaced repetition data
- `progress` — User progress per word (mastery level, last reviewed)
- `sessions` — Learning session logs

**Dependencies:**
- Database hosting (managed service or self-hosted)
- Backup strategy

**Failure Mode:** Database downtime prevents progress tracking. Mitigation: Regular backups, read replicas for scaling, local caching.

## Data Flow

### Current: Viewing a Flashcard

1. User opens `index.html` in browser
2. JavaScript loads vocabulary array from embedded data
3. `updateCard()` function sets current card index (default: 0)
4. Card displays Japanese word on front
5. User clicks card or presses Space
6. CSS class `is-flipped` toggles, revealing pronunciation, definition, example
7. User navigates with buttons or arrow keys
8. `nextCard()` or `prevCard()` updates `currentIndex`
9. `updateCard()` refreshes display with new word data

### Current: Shuffling Cards

1. User clicks "Shuffle" button
2. `shuffleCards()` function runs Fisher-Yates shuffle algorithm
3. Vocabulary array is randomized in-place
4. `currentIndex` resets to 0
5. `updateCard()` displays first card of shuffled deck

### Planned: Submitting a Review

1. User reviews a word and marks it correct/incorrect
2. Frontend sends `POST /api/reviews` with word ID and result
3. Backend runs spaced repetition algorithm to calculate next review date
4. Backend stores review in `reviews` table
5. Backend updates `progress` table with new mastery level
6. Backend returns next review date to frontend
7. Frontend updates UI to show progress

### Planned: Getting Words Due for Review

1. User opens app or scheduled review time arrives
2. Frontend requests `GET /api/words/due?userId=123`
3. Backend queries `progress` table for words where `nextReviewDate <= now()`
4. Backend applies spaced repetition algorithm to prioritize words
5. Backend returns list of words due for review
6. Frontend displays words in flashcard interface

## Technology Decisions

### Why HTML/CSS/JS (No Framework)?

**What was chosen:** Vanilla JavaScript with no build step or framework dependencies.

**Why:**
- **Rapid prototyping**: Can iterate quickly without build configuration
- **Simplicity**: Single file, easy to understand and modify
- **No dependencies**: Works immediately, no npm install or build process
- **Learning curve**: Easier for contributors to understand and modify
- **Performance**: No framework overhead, fast load times

**Alternatives considered:**
- **React**: Too much overhead for current simple use case. Will consider for future when complexity increases.
- **Vue.js**: Similar to React, unnecessary for current scope.
- **Svelte**: Interesting but adds build step complexity.

**Trade-offs:**
- **Pros**: Fast development, easy to deploy, no build step
- **Cons**: Harder to scale, no component reusability, manual DOM manipulation

### Why CSV for Vocabulary Data?

**What was chosen:** CSV files stored in `content/` directory.

**Why:**
- **Easy to edit**: Can edit in Excel, Google Sheets, or text editor
- **Version control friendly**: Git tracks changes easily
- **Anki compatible**: Can import directly into Anki
- **No database needed**: Works for current client-side architecture
- **Human readable**: Easy to validate and review

**Alternatives considered:**
- **JSON**: More structured but harder to edit manually
- **Database**: Overkill for current phase, will migrate later
- **Markdown**: Less structured, harder to parse

**Trade-offs:**
- **Pros**: Simple, editable, version controlled
- **Cons**: No relationships, limited querying, will need migration to database later

### Why No Backend (Yet)?

**What was chosen:** Client-side only, no server or database.

**Why:**
- **MVP focus**: Validate core learning experience before adding complexity
- **Deployment simplicity**: Can host on any static hosting (GitHub Pages, Cloudflare Pages)
- **No infrastructure costs**: Free hosting options available
- **Faster iteration**: No backend deployment pipeline needed

**Alternatives considered:**
- **Backend from start**: Would slow down initial development significantly
- **Serverless functions**: Considered but adds complexity without clear benefit yet

**Trade-offs:**
- **Pros**: Fast development, simple deployment, no server costs
- **Cons**: No progress tracking, no spaced repetition algorithm, no user accounts

**Migration plan:** When spaced repetition and progress tracking are needed, will add Node.js/Express backend with PostgreSQL database. Frontend will be refactored to React for better state management.

## Scalability

### Current Capacity

- **Users**: Single-user (no multi-user support yet)
- **Vocabulary**: 263 words (target: 2500)
- **Concurrent sessions**: N/A (client-side only)
- **Load time**: <100ms (single HTML file, ~50KB)

### Current Limitations

- **No horizontal scaling**: Not applicable (client-side only)
- **No caching**: Vocabulary loaded fresh each session
- **No CDN**: Static files served from single location
- **No database**: All data in memory (lost on refresh)

### Scaling Strategy (Future)

1. **Frontend**: 
   - CDN distribution (GitHub Pages, Cloudflare Pages) for static assets
   - Code splitting for faster initial load
   - Service worker for offline support

2. **Backend API**:
   - Horizontal scaling with load balancer
   - Stateless API design (JWT tokens, no server-side sessions)
   - Rate limiting to prevent abuse

3. **Database**:
   - PostgreSQL with read replicas for scaling reads
   - Connection pooling
   - Indexed queries for fast lookups

4. **Caching**:
   - Redis for frequently accessed data (user progress, word lists)
   - CDN caching for static assets
   - Browser caching for vocabulary data

5. **Performance**:
   - Lazy loading for images/audio
   - Pagination for large vocabulary sets
   - Optimistic UI updates

## Security

### Current Security Measures

- **None required**: Client-side only, no user data, no authentication
- **No sensitive data**: Vocabulary data is public knowledge

### Planned Security Measures

1. **Authentication/Authorization**:
   - JWT tokens for user sessions
   - Password hashing (bcrypt) for user accounts
   - OAuth support (Google, GitHub) for easy sign-in

2. **Data Encryption**:
   - HTTPS only (TLS 1.3)
   - Encrypted database connections
   - Sensitive user data encrypted at rest

3. **Secrets Management**:
   - Environment variables for API keys
   - No secrets in codebase
   - Secure key rotation

4. **Access Control**:
   - User can only access their own progress data
   - Rate limiting on API endpoints
   - Input validation and sanitization

5. **Data Privacy**:
   - GDPR compliance for user data
   - Clear privacy policy
   - User data export/deletion options

## Deployment

### Current Deployment

- **Environment**: Local development only
- **Method**: Open `index.html` in browser or use simple HTTP server
- **No CI/CD**: Not applicable (static file)
- **Infrastructure**: None (client-side only)

### Planned Deployment

1. **Environments**:
   - **Development**: Local machine with hot reload
   - **Staging**: Preview deployments (e.g. branch previews)
   - **Production**: Static hosting (GitHub Pages; future: Cloudflare Pages) + Backend (TBD)

2. **CI/CD Pipeline**:
   - **Frontend**: Automatic deployment on git push to main
   - **Backend**: Automated tests → Build → Deploy to staging → Manual approval → Production
   - **Database migrations**: Automated with version control

3. **Infrastructure**:
   - **Frontend**: Vercel or Netlify (static hosting, CDN, automatic HTTPS)
   - **Backend**: Railway, Render, or AWS (TBD based on cost/features)
   - **Database**: Managed PostgreSQL (Railway, Supabase, or AWS RDS)

4. **Monitoring/Alerting**:
   - Error tracking (Sentry)
   - Performance monitoring (optional; e.g. Cloudflare Web Analytics)
   - Uptime monitoring (UptimeRobot or similar)
   - User analytics (privacy-respecting, like Plausible)

## Future Improvements

### Known Limitations to Address

1. **No Progress Persistence**: Progress resets on refresh
   - **Solution**: Backend API with database storage
   - **Timeline**: Next phase (months 2-3)

2. **No Spaced Repetition**: Just sequential flashcards
   - **Solution**: Implement SM-2 algorithm in backend
   - **Timeline**: Current phase (next 4 weeks)

3. **Hardcoded Vocabulary**: Words in JavaScript array
   - **Solution**: Move to database, load via API
   - **Timeline**: Next phase (months 2-3)

4. **No Audio**: Text-only learning
   - **Solution**: Integrate text-to-speech API
   - **Timeline**: Current phase (next 4 weeks)

5. **Desktop-Only**: Not optimized for mobile
   - **Solution**: Responsive design, mobile-first approach
   - **Timeline**: Next phase (months 2-3)

### Planned Refactors

1. **Frontend Framework Migration**: Move from vanilla JS to React
   - **Why**: Better state management, component reusability, easier to scale
   - **When**: When adding backend integration (months 2-3)

2. **Data Layer Migration**: Move from CSV to database
   - **Why**: Better querying, relationships, validation
   - **When**: When implementing backend (months 2-3)

3. **Component Architecture**: Break single file into modules
   - **Why**: Better maintainability, testability
   - **When**: Before adding significant features

### Scaling Bottlenecks to Address

1. **Vocabulary Loading**: Currently loads all words at once
   - **Mitigation**: Lazy loading, pagination, virtual scrolling

2. **Image/Audio Assets**: Large file sizes for 2500 words
   - **Mitigation**: CDN, compression, lazy loading, progressive loading

3. **Database Queries**: Review scheduling queries may be slow
   - **Mitigation**: Proper indexing, caching, query optimization

4. **API Response Times**: Spaced repetition calculations
   - **Mitigation**: Caching, background jobs, optimized algorithms

## Next Steps

See [ROADMAP.md](ROADMAP.md) for detailed feature planning and timeline.

**Immediate priorities:**
1. Implement spaced repetition algorithm
2. Add audio pronunciation
3. Improve UI/UX
4. Plan backend architecture for progress tracking

---

**Last Updated**: January 2025  
**Architecture Version**: v0.1 (Client-side only)
