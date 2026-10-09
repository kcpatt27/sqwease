# -*- coding: utf-8 -*-
"""
Reproducible source generator for content/ko/source.tsv  (SQWease Korean deck).

This is NOT the runtime builder -- that is scripts/build-lang-vocab.js. This
script only regenerates the *source* TSV from open, licensed datasets. It is
committed under content/ko/ so the deck stays reproducible.

Inputs (downloaded to a temp cache on first run, never into the repo):
  ko_50k.txt            Hermit Dave FrequencyWords 2018/ko      (CC BY-SA 4.0)
  kaikki-ko.jsonl.gz    kaikki.org / Wiktextract Korean extract  (CC BY-SA 3.0)
  kengdic.tsv           kengdic, garfieldnate fork               (MPL 2.0 / LGPL 2.0+)
  kor-eng.zip           Tatoeba kor-eng via manythings.org       (CC BY 2.0 FR)

Optional (used only if present in the cache; see README for URLs):
  kor_sentences.tsv.bz2 / eng_sentences.tsv.bz2 / links.tar.bz2  (CC BY 2.0 FR)

Deterministic: the same inputs reproduce a byte-identical source.tsv. No
network is used once the cache is populated, no randomness.

Usage:
  python content/ko/enrich.py                 # download -> content/ko/source.tsv
  python content/ko/enrich.py [workdir] [out.tsv] [N]
"""
import bz2, gzip, io, json, os, re, sys, tarfile, tempfile, urllib.request, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.dont_write_bytecode = True  # never leave __pycache__ in content/
sys.path.insert(0, HERE)
from romaja import romanize  # noqa: E402

WORK = sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), "sqwease-ko-src")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "source.tsv")
N = int(sys.argv[3]) if len(sys.argv) > 3 else 2500

FREQ_URL = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ko/ko_50k.txt"
KAIKKI_URL = "https://kaikki.org/dictionary/Korean/kaikki.org-dictionary-Korean.jsonl.gz"
KENGDIC_URL = "https://raw.githubusercontent.com/garfieldnate/kengdic/master/kengdic.tsv"
MANYTHINGS_URL = "https://www.manythings.org/anki/kor-eng.zip"

def fetch(url, name, min_size=1024):
    dest = os.path.join(WORK, name)
    if os.path.exists(dest) and os.path.getsize(dest) >= min_size:
        return dest
    os.makedirs(WORK, exist_ok=True)
    sys.stderr.write("downloading %s\n" % url)
    urllib.request.urlretrieve(url, dest)
    return dest

FREQ = fetch(FREQ_URL, "ko_50k.txt")
KAIKKI = fetch(KAIKKI_URL, "kaikki-ko.jsonl.gz", 1024 * 1024)
KENGDIC = fetch(KENGDIC_URL, "kengdic.tsv", 1024 * 100)
MANYTHINGS = fetch(MANYTHINGS_URL, "kor-eng.zip", 1024 * 50)
# full Tatoeba exports are optional: use them only if already cached.
TAT_KOR = os.path.join(WORK, "kor_sentences.tsv.bz2")
TAT_ENG = os.path.join(WORK, "eng_sentences.tsv.bz2")
TAT_LINKS = os.path.join(WORK, "links.tar.bz2")

HANGUL = re.compile(r'[\uAC00-\uD7A3]')
def has_hangul(w):
    return bool(HANGUL.search(w) or re.search(r'[\u1100-\u11FF\u3130-\u318F]', w or ''))

def p(*a):
    sys.stderr.write(' '.join(str(x) for x in a) + '\n')

# ------------------------------------------------------------------ 1. frequency
ranked = []
seen = set()
with io.open(FREQ, encoding='utf-8') as f:
    for line in f:
        parts = line.split()
        if len(parts) < 2:
            continue
        w = parts[0]
        if not has_hangul(w):
            continue
        if any(ord(c) < 32 for c in w):
            continue
        if re.fullmatch(r'[A-Za-z]+', w):
            continue
        if w in seen:
            continue
        seen.add(w)
        ranked.append(w)
p('frequency: %d unique Hangul tokens' % len(ranked))
TARGET_RANK = ranked[:6000]  # enrich window (we skip unresolvable rows)

