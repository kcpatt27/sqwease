# -*- coding: utf-8 -*-
"""
Reproducible source generator for content/es/source.tsv  (SQWease Spanish deck).

This is NOT the runtime builder -- that is scripts/build-lang-vocab.js. This
script only regenerates the *source* TSV from open, licensed datasets. It is
committed under content/es/ so the deck stays reproducible.

Inputs (downloaded to a temp cache on first run, never into the repo):
  es_50k.txt            Hermit Dave FrequencyWords 2018/es       (CC BY-SA 4.0)
  kaikki-es.jsonl.gz    kaikki.org / Wiktextract Spanish extract  (CC BY-SA 3.0)
  ipa_es.txt            open-dict-data/ipa-dict es_ES (gap IPA)   (MIT; Wiktionary CC BY-SA 3.0)
  spa-eng.zip           Tatoeba spa-eng via manythings.org         (CC BY 2.0 FR)

The word list is the 50k frequency list filtered to word-like tokens (>=2
letters, letters plus internal apostrophes/hyphens), exactly reproducing the
baseline deck ranking. Glosses, POS and IPA come from Wiktionary/Wiktextract
(no machine translation); IPA gaps fall back to ipa-dict, then blank.
Examples come from the Tatoeba spa-eng sentence pair collection.

Deterministic: the same inputs reproduce a byte-identical source.tsv. No
network is used once the cache is populated, no randomness.

Usage:
  python content/es/enrich.py                 # download -> content/es/source.tsv
  python content/es/enrich.py [workdir] [out.tsv] [N]
"""
import gzip, io, json, os, re, sys, tempfile, urllib.request, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.dont_write_bytecode = True  # never leave __pycache__ in content/

WORK = sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), "sqwease-es-src")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "source.tsv")
N = int(sys.argv[3]) if len(sys.argv) > 3 else 2500

FREQ_URL = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt"
KAIKKI_URL = "https://kaikki.org/dictionary/Spanish/kaikki.org-dictionary-Spanish.jsonl.gz"
IPAD_URL = "https://raw.githubusercontent.com/open-dict-data/ipa-dict/master/data/es_ES.txt"
MANYTHINGS_URL = "https://www.manythings.org/anki/spa-eng.zip"
UA = "sqwease-es-enrich/1.0 (+https://github.com/sqwease)"


def fetch(url, name, min_size=1024):
    dest = os.path.join(WORK, name)
    if os.path.exists(dest) and os.path.getsize(dest) >= min_size:
        return dest
    os.makedirs(WORK, exist_ok=True)
    sys.stderr.write("downloading %s\n" % url)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=180) as r, open(dest, "wb") as f:
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            f.write(chunk)
    return dest


def p(*a):
    sys.stderr.write(" ".join(str(x) for x in a) + "\n")


# ------------------------------------------------------------------ 1. frequency
LET = r"[^\W\d_]"
TOKEN = re.compile(r"^(?=.*%s)%s(?:%s|['\u2019-])*%s$" % (LET, LET, LET, LET), re.U)


def valid(w):
    return len(w) >= 2 and bool(TOKEN.match(w))


FREQ = fetch(FREQ_URL, "es_50k.txt")
ranked = []
seen = set()
with io.open(FREQ, encoding="utf-8") as f:
    for line in f:
        parts = line.split()
        if len(parts) < 2:
            continue
        w = parts[0]
        if not valid(w) or w in seen:
            continue
        seen.add(w)
        ranked.append(w)
p("frequency: 50000 raw forms -> %d kept after filter+dedupe" % len(ranked))
TARGET_RANK = ranked[:8000]  # enrichment window (we skip unstylable rows)
target = set(TARGET_RANK)

# POS hints: the committed baseline deck already carries a dominant POS per
# surface form. We reuse it only to choose *among* Wiktionary entries (the POS
# and gloss written out are always the Wiktionary ones). See README.
HINTS = {}
base = os.path.join(HERE, "source.tsv")
if os.path.exists(base):
    for i, line in enumerate(io.open(base, encoding="utf-8")):
        if i == 0 or not line.strip():
            continue
        c = line.rstrip("\n").split("\t")
        if len(c) >= 4 and c[1] and c[3]:
            HINTS[c[1]] = c[3]
    p("pos hints loaded from committed baseline: %d" % len(HINTS))

