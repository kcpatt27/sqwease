# SQWease

**A language learning app that combines comprehensive input with spaced repetition to master the 2500 most common words in any language.**

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture Overview](#architecture-overview)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [FAQ](#faq)

---

## Overview

SQWease (Speak Quite Well with Ease) is designed to help language learners efficiently master vocabulary through evidence-based learning methods. The app targets the 2500 most common words in any language—starting with Japanese—and combines three powerful learning techniques:

- **Comprehensive Input**: Learn words through images, audio, and contextual examples
- **Spaced Repetition**: Algorithm ensures words are reviewed at optimal intervals for long-term retention
- **Minimum Effective Value**: Focus on the most frequently used words to maximize learning efficiency

The project is currently in early development, with a basic flashcard interface and vocabulary data prepared for the first 263 most common Japanese words.

---

## Key Features

- **Flashcard Interface**: Interactive flip cards showing Japanese characters, pronunciation, definitions, and example sentences
- **Vocabulary Segmentation**: Words organized by frequency (targeting 2500 most common words)
- **Anki Integration**: CSV format compatible with Anki for spaced repetition
- **Multi-Modal Learning**: Designed to support images, audio, and visual symbols (planned)
- **Progress Tracking**: Visual progress indicators showing current position in vocabulary set
- **Keyboard Navigation**: Space/Arrow keys for quick card navigation
- **Shuffle Mode**: Randomize card order for varied practice
- **1-2-3 Boxes**: Conversation-first sentence patterns (Likes, Study, Routine, Wants, Because) with generated boxes and flip-card practice in the browser

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data Format**: CSV (compatible with Anki)
- **Vocabulary Source**: Frequency-based word lists (Japanese corpus)
- **Development Tools**: Cursor AI (Claude 3.5) for scaffolding

**Planned Additions:**
- Spaced repetition algorithm implementation
- Audio pronunciation integration
- Image association system
- Progressive Web App (PWA) capabilities
- Backend API for user progress tracking

---

## Quick start: use in browser

**Main menu**

- Open **`index.html`** in your browser. You’ll see a **main menu** with two options: **Flashcards** and **1-2-3 Boxes**. Click one to open that activity.

**Flashcards**

- From the menu, click **Flashcards** (or open **`flashcards.html`**). **1500 words** come from **`flashcards-vocab.js`** (same folder). When you deploy, the static host builds this file from the CSV—no manual step.

**1-2-3 Boxes (conversation practice)**

- From the menu, click **1-2-3 Boxes** (or open **`boxes.html`**). Data comes from **`boxes-data.js`** (same folder). When you deploy, the static host builds it from `content/boxes-config.json` and `content/boxes-words.json`—no manual step. Word lists and practice are saved in that browser (localStorage).

**Both in one place**

- Open **`index.html`** in your browser (or run a local server and open **http://localhost:8000**). The main menu lets you switch between Flashcards and 1-2-3 Boxes; each activity has a **← Menu** link to return.

**Share with friends / use on your phone — one link**

- **Deploy once, then share the link.** No zip, no “run this on your machine.” You get a URL; send it to anyone—they open it on their phone (or any browser) and practice. No install, no unzip.
- **How to deploy (GitHub Pages):** Push the repo. Run **`node scripts/build-flashcards-vocab.js`** and **`node scripts/build-boxes-data.js`** locally, commit **`flashcards-vocab.js`** and **`boxes-data.js`**, then push. In repo **Settings → Pages → Source:** “Deploy from a branch” → branch **main** (or **master**), folder **/ (root)**. Save; your site will be at **https://kcpatt27.github.io/sqwease/**.
- **Later:** The site is static HTML/JS; it can be deployed to [Cloudflare Pages](https://pages.cloudflare.com) or any static host (run the build scripts, then upload the folder).
- After deploy, open the site URL on your phone—Flashcards and 1-2-3 Boxes work; layout is responsive. Word lists and progress stay in that browser (localStorage).

**Other ways to run**

- **Same Wi‑Fi (no deploy):** On your computer: `python -m http.server 8000 --bind 0.0.0.0`. On your phone (same Wi‑Fi), open `http://<your-IP>:8000` (find IP with `ipconfig` / `ifconfig`).
- **Local only:** Open **`index.html`** in a browser. Keep **`flashcards-vocab.js`** and **`boxes-data.js`** in the same folder (generate with the scripts in `scripts/` if missing).

---

## Installation (detailed)

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- **To share with others:** Deploy to GitHub Pages (see Quick start); you get a URL. Share that link—no zip, no install. People open it on their phone and practice.
- **Local use:** Open `index.html`; keep **`flashcards-vocab.js`** and **`boxes-data.js`** in the same folder (generate with `node scripts/build-flashcards-vocab.js` and `node scripts/build-boxes-data.js` if missing).

### Setup

1. **Clone or download the project** (if not already):
   ```bash
   git clone https://github.com/kcpatt27/sqwease.git
   cd sqwease
   ```

2. **Build data (optional but recommended)**:
   - **Flashcards:** `node scripts/build-flashcards-vocab.js` → creates `flashcards-vocab.js` (1500 words).
   - **1-2-3 Boxes:** `node scripts/build-boxes-data.js` → creates `boxes-data.js` from `content/boxes-config.json` and `content/boxes-words.json`. (Config may use `boxes`/`boxType`; the app normalizes to `boxes`/`boxType` at runtime.)
3. **Open the app**:
   - Open **`index.html`** directly in your browser for menu, Flashcards, and 1-2-3 Boxes (no server needed if the `.js` data files are present).
   - Or start a local server and go to `http://localhost:8000`:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js
     npx http-server
     
     # PHP
     php -S localhost:8000
     ```

4. **No npm install** — the app runs entirely in the browser. The build scripts only generate JS data files for offline/share use.

---

## Usage

### Basic Flashcard Practice

1. Open `index.html` → click **Flashcards** (or open `flashcards.html` directly).
2. You'll see a flashcard showing a Japanese word (e.g., "の")
3. **Click the card** or press **Space** to flip and see:
   - Pronunciation (romaji)
   - Definition
   - Example sentence with translation
4. Use the navigation buttons or arrow keys:
   - **← Prev** / **Left Arrow**: Previous card
   - **Next →** / **Right Arrow**: Next card
   - **Shuffle**: Randomize card order

### Example Session

```
Card 1: の (no)
Flip to see: "possessive particle (like 's); connects nouns"
Example: 私の本です。 (It's my book.)

Card 2: に (ni)
Flip to see: "direction particle (to/at/in); location/time"
Example: 学校に行きます。 (I go to school.)
```

### Keyboard Shortcuts

- `Space` / `↑` / `↓`: Flip current card
- `→`: Next card
- `←`: Previous card

### 1-2-3 Boxes (Conversation practice)

1. Open **`boxes.html`** (or click **1-2-3 Boxes** from the main menu).
2. Choose a **set**: Likes and Dislikes, Studying and Work, Daily Routine, Wants and Plans, or Because.
3. **View list**: See all generated sentences (Box 1 = statement, Box 2 = yes/no question, Box 3 = open question).
4. **Practice**: Switch to “Practice (flip cards)” and click the card or press **Space** to flip (Japanese → romaji + English). Use **←** / **→** or buttons for prev/next.

Sentences are **generated** from word lists and box patterns. **Verbs** are a great place to start: Japanese has roughly 2,000–3,000 base verbs (plus many する-compounds). The app’s verbs are **cherry-picked** to match common English verbs (go, come, make, take, give, see, know, think, move, stay, change, etc.) plus motion/state verbs, so you get strong coverage for speaking and thinking. Each verb drives three phrase types (statement, yes/no question, open question) in the Routine and Wants sets. The practice pack has a **“Core verbs: learn these first”** section (Motion, State/change, Daily life, Mental/communication). Use the **Word lists** tab in `boxes.html` to add or remove nouns, verbs, places, and routine pairs; your changes are saved in this browser (localStorage). **Reset to defaults** restores the built-in lists. You can also edit **`content/boxes-words.json`** directly; the app loads from JSON on first visit, then uses saved data if present. The full method and drills are in **`content/1-2-3-boxes-practice-pack.md`**.

### Using with Anki

The vocabulary data is available in CSV format (`content/oneTo263-japanese-vocab.csv`) and can be imported into Anki for spaced repetition:

1. Open Anki
2. Create a new deck (e.g., "Japanese 2500")
3. File → Import
4. Select `content/oneTo263-japanese-vocab.csv`
5. Map columns: Word, Pronunciation, Definition, Example Sentence

---

## Architecture Overview

SQWease is currently a client-side application with a simple, modular structure designed for future expansion.

```
┌─────────────┐
│   Browser   │  User opens index.html
└──────┬──────┘
       │
┌──────▼──────────────┐
│  Frontend (HTML/JS)  │  Flashcard interface, vocabulary data
│                     │  - Card flip animations
│                     │  - Navigation controls
│                     │  - Progress tracking
└──────┬──────────────┘
       │
┌──────▼──────┐
│  CSV Data   │  Vocabulary lists organized by frequency
│  (Content)  │  - oneTo263-japanese-vocab.csv
│             │  - first-2500-words-for-fluency.txt
└─────────────┘
```

### Current Components

**Frontend (`index.html`)**
- Single-page application with embedded CSS and JavaScript
- Vocabulary array stored in JavaScript
- Card flip animation using CSS transforms
- Progress tracking and navigation logic

**Data Layer (`content/`)**
- CSV files for vocabulary import
- Text files with word frequency lists
- Structured for easy parsing and expansion

### Planned Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
┌──────▼──────────────┐
│  Frontend (React)   │  Interactive learning interface
│  - Flashcards       │  - Progress dashboard
│  - Spaced Rep       │  - Audio playback
└──────┬──────────────┘
       │ REST API
┌──────▼──────────────┐
│  Backend API        │  User progress, SRS algorithm
│  (Node.js/Express)  │  - Spaced repetition scheduling
└──────┬──────────────┘
       │
┌──────▼──────┐
│  Database   │  User data, progress tracking
│  (PostgreSQL)│  - Review history
│             │  - Mastery levels
└─────────────┘
```

---

## Documentation

- **Memory bank** (project context for AI and maintainers): [memory-bank/](memory-bank/). Key files: [activeContext.md](memory-bank/activeContext.md), [progress.md](memory-bank/progress.md).
- **Color alignment (Boxes / Flashcards):** [memory-bank/color-alignment-theory.md](memory-bank/color-alignment-theory.md) — how JA/romaji/EN coloring works and how it maps meaning across languages. Boxes coloring rules now live in dedicated `boxes-coloring.js` (Feb 2026 refactor).
- **Tokenized schema:** [content/README-tokenized.md](content/README-tokenized.md).

---

## API Documentation

Currently, SQWease is a client-side application with no API endpoints. Future API documentation will be available in `API.md` once the backend is implemented.

**Planned Endpoints:**
- `POST /api/reviews` - Submit review result (correct/incorrect)
- `GET /api/words/due` - Get words due for review
- `GET /api/progress` - Get user progress statistics
- `POST /api/users` - Create user account

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed feature planning.

### Current Status: **Early Development (~5% Complete)**

**Now (Next 2-4 weeks)**
- [ ] Implement spaced repetition algorithm (SM-2 or similar)
- [ ] Add audio pronunciation for each word
- [ ] Create image association system
- [ ] Improve UI/UX with better styling

**Next (Months 2-3)**
- [ ] Backend API for user progress tracking
- [ ] User authentication and profiles
- [ ] Expand to full 2500 word set
- [ ] Mobile-responsive design

**Later (Exploratory)**
- [ ] Multi-language support (beyond Japanese)
- [ ] Community features (shared decks, leaderboards)
- [ ] Advanced analytics (learning patterns, retention rates)
- [ ] Offline PWA support

---

## Contributing

Contributions are welcome! This project is in early stages, so there's plenty of room for improvement.

**Areas where help is needed:**
- Spaced repetition algorithm implementation
- Audio pronunciation integration
- UI/UX improvements
- Testing and bug fixes
- Documentation

**How to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure any code follows the existing style and includes comments for complex logic.

---

## License

This project is currently unlicensed. License information will be added once the project reaches a more stable state.

---

## FAQ

### Why 2500 words?

Research shows that the 2500 most common words in a language cover approximately 80-90% of everyday conversation. This "minimum effective value" approach maximizes learning efficiency.

### Why start with Japanese?

The creator is preparing for an upcoming trip to Japan and wanted a tool tailored to Japanese learning. The architecture is designed to support multiple languages in the future.

### How does this differ from Anki?

SQWease aims to integrate comprehensive input (images, audio, context) more seamlessly than traditional flashcard apps, while still supporting Anki import/export for users who prefer that workflow.

### Will there be a mobile app?

A Progressive Web App (PWA) is planned, which will work on mobile browsers and can be installed like a native app. A native mobile app may come later.

### Can I use this for languages other than Japanese?

The architecture is designed to be language-agnostic. Once the core features are complete, adding new languages will primarily involve adding vocabulary data files.

### How accurate is the vocabulary frequency data?

The word lists are based on Japanese corpus frequency analysis. The first 263 words are verified against multiple sources. The full 2500-word list will be validated before release.

### Is there a way to track my progress?

Currently, progress is session-based (shows current card position). User accounts and persistent progress tracking are planned for the next phase.

---

## Acknowledgments

- Vocabulary frequency data compiled from Japanese language corpora
- Learning methodology inspired by comprehensive input theory and spaced repetition research
- Initial structure generated by Cursor AI (Claude 3.5), reviewed and refined manually

---

**Status**: Early Development | **Last Updated**: January 2025