# ------------------------------------------------------------------ 2. kaikki
kaik = {}
with gzip.open(KAIKKI, 'rt', encoding='utf-8') as f:
    for line in f:
        if '"word"' not in line:
            continue
        try:
            o = json.loads(line)
        except Exception:
            continue
        kaik.setdefault(o['word'], []).append(o)
p('kaikki: %d entries, %d headwords' % (sum(len(v) for v in kaik.values()), len(kaik)))

BADPOS = {'syllable', 'symbol', 'character', 'punct', 'root', 'affix', 'interfix', 'infix'}
POS_MAP = {'intj': 'interj', 'particle': 'part', 'article': 'art', 'counter': 'counter',
           'suffix': 'suffix', 'prefix': 'prefix', 'name': 'name', 'proper noun': 'name',
           'adv': 'adv', 'adj': 'adj', 'noun': 'noun', 'verb': 'verb', 'pron': 'pron',
           'det': 'det', 'num': 'num', 'conj': 'conj', 'prep': 'prep', 'phrase': 'phrase',
           'interj': 'interj'}

def map_pos(pos):
    return POS_MAP.get(pos, pos or '')

def direct_entries(w):
    return [e for e in kaik.get(w, []) if e.get('pos') not in BADPOS]

# reverse index of inflected forms -> (lemma, pos)
fidx = {}
for lemma, es in kaik.items():
    for e in es:
        pos = e.get('pos')
        if pos in BADPOS:
            continue
        for fm in (e.get('forms') or []):
            f = fm.get('form') or ''
            tags = fm.get('tags') or []
            if not f or f == lemma or not has_hangul(f):
                continue
            if 'table-tags' in tags or 'inflection-template' in tags:
                continue
            if len(f) > 20:
                continue
            fidx.setdefault(f, (lemma, pos))
p('form index: %d inflected forms' % len(fidx))

# wiktionary romanization of the exact headword
def rom_form(entries):
    for e in entries:
        for fm in (e.get('forms') or []):
            if 'romanization' in (fm.get('tags') or []) and fm.get('form'):
                return fm['form']
    return None

# ------------------------------------------------------------------ 3. kengdic
keng = {}
with io.open(KENGDIC, encoding='utf-8') as f:
    next(f, None)
    for line in f:
        c = line.rstrip('\n').split('\t')
        if len(c) < 4:
            continue
        surf, gl = c[1], c[3]
        if not gl:
            continue
        keng.setdefault(surf, gl)

# ------------------------------------------------------------------ gloss helpers
FORMREF = re.compile(r'(?i)\b(?:allomorph|contraction|alternative form|alternative spelling|'
                     r'inflected form|short form|shortened form|abbreviation|clipping|variant|'
                     r'dialectal form|colloquial form|informal form|nonstandard form|'
                     r'misspelling|eye dialect|spelling|form|equivalent|syncopic form) of\b')
# any "<grammar description> of <Hangul lemma>" is a reference, not a translation
FORMREF2 = re.compile(r'\bof\s+([\uAC00-\uD7A3][\uAC00-\uD7A3]*)')
DESC = re.compile(r'(?i)\b(pronoun|determiner|particle|postposition|suffix|prefix|counter|'
                  r'marker|tense|speech level|honorific|adnominal|conjugation|allomorph|'
                  r'contraction|inflection|form of|case marker|verb-final|used to|'
                  r'nominal|reflexive)\b')
SEE = re.compile(r'(?i)^(?:see|short for|shortened from|syncope of|clipping of|synonym of|'
                 r'abbreviation of|ellipsis of)\b')
RARE = {'obsolete', 'archaic', 'literary', 'slang', 'vulgar', 'derogatory', 'offensive',
        'historical', 'nonstandard', 'rare', 'dialectal', 'colloquial', 'informal', 'dated'}
USAGE = re.compile(r'(?i)^(used only in|used in|only used in|generally used in|chiefly used in|'
                   r'mostly used in|not used in|now used in)\b')

def _is_ref(g):
    return bool(FORMREF.search(g) or FORMREF2.search(g) or SEE.match(g))

