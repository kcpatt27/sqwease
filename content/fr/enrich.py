# -*- coding: utf-8 -*-
"""
One-shot source generator for content/fr/source.tsv  (SQWease French deck).

This is NOT the runtime builder -- that is scripts/build-lang-vocab.js. This
script only regenerates the *source* TSV from open datasets. It is committed
here (rather than scripts/) so the French deck stays reproducible while the
runtime tree is untouched. See content/fr/README.md for URLs + licences.

Inputs expected in <workdir> (download commands in README.md):
  fr_50k.txt          Hermit Dave FrequencyWords 2018/fr        (CC BY-SA 4.0)
  Lexique400.zip      Lexique 4 (Lexique4/Lexique4.tsv)         (CC BY-SA 4.0)
  kaikki-fr.jsonl.gz  kaikki.org Wiktextract French extract     (CC BY-SA 3.0)
  fra-eng.zip         Tatoeba fra-eng via manythings.org        (CC BY 2.0 FR)

Deterministic: same inputs -> byte-identical source.tsv. No network, no randomness.
Usage:  python content/fr/enrich.py <workdir-with-inputs> <out.tsv> [N]
"""
import gzip, json, re, sys, zipfile, os

WORK = sys.argv[1] if len(sys.argv) > 1 else '.'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'source.tsv'
N = int(sys.argv[3]) if len(sys.argv) > 3 else 2500

def p(*a):
    print(*a)

# ---------------------------------------------------------------- 1. frequency
LET = r"[^\W\d_]"
TOKEN = re.compile(r"^(?=.*%s)%s(?:%s|['\u2019-])*%s$" % (LET, LET, LET, LET), re.U)
def valid(w):
    return len(w) >= 2 and bool(TOKEN.match(w))

ranked = []
seen = set()
with open(os.path.join(WORK, 'fr_50k.txt'), encoding='utf-8') as f:
    for line in f:
        parts = line.split()
        if len(parts) < 2:
            continue
        w = parts[0]
        if not valid(w) or w in seen:
            continue
        seen.add(w)
        ranked.append(w)
p('frequency: 50000 raw forms -> %d kept after filter+dedupe' % len(ranked))

# ---------------------------------------------------------------- 2. Lexique 4
zf = zipfile.ZipFile(os.path.join(WORK, 'Lexique400.zip'))
rows = zf.read('Lexique4/Lexique4.tsv').decode('utf-8').splitlines()
lex = {}
for r in rows[1:]:
    c = r.split('\t')
    if len(c) < 10:
        continue
    mot, ipa, lemme, cgram = c[0], c[2], c[3], c[4]
    try:
        freq = float(c[9])
    except ValueError:
        freq = 0.0
    lex.setdefault(mot, []).append((freq, cgram, lemme, ipa))
p('lexique: %d surface forms' % len(lex))

LEX_POS = {'VER': 'verb', 'AUX': 'verb', 'NOM': 'noun', 'ADJ': 'adj', 'ADV': 'adv',
           'PRO': 'pron', 'PRE': 'prep', 'CON': 'conj', 'ART': 'art', 'INT': 'interj',
           'ONO': 'onom'}
def lex_pos(cgram):
    base = cgram.split(':')[0]
    if base == 'ADJ' and ':' in cgram:
        return 'num' if cgram == 'ADJ:num' else 'det'
    return LEX_POS.get(base, '')

K_POS = {'noun': 'noun', 'verb': 'verb', 'aux': 'verb', 'adj': 'adj', 'adv': 'adv',
         'pron': 'pron', 'det': 'det', 'article': 'art', 'prep': 'prep', 'conj': 'conj',
         'interj': 'interj', 'intj': 'interj', 'phrase': 'phrase', 'num': 'num',
         'particle': 'part', 'name': 'name', 'propn': 'name', 'onom': 'onom',
         'contraction': 'contraction'}
def k_pos(pos):
    return K_POS.get(pos, pos or '')

