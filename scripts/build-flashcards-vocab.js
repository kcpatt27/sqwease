const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'content', 'japanese-fluency-vocab.csv');
const text = fs.readFileSync(csvPath, 'utf8');
const lines = text.split(/\r?\n/).filter(function(l) { return l.length > 0; });
const out = [];
const MAX = 1500;

// All-kana regex (hiragana U+3040-309F, katakana U+30A0-30FF)
function isAllKana(str) {
  return /^[\u3040-\u309f\u30a0-\u30ff]+$/.test(str || '');
}

for (let i = 0; i < Math.min(MAX, lines.length); i++) {
  const line = lines[i];
  const parts = [];
  let cur = '';
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (c === ',') {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  parts.push(cur.trim());
  if (parts.length >= 4) {
    const w = parts[0];
    const p = parts[1];
    const d = parts[2];
    const s = parts.slice(3).join(',').trim();
    const item = { w, p, d, s };
    if (isAllKana(w)) {
      item.tokens = [{ ja: w, kana: w, romaji: p, en: d, start: 0, end: w.length }];
    }
    out.push(item);
  } else if (parts.length >= 3) {
    const w = parts[0];
    const p = parts[1];
    const d = parts[2];
    const item = { w, p, d, s: '' };
    if (isAllKana(w)) {
      item.tokens = [{ ja: w, kana: w, romaji: p, en: d, start: 0, end: w.length }];
    }
    out.push(item);
  }
}

const js = 'const FLASHCARDS_VOCAB = ' + JSON.stringify(out) + ';\n';
const outPath = path.join(__dirname, '..', 'flashcards-vocab.js');
fs.writeFileSync(outPath, js, 'utf8');
console.log('Wrote', out.length, 'words to flashcards-vocab.js (same folder as flashcards.html)');