# ---------------------------------------------------------------- 2. kaikki (2 passes)
# reference extraction: gloss text like "plural of año", "infinitive of ir ..."
REF = re.compile(r"(?i)\b(?:plural|singular|masculine|feminine|participle|gerund|"
                 r"comparative|superlative|inflection|infinitive|form|spelling|alternative|"
                 r"abbreviation|diminutive|augmentative|contraction|misspelling|equivalent|"
                 r"synonym|variant|syncopic|apocopic)\s+(?:form\s+)?(?:of|:)\s+([A-Za-z\u00c0-\u017f]+)")
REFT = re.compile(r"\bof\s+([A-Za-z\u00c0-\u017f]+)\s*$")

kaik = {}
lemmas = set()
KEEP = {}
with gzip.open(fetch(KAIKKI_URL, "kaikki-es.jsonl.gz", 1024 * 1024), "rt", encoding="utf-8") as f:
    for line in f:
        if '"word"' not in line:
            continue
        try:
            o = json.loads(line)
        except Exception:
            continue
        w = o.get("word")
        if w not in target:
            continue
        kaik.setdefault(w, []).append(o)
        for s in o.get("senses", []) or []:
            for fo in (s.get("form_of") or []):
                if fo.get("word"):
                    lemmas.add(fo["word"].split(" ")[0])
            for g in (s.get("glosses") or []):
                for m in REF.finditer(g):
                    lemmas.add(m.group(1))
                for m in REFT.finditer(g):
                    lemmas.add(m.group(1))
need = lemmas - set(kaik.keys())
with gzip.open(os.path.join(WORK, "kaikki-es.jsonl.gz"), "rt", encoding="utf-8") as f:
    for line in f:
        if '"word"' not in line:
            continue
        try:
            o = json.loads(line)
        except Exception:
            continue
        if o.get("word") in need:
            kaik.setdefault(o["word"], []).append(o)
p("kaikki: %d headwords covered (window %d), %d lemmas fetched for form-of" %
  (len(kaik), len(target), len(need)))

POS_MAP = {"intj": "interj", "article": "det", "proper noun": "name", "particle": "part"}
BADPOS = {"syllable", "symbol", "character", "punct", "root", "affix", "interfix", "infix"}


def map_pos(pos):
    if pos in BADPOS:
        return ""
    return POS_MAP.get(pos, pos or "")


def pick_entry(word, want):
    es = kaik.get(word)
    if not es:
        return None
    if want:
        for e in es:
            if map_pos(e.get("pos")) == want:
                return e
    return es[0]


def entry_ipa(e):
    if not e:
        return ""
    ipas = [s["ipa"] for s in e.get("sounds", []) or [] if "ipa" in s]
    for x in ipas:
        if x.startswith("/"):
            return x.strip("/").strip()
    return ipas[0].strip("[]").strip() if ipas else ""


# ipa-dict gap source
IPAD = {}
with io.open(fetch(IPAD_URL, "ipa_es.txt", 1024 * 100), encoding="utf-8") as f:
    for line in f:
        line = line.rstrip("\n")
        if not line or line.startswith("#"):
            continue
        c = line.split("\t")
        if len(c) >= 2 and c[1]:
            IPAD.setdefault(c[0], c[1].strip("/[]"))


def reading_for(word, entry):
    r = entry_ipa(entry)
    if not r:
        for e in kaik.get(word, []) or []:
            r = entry_ipa(e)
            if r:
                break
    if r:
        return r, "kaikki"
    if word in IPAD:
        return IPAD[word], "ipa-dict"
    return "", ""


# ---- gloss selection -------------------------------------------------------
RARE = {"obsolete", "archaic", "literary", "slang", "colloquial", "regional", "historical",
        "nonstandard", "rare", "informal", "dated", "uncommon", "poetic", "jocular",
        "vulgar", "proscribed", "childish", "familiar", "dialectal", "humorous",
        "derogatory", "offensive", "rustic", "military", "internet", "misspelling"}
BAD = re.compile(r"(?i)^(?:the name of (?:the )?|the letter |name of the (?:latin|greek|cyrillic) )")
BADANY = re.compile(r"(?i)\b(?:plural|singular|masculine|feminine|participle|gerund|comparative|"
                    r"superlative|inflection|infinitive|spelling|alternative|abbreviation|diminutive|"
                    r"augmentative|contraction|misspelling|equivalent|synonym|variant|form|accusative|dative|nominative|"
                    r"genitive|reflexive|prepositional|objective|indicative|subjunctive|"
                    r"imperative|preterite|present|future|conditional)\s+(?:form\s+)?of\b")
USAGE = re.compile(r"(?i)^(?:only used in|used only in|used in|not used in|generally used in|"
                   r"chiefly used in|now used in|mostly used in)\b")