def refs_of_sense(s):
    out = []
    # references named literally in the gloss text are the most reliable
    for g in (s.get('glosses') or []):
        for m in FORMREF2.finditer(g):
            out.append(m.group(1))
        if FORMREF.search(g):
            for m in re.finditer(r'\bof\s+([^\s(,;)\[\]]+)', g):
                c = m.group(1)
                if has_hangul(c):
                    out.append(c)
    # then structured links to a Korean entry
    for link in (s.get('links') or []):
        if isinstance(link, (list, tuple)) and link:
            w = link[0]
            tgt = link[1] if len(link) > 1 else ''
            if has_hangul(w) and (tgt.endswith('#Korean') or w in kaik):
                out.append(w)
    # finally any Hangul headword named in the gloss (covers "see X", "synonym of X")
    for g in (s.get('glosses') or []):
        for m in re.finditer(r'[\uAC00-\uD7A3]{1,}', g):
            tok = m.group()
            if tok in kaik or tok in fidx or tok in keng:
                out.append(tok)
    seen = set()
    res = []
    for x in out:
        if x not in seen:
            seen.add(x)
            res.append(x)
    return res

def clean(g):
    g = re.sub(r'\s*\([^)]*\)', '', g)
    g = re.sub(r'\s*\[[^\]]*\]', '', g)
    g = re.sub(r'\s+', ' ', g).strip()
    # strip a leading hanja/roman prefix such as "亂: revolt" or "欄: column"
    m = re.match(r'^[^\sA-Za-z0-9]{1,8}:\s*(.+)$', g)
    if m:
        g = m.group(1).strip()
    parts = [q.strip() for q in re.split(r';\s*', g) if q.strip()]
    g = next((q for q in parts if not DESC.search(q)), parts[0] if parts else '')
    g = g.strip()
    if len(g) > 24:
        g = re.split(r',\s*', g)[0].strip()
    g = g.strip(' \u00a0.,;:\u2019\'"*')
    if len(g) > 60:
        g = g[:60].rsplit(' ', 1)[0]
    return g

def best_gloss(entries, want_pos=None, depth=0):
    """Return (clean English gloss, pos) for a list of kaikki entries, following
    form/synonym references to the lemma when needed. ('', '') if none."""
    if depth > 3:
        return ('', '')
    cands = []
    for e in entries:
        ep = map_pos(e.get('pos'))
        wp = want_pos or ep
        prio = 0 if (not want_pos or ep == want_pos) else 1
        for si, s in enumerate(e.get('senses') or []):
            gl = s.get('glosses') or []
            if not gl:
                continue
            base = gl[0]
            rare = 2 * len(set(s.get('tags') or []) & RARE)
            sc = prio * 50 + rare + si * 0.1
            if _is_ref(base):
                # an explicit translation after ':' beats following the link
                if ':' in base:
                    c = clean(base.split(':', 1)[1])
                    if c and not _is_ref(c):
                        cands.append((sc, c, ep))
                for r in refs_of_sense(s)[:4]:
                    res = resolve_gloss(r, wp, depth + 1)
                    if res:
                        cands.append((sc, res, ep))
                        break
                continue
            c = clean(base)
            if not c or USAGE.match(c) or _is_ref(c):
                continue
            cands.append((sc, c, ep))
    if not cands:
        return ('', '')
    cands.sort(key=lambda x: x[0])
    return (cands[0][1], cands[0][2])

def resolve_gloss(w, want_pos=None, depth=0):
    """Best gloss for a word (direct entry preferred), else ''."""
    if depth > 3 or not w:
        return ''
    es = direct_entries(w)
    if es:
        g, _ = best_gloss(es, want_pos, depth)
        if g:
            return g
    if w in keng:
        return clean(keng[w])
    return ''

# ------------------------------------------------------------------ 4. resolver
PARTICLES = sorted(set(['에서는', '에게서', '으로부터', '에게', '한테', '께서', '에서', '으로',
    '로써', '로서', '부터', '까지', '처럼', '보다', '이나', '이라도', '이란', '이라는', '이며',
    '이고', '이면', '이야', '은', '는', '이', '가', '을', '를', '에', '의', '와', '과', '도',
    '만', '로', '야', '요', '이라', '라고', '라는', '인', '란']), key=len, reverse=True)
