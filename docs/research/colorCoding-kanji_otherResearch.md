To keep your material accurate and consistent for other learners, you’ll want to lock down: segmentation, romaji conventions, data workflow, and review/QA practices. [migaku](https://migaku.com/blog/japanese/japanese-learning-mistakes)

Below is a consolidated improvement plan, including the earlier technical suggestions, but **without** the kanji list.

### Implementation status (Feb 2026)

Implemented in this project:

- **A.1** — `romaji.js`: modified Hepburn (`kanaToRomaji`), particle/polite sets, `isParticleToken()`, `containsKanji()`, `shouldColorToken()`. Romaji derived from kana.
- **A.2** — Romaji phase toggle on Boxes and Flashcards (Phase 1/2/3); preference in `sqwease-romaji-phase`.
- **B.3** — Tokenized schema and data: `content/README-tokenized.md`, `content/boxes-tokenized.json`, `scripts/build-boxes-data.js` → `BOXES_TOKENIZED_SENTENCES` / `BOXES_TOKENIZED_VERSION`.
- **B.4** — TinySegmenter in `editor.html` to pre-fill token boundaries (Pre-fill tokens button).
- **C.6** — Particle/polite lists and `isParticleToken()` in `romaji.js`; coloring by `shouldColorToken`.
- **C.7** — Particle-aware segment-length fallback in `syllable-color.js` when token data is absent.
- **E.11** — Token editor (`editor.html`): load/edit JSON, token table, mark as checked, add/remove sentence and token.
- **E.12** — Export CSV for spot-check (Japanese, romaji, English, register, checked).
- **E.13** — Sentence/deck `version` and `lastUpdated`; deck version shown in Boxes.
- **F.14** — Optional `register` on sentences; editor dropdown; optional label on Boxes.
- **F.16** — Optional token `lemma`; editor column.
- **G.1–4** — Define standards → restructure data → build editor → wire learner UI (Boxes + Flashcards).

Not yet implemented: B.5 (MeCab-WASM builder), D.8–9 (process only), F.15 (pitch/audio), add/remove persistence to server.

***

## A. Lock down your writing system policy

### 1. Define a romaji standard and stick to it

Mixed romaji systems are a classic source of confusion for learners. [mochidemy](https://mochidemy.com/support/everything-about-romaji-in-japanese-learning/)

- Pick **modified Hepburn** for learners (what textbooks and most online resources use). [japanesewithanime](https://www.japanesewithanime.com/2017/12/romaji-systems-hepburn-nihon-kunrei.html)
- Decide your rules for:
  - じ / ぢ / ず / づ (usually ji/ji/zu/zu for learners). [japanesewithanime](https://www.japanesewithanime.com/2017/12/romaji-systems-hepburn-nihon-kunrei.html)
  - Long vowels (e.g., こう → `kou` or `kō`; こー → `koo` or `kooh`). [japanesewithanime](https://www.japanesewithanime.com/2017/12/romaji-systems-hepburn-nihon-kunrei.html)
  - ん before vowels (e.g., こんや → `kon’ya`). [japanesewithanime](https://www.japanesewithanime.com/2017/12/romaji-systems-hepburn-nihon-kunrei.html)

Concrete step:

- Create a `kanaToRomaji()` function that implements *your* Hepburn mapping and use that everywhere (never hand‑type romaji).  
- In your data, store **kana reading per token**, then auto‑generate romaji from that, which eliminates human typos.

### 2. Gradual de‑emphasis of romaji

Over‑reliance on romaji is a common beginner trap; it slows script acquisition. [facebook](https://www.facebook.com/japaninmyeyes.jp/posts/avoid-these-mistakes-before-learning-japanese-only-using-romaji-not-learning-kan/857168050037388/)

- Long‑term, add a toggle:
  - Phase 1: Kanji + romaji + English (your current plan).  
  - Phase 2: Kanji + kana + English (no romaji).  
  - Phase 3: Kanji + kana only (context or Japanese definitions).

This doesn’t change your current build, but influences how you structure data (always store kana, romaji is derived).  

***

## B. Data and segmentation workflow

### 3. Use explicit token alignment in your data

Implicit, proportional splitting is fragile; explicit alignment is safer. [unseen-japan](https://unseen-japan.com/sentence-mining-japanese-how-to/)

Adopt a per‑sentence JSON like:

```json
{
  "id": "ex-0001",
  "ja": "私はコーヒーが好きです。",
  "romaji": "watashi wa koohii ga suki desu.",
  "en": "I like coffee.",
  "tokens": [
    {
      "ja": "私",
      "kana": "わたし",
      "romaji": "watashi",
      "en": "I",
      "start": 0,
      "end": 1,
      "pos": "noun",
      "isParticle": false
    },
    {
      "ja": "は",
      "kana": "は",
      "romaji": "wa",
      "en": null,
      "start": 1,
      "end": 2,
      "pos": "particle",
      "isParticle": true
    },
    {
      "ja": "コーヒー",
      "kana": "こーひー",
      "romaji": "koohii",
      "en": "coffee",
      "start": 2,
      "end": 6,
      "pos": "noun",
      "isParticle": false
    },
    {
      "ja": "が",
      "kana": "が",
      "romaji": "ga",
      "en": null,
      "start": 6,
      "end": 7,
      "pos": "particle",
      "isParticle": true
    },
    {
      "ja": "好き",
      "kana": "すき",
      "romaji": "suki",
      "en": "like",
      "start": 7,
      "end": 9,
      "pos": "adjective",
      "isParticle": false
    },
    {
      "ja": "です",
      "kana": "です",
      "romaji": "desu",
      "en": null,
      "start": 9,
      "end": 11,
      "pos": "copula",
      "isParticle": true
    }
  ]
}
```

This guarantees:

- You know exactly which characters to color (kanji‑containing tokens where `!isParticle`).  
- You can generate romaji **from kana**; if you ever change romaji style, you just re‑run the converter, not the whole dataset.

### 4. Use TinySegmenter as a lightweight helper

TinySegmenter is small and good enough to avoid splitting inside obvious words. [github](https://github.com/leungwensen/tiny-segmenter)

Usage:

```js
import { TinySegmenter } from '@birchill/tiny-segmenter';
const segmenter = new TinySegmenter();
const tokens = segmenter.segment('私はコーヒーが好きです');
// -> ['私', 'は', 'コーヒー', 'が', '好き', 'です']
```

How to use it:

- Use it in **your internal “authoring” page** (still client‑side HTML/JS) when you add sentences:
  - Run TinySegmenter on new Japanese sentences.  
  - Let the tool pre‑fill `tokens[]` and `start`/`end`.  
  - You fill in kana, English, and confirm or fix segments by hand before exporting JSON.

This keeps the learner‑facing app simple but gives you semi‑automated, consistent segmentation.

### 5. Optional: MeCab‑WASM for higher‑accuracy preprocessing

MeCab in WASM gives you morphological analysis and POS tags. [birchlabs.co](https://birchlabs.co.uk/wasm)

- Use something like `@u1f992/mecab-wasm` or the `mecab-web-worker` wrapper to get tokens plus POS and often character offsets. [github](https://github.com/leyhline/mecab-web-worker)
- Run it in a separate “builder” HTML page:
  - Input Japanese sentence.  
  - MeCab returns tokens: surface, POS, reading, etc.  
  - Auto‑fill:
    - `tokens[].ja` (surface),  
    - `tokens[].kana` (reading in kana),  
    - `tokens[].pos`,  
    - `isParticle` when POS is particle/auxiliary.  
  - Then your script computes romaji from kana.

Because WASM + dictionaries are several MB, it’s nice to keep them out of the learner‑facing bundle and only use them while authoring. [libraries](https://libraries.io/npm/@u1f992%2Fmecab-wasm)

***

## C. Particle‑aware coloring and heuristics

### 6. Maintain explicit particle / polite ending lists

Common beginner errors involve particles and polite forms, so you want them clear but uncolored (visually separate from meaning words). [en.wikipedia](https://en.wikipedia.org/wiki/Japanese_particles)

Keep sets:

```js
const PARTICLES_ROMAJI = new Set([
  'ga', 'wa', 'o', 'wo', 'ni', 'e', 'de', 'to',
  'kara', 'made', 'yori', 'mo', 'no', 'ya', 'ka',
  'ne', 'yo', 'nado', 'shika', 'dake'
]);

const POLITE_ROMAJI = new Set([
  'desu', 'deshita', 'da', 'masu', 'mashita',
  'masen', 'masen deshita', 'datta'
]);
```

And in your JS:

```js
function isParticleToken(token) {
  if (token.isParticle !== undefined) return token.isParticle;
  const r = token.romaji.toLowerCase();
  return PARTICLES_ROMAJI.has(r) || POLITE_ROMAJI.has(r);
}
```

Then the coloring rule is simply:

```js
const shouldColor = (token) =>
  /[\u4e00-\u9faf]/.test(token.ja) && !isParticleToken(token);
```

This keeps your UI logic dead simple and predictable.

### 7. Better fallback when segmentation fails

If you still need a purely proportional fallback sometimes:

- When the romaji word is a known particle, allocate **1–2 Japanese characters** for its segment, preferring 1 if there’s enough length left for other words.  
- This mirrors the fact that Japanese particles are almost always short (1 kana, occasionally 2–3 for things like から, まで).  

But once you have explicit token data, this fallback becomes rare.

***

## D. Accuracy of content (sentences, glosses, usage)

### 8. Choose sentence sources with high reliability

To avoid exposing learners to incorrect Japanese or weird textbook‑only phrases, you want “native‑like” sentences. [teamjapanese](https://teamjapanese.com/the-ultimate-list-of-japanese-language-learning-resources/)

Good strategies:

- Pull example sentences from:
  - Well‑reviewed textbooks or JLPT materials.  
  - Reputable websites that specialize in sentence mining and give context. [unseen-japan](https://unseen-japan.com/sentence-mining-japanese-how-to/)
- Avoid random “user‑generated” sentences unless they are vetted; research in Japanese shows that user text is noisier and harder for morphological tools precisely because of non‑standard forms and mistakes. [aclweb](https://www.aclweb.org/anthology/2021.naacl-main.438.pdf)

Practical workflow:

- For a sentence you like (from anime, drama, graded readers, etc.), cross‑check it:
  - Search the exact Japanese sentence and see if it appears on multiple native‑facing sites (blogs, Q&A, etc.).  
  - Optionally paste it into another dictionary / learner site to confirm meaning and reading.

### 9. Ensure translations are natural, not word‑for‑word weird

Sentence‑mining resources emphasize learning words in context with natural translations, not literal glosses that distort meaning. [unseen-japan](https://unseen-japan.com/sentence-mining-japanese-how-to/)

Rules of thumb:

- For the English line, prefer “what a native would say” over a literal translation:
  - 今日は暑いですね → “It’s hot today, isn’t it?” not “Today is hot, isn’t it?”  
- If you need literal alignment for color‑matching:
  - Store a **literal gloss** per token (`en` in `tokens[]`) but show the **natural sentence** as the main English line.

This way you get the best of both: accurate mapping for colors, natural target language for meaning.

### 10. Handle romaji/kana correctness systematically

Research and teaching resources note that romaji can create bad habits if inconsistent or mis‑pronounced. [migaku](https://migaku.com/blog/japanese/japanese-learning-mistakes)

To reduce human error:

- Always derive romaji from kana via code, not by typing.  
- For tricky cases (long vowels, sokuon っ, ん before consonants), write tests:
  - E.g., feed in a list of known words (`がっこう`, `しんぶん`, `さんぽ`, etc.) and check that generated romaji matches your chosen standard.  
- Every time you change the converter, re‑run the tests and regenerate romaji for all cards.

***

## E. QA and review process

### 11. Build a tiny “authoring UI” for yourself

Even with good tools, human eyes are the last line of defense. [unseen-japan](https://unseen-japan.com/sentence-mining-japanese-how-to/)

Create a separate `editor.html` that:

- Loads the JSON file.  
- For each sentence:
  - Shows Japanese with token boundaries (e.g., brackets or colors).  
  - Shows romaji under each token.  
  - Shows English gloss per token and sentence translation.  
- Lets you click a token to:
  - Edit `romaji`, `kana`, or `en`.  
  - Toggle `isParticle`.  
- Has “Next / Previous” and a “mark as checked” flag.

This can be bare‑bones HTML + JS; you don’t need a framework.

### 12. Have a native or advanced speaker spot‑check

Research on grammar error detection in Japanese shows that automated systems can be precise but conservative; human evaluation remains crucial. [aclweb](https://www.aclweb.org/anthology/W19-4431.pdf)

- Once you have, say, 50–100 sentences, export them as a simple spreadsheet:
  - Japanese, romaji, English, and maybe the token breakdown.  
- Ask a native speaker or an advanced learner to:
  - Flag anything unnatural, overly stiff, or plain wrong.  
  - Correct particle mistakes or nuance issues.  
- Fix your JSON based on that feedback.

Even a single pass like this will dramatically increase the trustworthiness of your material.

### 13. Track versioning and avoid silent changes

You don’t want users practicing a sentence that silently changed.

- Add a `version` or `lastUpdated` field to each sentence.  
- If you change a sentence’s meaning or structure significantly, increment the version and optionally keep old ones in a separate file.  
- In your app, you can display the current dataset version (e.g., “Deck v1.3”) so students know they’re on the latest set.

***

## F. Design questions you weren’t explicitly asking

Here are some additional design questions that matter for accuracy and learning value, with suggested answers.

### 14. How to handle politeness and register

Beginners easily confuse formal vs casual, which can lead to inappropriate sentences in real life. [teamjapanese](https://teamjapanese.com/the-ultimate-list-of-japanese-language-learning-resources/)

- Decide a default register for your deck (probably **polite**: ～ます／です).  
- Mark each sentence with a `register` field (`"polite"`, `"casual"`, `"very-formal"`).  
- In UI, show a small indicator and maybe filter by register.

### 15. How to treat pitch accent and pronunciation

Ignoring pitch accent is a common beginner mistake, but you don’t have to model it fully right away. [migaku](https://migaku.com/blog/japanese/japanese-learning-mistakes)

- Short‑term: ensure **segment stresses** are clear in romaji (consistent representation of long vowels and double consonants).  
- Later: you could add audio or minimal pitch hints (even just “this word has two main patterns; both are acceptable” style notes), but that’s optional for now.

### 16. How to avoid “bad drilling” of isolated patterns

Sentence‑mining advice emphasizes context and varied usage, not repeating a single sentence in isolation. [youtube](https://www.youtube.com/watch?v=-eLpc3-eRW0)

- For each new word/kanji, aim for **2–3 different sentences** using it in slightly different contexts.  
- Tag tokens with a `lemma` (dictionary base form) and use that to ensure variation:
  - Example: for 好き, have one sentence with 好きです, another with 大好きです, another in a negative sentence, etc.

***

## G. Concrete implementation order (HTML + JS only)

Here’s a tight order of operations, combining everything:

1. **Define standards**
   - Choose modified Hepburn rules and codify them in a `kanaToRomaji()` function. [japanesewithanime](https://www.japanesewithanime.com/2017/12/romaji-systems-hepburn-nihon-kunrei.html)
   - Decide your particle/polite lists and implement `isParticleToken()`.

2. **Restructure data**
   - Convert your current sentences into the `sentence + tokens[]` JSON structure with `kana`, `romaji`, `en`, `start`, `end`, `pos`, `isParticle`.  
   - For now, do segmentation manually or with TinySegmenter aiding you.

3. **Build an internal editor page**
   - Pure HTML/JS page to load/edit JSON, show token breakdown, and mark items “verified”.  
   - Add a button “Recompute romaji from kana” that uses your converter.

4. **Wire up learner UI**
   - On your public app page:
     - Load JSON.  
     - For each sentence, render Japanese with spans per token, coloring by `containsKanji && !isParticleToken`.  
     - Render romaji and English aligned by token.

5. **Optional preprocessing upgrade**
   - Add `editor-mecab.html` that loads MeCab‑WASM to auto‑tag tokens and populate `kana`/`pos`/`isParticle` for new sentences. [github](https://github.com/leyhline/mecab-web-worker)

6. **QA**
   - Run through all sentences in the editor and verify.  
   - Export for a native/advanced speaker to spot‑check.  
   - Add `version` metadata and start using the deck with students.

If you want, next I can sketch a concrete `editor.html` + `app.html` skeleton (no frameworks, just HTML + JS) that implements the JSON structure, color mapping, and particle‑aware rendering so you can drop it into your project.