JARGON = re.compile(r"(?i)\b(?:definite article|indefinite article|pronoun|participle|gerund|"
                    r"accusative|dative|nominative|genitive|reflexive|reciprocal|object|"
                    r"first-person|second-person|third-person|singular|plural|masculine|"
                    r"feminine|neuter|conjugation|inflection|imperative|subjunctive|indicative|"
                    r"prepositional|vocative|apocopic|diminutive|augmentative)\b")


def transform(g):
    m = re.search(r'literally\s*[\u201c"\u2018\'](.*?)[\u201d"\u2019\']', g)
    if m:
        g = m.group(1)
    m = re.search(r"translating into English as\s+(.*)", g, re.I)
    if m:
        g = m.group(1)
    return g


def _core_of(seg):
    """If `seg` is a form/usage reference with an inline gloss after ':', use the tail."""
    if ":" in seg:
        head, tail = seg.split(":", 1)
        if (tail.strip() and (" of " in head.lower() or BADANY.search(head)
                              or REF.search(head) or JARGON.search(head))):
            return tail.strip()
    return seg


def clean(g):
    g = transform(g)
    g = re.sub(r"\s*\([^)]*\)", "", g)
    g = re.sub(r"\s*\[[^\]]*\]", "", g).strip()
    segs = [x for x in re.split(r";\s*", g) if x.strip()]
    cands = [_core_of(x).strip() for x in segs]
    picks = [(i, c) for i, c in enumerate(cands) if c and not (BADANY.search(c) or REF.search(c))]
    if not picks:
        picks = [(i, c) for i, c in enumerate(cands) if c]

    def key(ic):
        i, c = ic
        first = re.split(r",\s*", c)[0].strip()
        if ":" in first:
            head, tail = first.split(":", 1)
            if JARGON.search(head) or BADANY.search(head):
                first = tail.strip()
        return (1 if JARGON.search(first) else 0, i)

    if not picks:
        return ""
    picks.sort(key=key)
    best = picks[0][1]
    if ":" in best:
        head, tail = best.split(":", 1)
        if JARGON.search(head) or BADANY.search(head):
            best = tail
    best = re.split(r",\s*", best)[0].strip()
    best = re.sub(r'[\u201c"\u2018\u2019].*?[\u201c\u201d"\u2019]', "", best)
    best = best.replace("(", " ").replace(")", " ").replace("[", " ").replace("]", " ")
    best = re.sub(r"\s+", " ", best).strip()
    best = best.strip(" \u00a0.,;:\u2019'\"")
    if len(best) > 60:
        best = best[:60].rsplit(" ", 1)[0]
    return best.strip()


def penalty(g):
    s = 0
    if BAD.match(g) or BADANY.search(g):
        s += 6
    low = g.lower()
    if low.startswith(("replaces ", "used to ", "refers to ")):
        s += 3
    if len(g) > 40:
        s += 2
    return s


def refs_of_sense(s):
    out = []
    for fo in (s.get("form_of") or []):
        w = (fo.get("word") or "")
        if w and " " not in w:
            out.append(w)
    for g in (s.get("glosses") or []):
        m = REF.search(g)
        if m:
            out.append(m.group(1))
        m = REFT.search(g)
        if m:
            out.append(m.group(1))
    seen = set()
    res = []
    for x in out:
        if x and x not in seen:
            seen.add(x)
            res.append(x)
    return res


def sense_extra(s):
    for fo in (s.get("form_of") or []):
        if fo.get("extra"):
            return fo["extra"]
    return ""


def _ok(c):
    return bool(c) and penalty(c) == 0 and not USAGE.match(c) and not JARGON.search(c) \
        and not (BADANY.search(c) or REF.search(c))


def inline_gloss(s):
    """A licensed English gloss carried inline inside a form/usage reference."""
    ex = sense_extra(s)
    if ex:
        c = clean(ex)
        if _ok(c):
            return c, True
    for g in (s.get("glosses") or []):
        g2 = transform(g)
        isref = bool(BADANY.search(g2) or REF.search(g2))
        c = clean(g2)
        if _ok(c) and not isref:
            return c, False
        if isref and len(c) <= 25 and _ok(c):
            return c, False
        if isref and "," in g2:
            tail = clean(g2.rsplit(",", 1)[1])
            if len(tail) <= 25 and _ok(tail):
                return tail, False
        if isref and ";" in g2:
            for seg in g2.split(";")[1:]:
                c2 = clean(_core_of(seg))
                if len(c2) <= 25 and _ok(c2):
                    return c2, False
    return "", False