ENDINGS = sorted(set(['었는데', '았는데', '였는데', '겠는데', '었지만', '았지만', '었어요', '았어요',
    '였어요', '었습니다', '았습니다', '었어', '았어', '였어', '었나요', '았나요', '었나', '았나',
    '었네요', '았네요', '었네', '았네', '었지', '았지', '었죠', '았죠', '었던', '았던', '었니',
    '았니', '을까요', '을까', '을게', '을래', '을수', '을거', '을지', '으니까', '으니', '으려고',
    '으러', '으면서', '으려면', '었', '았', '였', '겠', '시', '셨', '는데', '은데', '지만',
    '더니', '니까', '나요', '네요', '군요', '지요', '잖아요', '잖아', '려고', '러서', '면서',
    '다가', '다면', '다니', '다니까', '다고', '한다', '해요', '해', '돼', '되', '지', '죠',
    '네', '나', '던', '니', '면', '서', '야', '어', '아', '게', '길', '까', '래', '든', '채',
    '줘', '봐', '와', '워', '러', '소', '오', '음', '은', '는', '을', '를', '이', '가', '에',
    '의', '도', '만', '과', '와', '로', '요', '인']), key=len, reverse=True)
CONTRACT = {'그건': '그것', '이건': '이것', '저건': '저것', '그걸': '그것', '이걸': '이것',
            '저걸': '저것', '그게': '그것', '이게': '이것', '저게': '저것', '그거': '그것',
            '이거': '이것', '저거': '저것', '뭘': '뭐', '뭔데': '뭐', '뭔가': '뭐', '뭐가': '뭐',
            '뭐는': '뭐', '뭐지': '뭐', '뭐든': '뭐', '뭐야': '뭐', '뭐예요': '뭐', '뭐에요': '뭐',
            '애들': '아이', '얘들': '아이', '건': '것', '걸': '것', '게': '것',
            '거야': '것', '거예요': '것', '거에요': '것', '거다': '것', '거고': '것', '거죠': '것',
            '거지': '것', '거든': '것', '거라': '것', '거라면': '것', '건가': '것', '건가요': '것',
            '건지': '것', '거잖아': '것', '거니': '것', '거냐': '것', '것입니다': '것',
            '것이에요': '것', '겁니다': '것', '것이다': '것', '것인가': '것', '것인지': '것'}
# dominant closed-class sense chosen from Wiktionary/kengdic senses (see README)
CURATED = {'내': ('my', 'det'), '우리': ('we, us', 'pron'), '못': ('cannot', 'adv'),
           '안': ('not', 'adv'), '네': ('yes', 'interj'), '제': ('my', 'det'),
           '난': ('I, me', 'pron'), '다': ('all', 'adv'), '어떻게': ('how', 'adv'),
           '할': ('to do', 'verb'), '제가': ('I, me', 'pron'), '우린': ('we, us', 'pron')}

def resolve(w, depth=0):
    """Resolve a surface token to (gloss, pos, lemma, method). Empty gloss -> None."""
    if depth > 3 or not w:
        return None
    # curated closed-class selection: for a handful of very frequent function
    # words Wiktionary's entry order is misleading; this picks among its own
    # senses (see README "Known limitations"). Grow only from dictionary senses.
    cur = CURATED.get(w)
    if cur:
        return (cur[0], cur[1], w, 'curated')
    # curated contraction map next: subtitle function words beat obscure homographs
    c = CONTRACT.get(w)
    if c and c != w:
        r = resolve(c, depth + 1)
        if r:
            return (r[0], r[1], r[2], 'contract')
    es = direct_entries(w)
    if es:
        g, gp = best_gloss(es, None, depth)
        if g:
            return (g, gp or map_pos(es[0].get('pos')), w, 'kaikki')
        if w in keng:
            return (clean(keng[w]), map_pos(es[0].get('pos')), w, 'kengdic')
    fm = fidx.get(w)
    if fm:
        lemma, pos = fm
        g = resolve_gloss(lemma)
        if not g and lemma in keng:
            g = clean(keng[lemma])
        if g:
            return (g, map_pos(pos), lemma, 'kaikki-form')
    if w in keng:
        return (clean(keng[w]), '', w, 'kengdic')
    for p in PARTICLES:
        if w.endswith(p) and len(w) - len(p) >= 1:
            r = resolve(w[:-len(p)], depth + 1)
            if r:
                return (r[0], r[1], r[2], 'strip-part')
    for e in ENDINGS:
        if w.endswith(e) and len(w) - len(e) >= 1:
            base = w[:-len(e)]
            for cand in (base + '다', base):
                es2 = direct_entries(cand)
                if es2:
                    g, gp2 = best_gloss(es2, None, depth)
                    if g:
                        return (g, gp2 or map_pos(es2[0].get('pos')), cand, 'strip-end')
                if cand in keng:
                    return (clean(keng[cand]), '', cand, 'strip-end')
                f2 = fidx.get(cand)
                if f2:
                    g = resolve_gloss(f2[0])
                    if g:
                        return (g, map_pos(f2[1]), f2[0], 'strip-end')
    return None

