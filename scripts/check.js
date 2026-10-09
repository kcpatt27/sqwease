/*
 * SQWease gate: the single command CI-less contributors and agents run.
 *
 *   node scripts/check.js
 *
 * Checks (no dependencies, no network):
 *   1. romaji conversion tests (run-romaji-test.js)
 *   2. syntax of every inline <script> in the root HTML pages
 *   3. presence of the generated data files the pages load
 *
 * Exit code 0 = pass. Non-zero = fail with a message naming the broken thing.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const root = process.cwd();
let failed = 0;

function fail(msg) { failed++; console.error('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }

// 1. romaji tests
try {
  const out = execFileSync(process.execPath, [path.join(root, 'run-romaji-test.js')], { encoding: 'utf8' });
  const line = out.trim().split(/\r?\n/).pop();
  ok('romaji tests: ' + line);
} catch (e) {
  fail('romaji tests: ' + (e.stdout || '') + (e.stderr || '') + e.message);
}

// 2. inline script syntax
const htmlFiles = fs.readdirSync(root).filter(function (f) { return f.endsWith('.html'); });
let inlineCount = 0;
for (const f of htmlFiles) {
  const html = fs.readFileSync(path.join(root, f), 'utf8');
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m; let n = 0;
  while ((m = re.exec(html))) {
    if (/\bsrc\s*=/.test(m[1] || '')) continue;
    const body = m[2];
    if (!body.trim()) continue;
    n++; inlineCount++;
    try { new vm.Script(body, { filename: f + '#inline' + n }); }
    catch (err) { fail(f + ' inline script #' + n + ': ' + err.message); }
  }
}
ok('inline scripts checked: ' + inlineCount + ' across ' + htmlFiles.length + ' pages');

// 3. generated data presence
const required = [
  'flashcards-vocab.js',
  'boxes-data.js',
  'content/common-kanji.js'
];
for (const r of required) {
  if (!fs.existsSync(path.join(root, r))) fail('missing generated data file: ' + r);
}
if (!failed) ok('generated data present');

if (failed) {
  console.error('\n' + failed + ' check(s) failed.');
  process.exit(1);
}
console.log('\nAll checks passed.');
