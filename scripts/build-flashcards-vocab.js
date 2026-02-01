const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'content', 'japanese-fluency-vocab.csv');
const text = fs.readFileSync(csvPath, 'utf8');
const lines = text.split(/\r?\n/).filter(function(l) { return l.length > 0; });
const out = [];
const MAX = 1500;

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
    out.push({
      w: parts[0],
      p: parts[1],
      d: parts[2],
      s: parts.slice(3).join(',').trim()
    });
  } else if (parts.length >= 3) {
    out.push({ w: parts[0], p: parts[1], d: parts[2], s: '' });
  }
}

const js = 'const FLASHCARDS_VOCAB = ' + JSON.stringify(out) + ';\n';
const outPath = path.join(__dirname, '..', 'flashcards-vocab.js');
fs.writeFileSync(outPath, js, 'utf8');
console.log('Wrote', out.length, 'words to flashcards-vocab.js (same folder as flashcards.html)');