def reading_for(w):
    es = kaik.get(w) or []
    r = rom_form(es)
    if r:
        r = re.sub(r'[^a-z]', '', r.lower())
        if r:
            return r, 'wiktionary'
    return romanize(w), 'derived'

# ------------------------------------------------------------------ 5. examples
TOK = re.compile(r'[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+')

def san(s):
    return re.sub(r'\s+', ' ', (s or '').replace('\t', ' ').replace('\n', ' ').replace('\r', ' ')).strip()

# manythings pairs
exact = {}
def consider(ko, en):
    ko, en = san(ko), san(en)
    if not (6 <= len(ko) <= 80) or not en or len(en) > 90 or not has_hangul(ko):
        return
    score = abs(len(ko) - 35)
    for t in set(TOK.findall(ko)):
        cur = exact.get(t)
        if cur is None or score < cur[0]:
            exact[t] = (score, ko, en)

with zipfile.ZipFile(MANYTHINGS) as z:
    for raw in z.open('kor.txt'):
        c = raw.decode('utf-8').rstrip('\r\n').split('\t')
        if len(c) >= 2:
            consider(c[1], c[0])

# optional Tatoeba exports (only if cached)
if os.path.exists(TAT_KOR) and os.path.exists(TAT_ENG) and os.path.exists(TAT_LINKS):
    p('tatoeba: using cached full exports')
    kor = {}
    with bz2.open(TAT_KOR, 'rt', encoding='utf-8') as f:
        for line in f:
            c = line.rstrip('\n').split('\t')
            if len(c) >= 3:
                kor[c[0]] = c[2]
    eng_ids = set()
    with bz2.open(TAT_ENG, 'rt', encoding='utf-8') as f:
        for line in f:
            c = line.rstrip('\n').split('\t')
            if len(c) >= 3:
                eng_ids.add(c[0])
    pairs = []
    need = set()
    with tarfile.open(TAT_LINKS, 'r:bz2') as tf:
        member = [m for m in tf.getmembers() if m.isfile()][0]
        fx = tf.extractfile(member)
        prev = b''
        while True:
            chunk = fx.read(1 << 22)
            if not chunk:
                break
            data = prev + chunk
            lines = data.split(b'\n')
            prev = lines.pop()
            for L in lines:
                if not L:
                    continue
                q = L.split(b'\t')
                if len(q) != 2:
                    continue
                a, b = q[0].decode(), q[1].decode()
                if a in kor and b in eng_ids:
                    pairs.append((a, b)); need.add(b)
                elif b in kor and a in eng_ids:
                    pairs.append((b, a)); need.add(a)
    eng = {}
    with bz2.open(TAT_ENG, 'rt', encoding='utf-8') as f:
        for line in f:
            c = line.rstrip('\n').split('\t')
            if len(c) >= 3 and c[0] in need:
                eng[c[0]] = c[2]
    seenp = set()
    for a, b in pairs:
        if (a, b) in seenp:
            continue
        seenp.add((a, b))
        if kor.get(a) and eng.get(b):
            consider(kor[a], eng[b])
p('examples: %d tokens with a ManyThings/Tatoeba sentence' % len(exact))

