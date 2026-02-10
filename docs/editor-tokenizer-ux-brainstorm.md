# Tokenizer / sentence editor UX brainstorm

**Goal:** Make it easier to create and edit tokenized sentences (JA + romaji + EN) and control which tokens are combined and which get syllable colors. Current flow (load JSON → edit table → TinySegmenter pre-fill) is hard to discover and understand.

---

## Current pain points

- User must already have or paste **Japanese** text; no obvious path from “I want this English phrase” to a tokenized sentence.
- Token table is low-level: ja / kana / romaji / en per row. Useful for power users, overwhelming for “I just want to add a sentence.”
- TinySegmenter pre-fill is a separate step; boundaries may be wrong and it’s unclear how to **merge** or **split** tokens.
- No clear way to say “this word gets a color, this one doesn’t” without understanding isParticle / schema.

---

## Idea 1: English-first, then translate

**Flow:** User types a phrase in **English** (e.g. “What do you like?”) → we get **Japanese + romaji** → user edits from there.

**Pros:** Matches how many learners think (“I want to say X”).  
**Cons:** Need a translation source (API, or pre-defined list, or “paste JA yourself” as fallback).

**Variants:**

- **A) External API:** Call a translation API (e.g. Google Translate, DeepL, or a free JP↔EN API). We get JA (and maybe romaji from our own `Romaji.kanaToRomaji` if we only get kana). Then we run TinySegmenter + user can edit tokens.
- **B) Pre-defined / phrasebook:** Only allow sentences we already have in boxes-tokenized or a phrase list. User picks “What do you like?” from a dropdown/search → we load the existing tokenized sentence for editing.
- **C) Hybrid:** User can either type English (and we try to match or translate) or paste Japanese (current behavior).

---

## Idea 2: Visual “chunk” editor: merge and split

**Concept:** Show the sentence as a row of **chips** (one per token). User can:

- **Merge:** Select two (or more) adjacent chips → “Merge” → they become one token (one color, one “word” in EN).
- **Split:** Select one chip → “Split” (e.g. at cursor or by sub-segments) → becomes two tokens.

So “which tokens are combined” is decided by the user visually, not only by TinySegmenter.

**Pros:** Direct mapping to “one chip = one color unit”; easy to see what will be colored on Boxes.  
**Cons:** Need a clear rule for how “split” works (e.g. by character, or by running a segmenter and picking a boundary).

---

## Idea 3: Explicit “color this token” control

**Concept:** Each token has a **checkbox or toggle**: “Use syllable color” (or “Color in Boxes”). Default could follow current rules (kanji + not particle), but user can override: “don’t color this” or “color this even if it’s kana.”

**Pros:** No need to understand isParticle or schema; WYSIWYG.  
**Cons:** More UI; need to store this in the tokenized schema (e.g. `color: true/false` or `isParticle` as today).

---

## Idea 4: Two modes in the editor

- **Simple mode:** English (or phrase picker) → get JA + romaji → see one preview line (JA + romaji colored). Edit EN or JA in one place; “Accept” runs segmenter and creates tokens. Optional: “Edit tokens” to switch to advanced.
- **Advanced mode:** Current table view: edit ja/kana/romaji/en per token, merge/split, isParticle, export JSON.

So we don’t remove power; we add a simpler path and a clear “edit tokens” when they want to tweak boundaries or coloring.

---

## Idea 5: Translation source (practical options)

If we do English-first:

- **No backend:** Pre-defined list only (boxes-tokenized + maybe a few more). User picks from list or pastes JA. “Translate” could be “search in phrase list by EN.”
- **Free API:** e.g. MyMemory, LibreTranslate (if JP is supported), or a small proxy to a free tier. We’d need to handle rate limits and errors.
- **User pastes:** “Paste Japanese” and “Paste English” as two fields; we try to align (e.g. segment JA, then user assigns EN words or we do simple 1:1).

---

## Suggested next steps (for discussion)

1. **Short term:** Add **romaji** to the colored preview in the editor (done). Keep current table + TinySegmenter, but add a short “How to use” line: “Paste Japanese, click Pre-fill tokens, then edit kana/romaji/EN and merge/split as needed.”
2. **Medium term:** Add **Simple mode**: one field “English phrase” + one “Japanese (or paste)” with a “Get tokens” button that runs TinySegmenter and shows JA + romaji (colored). User can then click “Edit tokens” to open the table.
3. **Later:** Chunk UI (merge/split chips) and/or “color this token” override; optional translation (phrasebook first, API if we want).

---

*Document created from UX brainstorm; update as we decide on a direction.*