# reference-word extraction (used both to fetch lemmas and to resolve alt-forms)
REFS = re.compile(r'(?i)\b(?:participle|inflection|spelling|variant|abbreviation|'
                  r'alternative form|alternative spelling|form|plural|singular|'
                  r'feminine|masculine|misspelling|eye dialect|synonym|equivalent|'
                  r'comparative|superlative|degree)\s+of\s+([^\s,;()+/]+)')
REFT = re.compile(r'\bof\s+([^\s,;()+/]+)\s*$')

# ---------------------------------------------------------------- 3. kaikki (2 passes)
target = set(ranked[:8000])
kaik = {}
lemmas = set()
with gzip.open(os.path.join(WORK, 'kaikki-fr.jsonl.gz'), 'rt', encoding='utf-8') as f:
    for line in f:
        if '"word"' not in line:
            continue
        try:
            o = json.loads(line)
        except Exception:
            continue
        w = o.get('word')
        if w not in target:
            continue
        kaik.setdefault(w, []).append(o)
        for s in o.get('senses', []):
            for fo in (s.get('form_of') or []):
                if fo.get('word'):
                    lemmas.add(fo['word'].split(' ')[0])
            for g in (s.get('glosses') or []):
                for m in REFS.finditer(g):
                    lemmas.add(m.group(1))
                for m in REFT.finditer(g):
                    lemmas.add(m.group(1))
need = lemmas - set(kaik.keys())
with gzip.open(os.path.join(WORK, 'kaikki-fr.jsonl.gz'), 'rt', encoding='utf-8') as f:
    for line in f:
        if '"word"' not in line:
            continue
        try:
            o = json.loads(line)
        except Exception:
            continue
        if o.get('word') in need:
            kaik.setdefault(o['word'], []).append(o)
p('kaikki: %d headwords covered (target %d), %d lemmas fetched for form-of' %
  (len(kaik), len(target), len(need)))

def pick_entry(word, want):
    es = kaik.get(word)
    if not es:
        return None
    if want:
        for e in es:
            if k_pos(e.get('pos')) == want:
                return e
    return es[0]

def entry_ipa(e):
    if not e:
        return ''
    ipas = [s['ipa'] for s in e.get('sounds', []) if 'ipa' in s]
    for x in ipas:
        if x.startswith('/'):
            return x.strip('/').strip()
    return ipas[0].strip('[]').strip() if ipas else ''

# ---- gloss selection -------------------------------------------------------
RARE = set(['obsolete', 'archaic', 'literary', 'slang', 'colloquial', 'regional',
            'historical', 'nonstandard', 'rare', 'louisiana', 'quebec', 'missouri',
            'acadian', 'informal', 'dated', 'uncommon', 'poetic', 'jocular', 'vulgar',
            'proscribed', 'childish', 'familiar'])
BAD = re.compile(r'^(used to |the plural |the singular |the third-person|the first-person|'
                 r'the second-person|the most common|forms the |the reflexive|the inanimate|'
                 r'the direct|the object|the subject|first-person |second-person |third-person )', re.I)
BADANY = re.compile(r'(?i)\b(participle|inflection|spelling|variant|abbreviation|'
                    r'alternative form|alternative spelling|form|plural|singular|'
                    r'feminine|masculine|misspelling|eye dialect|synonym|equivalent|'
                    r'comparative|superlative|degree|contraction) of\b')
USAGE = re.compile(r'(?i)^(only used in|used only in|used in|not used in|generally used in|'
                   r'chiefly used in|now used in|mostly used in)\b')

def transform(g):
    m = re.search(r'literally\s*[\u201c"\u2018\'](.*?)[\u201d"\u2019\']', g)
    if m:
        g = m.group(1)
    m = re.search(r'translating into English as\s+(.*)', g, re.I)
    if m:
        g = m.group(1)
    m = re.search(r'\b(?:of|from)\s+[^:]{1,30}:\s*(.+)$', g)
    if m:
        g = m.group(1)
    return g