# lemma-level example fallback
lex_ex = {}
def consider_lex(ko, en):
    ko, en = san(ko), san(en)
    if not (6 <= len(ko) <= 80) or not en or len(en) > 90:
        return
    score = abs(len(ko) - 35)
    for t in set(TOK.findall(ko)):
        cur = lex_ex.get(t)
        if cur is None or score < cur[0]:
            lex_ex[t] = (score, ko, en)
with zipfile.ZipFile(MANYTHINGS) as z:
    for raw in z.open('kor.txt'):
        c = raw.decode('utf-8').rstrip('\r\n').split('\t')
        if len(c) >= 2:
            consider_lex(c[1], c[0])

# wiktionary sense examples (word -> (score, ko, en))
wkex = {}
for lemma, es in kaik.items():
    for e in es:
        for s in (e.get('senses') or []):
            for ex in (s.get('examples') or []):
                ko = san(ex.get('text') or '')
                en = san(ex.get('english') or ex.get('translation') or '')
                if not ko or not en or not has_hangul(ko):
                    continue
                if not (6 <= len(ko) <= 80) or len(en) > 90:
                    continue
                score = abs(len(ko) - 35)
                cur = wkex.get(lemma)
                if cur is None or score < cur[0]:
                    wkex[lemma] = (score, ko, en)
p('examples: %d lemmas with a Wiktionary example' % len(wkex))

def example_for(w, lemma):
    hit = exact.get(w)
    if hit:
        return hit[1], hit[2], 'tatoeba'
    hit = exact.get(lemma)
    if hit:
        return hit[1], hit[2], 'tatoeba'
    hit = lex_ex.get(w) or lex_ex.get(lemma)
    if hit:
        return hit[1], hit[2], 'tatoeba-lemma'
    hit = wkex.get(w) or wkex.get(lemma)
    if hit:
        return hit[1], hit[2], 'wiktionary'
    return '', '', ''

# ------------------------------------------------------------------ 6. assemble
rows = []
skipped = 0
depth_used = 0
for i, w in enumerate(TARGET_RANK):
    r = resolve(w)
    if r is None:
        skipped += 1
        continue
    gloss, pos, lemma, method = r
    if not gloss:
        skipped += 1
        continue
    reading, rsrc = reading_for(w)
    ex, exen, esrc = example_for(w, lemma)
    rows.append((w, reading, pos, gloss, ex, exen, method, rsrc, esrc))
    depth_used = i + 1
    if len(rows) >= N:
        break

def cov(idx):
    return sum(1 for r in rows if r[idx])

with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('rank\tword\treading\tpos\tenglish\texample\texample_english\n')
    for i, r in enumerate(rows, 1):
        f.write('\t'.join([str(i)] + [x.replace('\t', ' ').replace('\n', ' ') for x in r[:6]]) + '\n')

n = len(rows)
p('')
p('WROTE %d words -> %s (skipped %d unresolvable, deepest frequency rank %d)' % (n, OUT, skipped, depth_used))
p('  english   %4d (%.1f%%)' % (cov(3), 100.0 * cov(3) / n))
p('  reading   %4d (%.1f%%)' % (cov(1), 100.0 * cov(1) / n))
p('  pos       %4d (%.1f%%)' % (cov(2), 100.0 * cov(2) / n))
p('  example   %4d (%.1f%%)' % (cov(4), 100.0 * cov(4) / n))
from collections import Counter
p('  gloss source   :', dict(Counter(r[6] for r in rows)))
p('  reading source :', dict(Counter(r[7] for r in rows)))
p('  example source :', dict(Counter(r[8] for r in rows)))

# romanization validation: derived RR vs Wiktionary, over the enriched window
vpairs = []
for w in TARGET_RANK:
    r = rom_form(kaik.get(w) or [])
    if r:
        rn = re.sub(r'[^a-z]', '', r.lower())
        if rn:
            vpairs.append((w, rn))
agree = sum(1 for w, rn in vpairs if romanize(w) == rn)
if vpairs:
    p('  RR agreement  : %d/%d = %.1f%% (derived vs Wiktionary romanization)'
      % (agree, len(vpairs), 100.0 * agree / len(vpairs)))