def gloss_for(word, want_pos="", depth=0):
    """Return (gloss, pos, method) for `word`; ('', '', '') if nothing licensed."""
    if depth > 3 or not word:
        return ("", "", "")
    entries = kaik.get(word)
    if not entries:
        return ("", "", "")
    cands = []
    for e in entries:
        ep = map_pos(e.get("pos"))
        if not ep:
            continue
        prio = 0 if (not want_pos or ep == want_pos) else 1
        for si, s in enumerate(e.get("senses") or []):
            gl = s.get("glosses") or []
            if not gl:
                continue
            rare = 2 * len(set(s.get("tags") or []) & RARE)
            base = gl[0]
            base_cost = prio * 50 + rare + si * 0.1
            c0 = clean(base)
            if c0 and _ok(c0):
                cands.append((base_cost + penalty(c0), c0, ep, "direct"))
                continue
            is_ref = bool(s.get("form_of")) or bool(BADANY.search(base)) or bool(REF.search(base))
            if not is_ref:
                continue
            c, strong = inline_gloss(s)
            if c:
                cands.append((base_cost + (0.05 if strong else 0.1), c, ep,
                              "extra" if strong else "inline"))
                continue
            for r in refs_of_sense(s)[:3]:
                if r == word:
                    continue
                g2, _p2, _ = gloss_for(r, ep, depth + 1)
                if g2:
                    cands.append((base_cost + 1.5, g2, ep, "form"))
                    break
            continue
    if not cands:
        return ("", "", "")
    cands.sort(key=lambda x: x[0])
    best = cands[0]
    return (best[1], best[2], "kaikki-" + best[3])


# ---------------------------------------------------------------- 3. Tatoeba examples
TOK = re.compile(r"[^\W\d_]+", re.U)
best = {}
with zipfile.ZipFile(fetch(MANYTHINGS_URL, "spa-eng.zip", 1024 * 50)) as z:
    with z.open("spa.txt") as f:
        for raw in f:
            cols = raw.decode("utf-8").rstrip("\r\n").split("\t")
            if len(cols) < 2:
                continue
            en, es = cols[0].strip(), cols[1].strip()
            if not (8 <= len(es) <= 70) or not en:
                continue
            score = abs(len(es) - 40)
            for tok in set(t.lower() for t in TOK.findall(es)):
                cur = best.get(tok)
                if cur is None or score < cur[0]:
                    best[tok] = (score, es, en)
p("tatoeba: examples found for %d target tokens" % len(best))


def san(s):
    return re.sub(r"\s+", " ", s.replace("\t", " ").replace("\n", " ").replace("\r", " ")).strip()


# ---------------------------------------------------------------- 4. assemble
rows = []
skipped = []
for w in TARGET_RANK:
    if len(rows) >= N:
        break
    hint = HINTS.get(w, "")
    gloss, pos, method = gloss_for(w, hint)
    if not gloss:
        skipped.append((w, "no-gloss"))
        continue
    entry = pick_entry(w, hint or pos)
    reading, rsrc = reading_for(w, entry)
    ex = best.get(w.lower())
    exes, exen = (san(ex[1]), san(ex[2])) if ex else ("", "")
    rows.append((w, reading, pos, gloss, exes, exen, method, rsrc, "tatoeba" if ex else ""))


def cov(idx):
    return sum(1 for r in rows if r[idx])


with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
    f.write("rank\tword\treading\tpos\tenglish\texample\texample_english\n")
    for i, r in enumerate(rows, 1):
        f.write("\t".join([str(i)] + list(r[:6])) + "\n")

n = len(rows)
p("")
p("WROTE %d words -> %s (skipped %d unresolvable, deepest frequency rank %d)" %
  (n, OUT, len(skipped), ranked.index(rows[-1][0]) + 1 if rows else 0))
p("  english   %4d (%.1f%%)" % (cov(3), 100.0 * cov(3) / n))
p("  reading   %4d (%.1f%%)" % (cov(1), 100.0 * cov(1) / n))
p("  pos       %4d (%.1f%%)" % (cov(2), 100.0 * cov(2) / n))
p("  example   %4d (%.1f%%)" % (cov(4), 100.0 * cov(4) / n))
from collections import Counter
p("  gloss source   :", dict(Counter(r[6] for r in rows)))
p("  reading source :", dict(Counter(r[7] for r in rows)))
p("  example source :", dict(Counter(r[8] for r in rows)))
p("  first skipped  :", [w for w, _ in skipped[:40]])