def clean(g):
    g = re.sub(r'\s*\([^)]*\)', '', g)
    g = re.sub(r'\s*\[[^\]]*\]', '', g).strip()
    g = re.split(r'; ', g)[0].strip()
    if len(g) > 20:
        g = re.split(r'[,:] ', g)[0].strip()
    g = re.sub(r'[\u201c"\u2018\u2019].*?[\u201c\u201d"\u2019]', '', g)
    if ' or ' in g and ("'" in g or '\u2018' in g or '\u201c' in g):
        g = g.split(' or ')[0]
    g = g.strip(' \u00a0.,;:\u2019\'"')
    if len(g) > 60:
        g = g[:60].rsplit(' ', 1)[0]
    return g.strip()

def penalty(g):
    s = 0
    if BAD.match(g) or BADANY.search(g):
        s += 4
    low = g.lower()
    if 'pronoun in the' in low or 'reflexive and reciprocal' in low:
        s += 4
    if len(g) > 40:
        s += 2
    return s

def parens(g):
    out = []
    for m in re.finditer(r'[\u201c"]([^\u201d"]{1,40})[\u201d"]', g):
        out.append(m.group(1))
    for m in re.finditer(r'\(([^)]{1,40})\)', g):
        out.append(m.group(1))
    return out

def best_def(entry):
    for s in entry.get('senses', []):
        gl = s.get('glosses') or []
        if gl and not s.get('form_of'):
            return gl[-1] if len(gl) >= 2 else gl[0]
    return None

def resolve_ref(ref, want, depth=0):
    if depth > 3:
        return None
    ref = (ref or '').strip()
    es = kaik.get(ref)
    if not es:
        lx = lex.get(ref)
        if lx:
            lemme = max(lx, key=lambda x: x[0])[2]
            if lemme and lemme != ref:
                return resolve_ref(lemme, want, depth + 1)
        return None
    order = sorted(es, key=lambda e: 0 if (want and k_pos(e.get('pos')) == want) else 1)
    if want:
        for e in order:
            if k_pos(e.get('pos')) != want:
                continue
            g = best_def(e)
            if g:
                c = clean(transform(g))
                if c and penalty(c) == 0:
                    return c
    good = []
    fb = []
    for e in order:
        for s in e.get('senses', []):
            gl = s.get('glosses') or []
            if not gl or s.get('form_of'):
                continue
            c = clean(transform(gl[-1] if len(gl) >= 2 else gl[0]))
            if not c:
                continue
            (good if penalty(c) == 0 else fb).append(c)
    if good:
        return min(good, key=len)
    if fb:
        return min(fb, key=len)
    return None

def gloss_of(word, want):
    entries = kaik.get(word) or []
    if not entries:
        return ''
    cands = []
    for e in entries:
        cp = k_pos(e.get('pos'))
        if not want or cp == want:
            prio = 0
        elif want in ('art', 'det') and cp == 'contraction':
            prio = 0
        else:
            prio = 1
        for si, s in enumerate(e.get('senses', [])):
            gl = s.get('glosses') or []
            if not gl:
                continue
            base = gl[-1] if len(gl) >= 2 else gl[0]
            refs = []
            lxr = lex.get(word)
            if lxr:
                lemme = max(lxr, key=lambda x: x[0])[2]
                if lemme and lemme != word:
                    refs.append(lemme)
            if s.get('form_of'):
                refs.append(s['form_of'][0].get('word', '').split(' ')[0])
            for m in REFS.finditer(base):
                refs.append(m.group(1))
            for m in REFT.finditer(base):
                refs.append(m.group(1))
            resolved = []
            for r in refs:
                g = resolve_ref(r, want)
                if g and g not in resolved:
                    resolved.append(g)
            if resolved:
                bi = min(range(len(resolved)), key=lambda i: (len(resolved[i]), i))
                options = [base] + parens(base) + [resolved[bi]] + \
                          [x for i, x in enumerate(resolved) if i != bi]
            else:
                options = [base] + parens(base)
            stp = 2 * len(set(t.lower() for t in (s.get('tags') or [])) & RARE)
            for k, o in enumerate(options):
                c = clean(transform(o))
                if not c:
                    continue
                cands.append((prio * 50 + stp + penalty(c) + si * 0.1 + k * 0.01, c))
    if cands:
        cands.sort(key=lambda x: x[0])
        top = cands[0][1]
        if USAGE.match(top):
            return ''
        return top
    for e in entries:
        for s in e.get('senses', []):
            gl = s.get('glosses') or []
            if gl:
                c = clean(transform(gl[-1] if len(gl) >= 2 else gl[0]))
                if c and not USAGE.match(c):
                    return c
    return ''

# ---------------------------------------------------------------- 4. Tatoeba examples
TOK = re.compile(r"[^\W\d_]+(?:['\u2019-][^\W\d_]+)*", re.U)
best = {}
zf2 = zipfile.ZipFile(os.path.join(WORK, 'fra-eng.zip'))
for raw in zf2.open('fra.txt'):
    line = raw.decode('utf-8').rstrip('\r\n')
    cols = line.split('\t')
    if len(cols) < 2:
        continue
    en, fr = cols[0].strip(), cols[1].strip()
    if not (8 <= len(fr) <= 70) or not en:
        continue
    score = abs(len(fr) - 40)
    for tok in set(t.lower() for t in TOK.findall(fr)):
        if tok in target:
            cur = best.get(tok)
            if cur is None or score < cur[0]:
                best[tok] = (score, fr, en)
p('tatoeba: examples found for %d target words' % len(best))

# ---------------------------------------------------------------- assemble
def san(s):
    return s.replace('\t', ' ').replace('\n', ' ').replace('\r', ' ').strip()

out = []
skipped = []
for w in ranked:
    if len(out) >= N:
        break
    lx = lex.get(w)
    want = ''
    lpa = ''
    if lx:
        freq, cgram, lemme, ipa = max(lx, key=lambda x: x[0])
        want = lex_pos(cgram)
        lpa = ipa
    e = pick_entry(w, want)
    if e is None:
        skipped.append((w, 'no-kaikki'))
        continue
    if not want:
        want = k_pos(e.get('pos'))
    gloss = gloss_of(w, want)
    if not gloss:
        skipped.append((w, 'no-gloss'))
        continue
    reading = entry_ipa(e) or lpa
    ex = best.get(w)
    exfr, exen = (san(ex[1]), san(ex[2])) if ex else ('', '')
    out.append((w, san(reading), want, san(gloss), exfr, exen))

with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('rank\tword\treading\tpos\tenglish\texample\texample_english\n')
    for i, r in enumerate(out, 1):
        f.write('\t'.join([str(i)] + list(r)) + '\n')

cov = lambda i: sum(1 for r in out if r[i])
p('')
p('WROTE %d words -> %s' % (len(out), OUT))
p('  english %d (%.1f%%)' % (cov(3), 100.0 * cov(3) / len(out)))
p('  reading %d (%.1f%%)' % (cov(1), 100.0 * cov(1) / len(out)))
p('  example %d (%.1f%%)' % (cov(4), 100.0 * cov(4) / len(out)))
p('  lexique-pos %d (%.1f%%)' % (sum(1 for w, *_ in out if w in lex), 100.0 * sum(1 for w, *_ in out if w in lex) / len(out)))
p('  max freq rank consumed: %d' % (ranked.index(out[-1][0]) + 1))
p('  skipped: %d (no-kaikki %d, no-gloss %d)' % (
    len(skipped), sum(1 for _, r in skipped if r == 'no-kaikki'),
    sum(1 for _, r in skipped if r == 'no-gloss')))
p('  first 40 skipped:', [w for w, _ in skipped[:40]])
