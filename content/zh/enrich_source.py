#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regenerate content/zh/source.tsv for the SQWease Mandarin deck.

Real data only, deterministic, no fabrication, no machine translation. Run from
the repo root:

    python content/zh/enrich_source.py

Inputs (downloaded to a temp cache, never into the repo):
  * FrequencyWords zh_cn_50k  (OpenSubtitles 2018)   CC BY-SA 4.0
  * CC-CEDICT mdbg export                            CC BY-SA 4.0
  * Unihan_Readings.txt (kMandarin)                  Unicode License V3
  * kaikki.org / Wiktextract Chinese extract         CC BY-SA 3.0
  * jieba dict.txt (word freq pos)                   MIT
  * Tatoeba cmn + eng sentences + links              CC BY 2.0 FR

Pipeline
  1. Read the frequency list; keep all-Han tokens.
  2. Normalize Traditional -> Simplified using CC-CEDICT's own trad->simp table
     and merge counts, so 說/说 and 這/这 do not split the frequency. A character
     that is itself a Simplified headword is never remapped (keeps 什么 != 什幺).
  3. Rank by merged count (ties by first appearance).
  4. Enrich the reading + gloss from CC-CEDICT. For single characters, Unihan
     kMandarin picks the common reading; the matching CC-CEDICT entry supplies
     pinyin + gloss, preferring non-variant, non-proper-noun, non-onomatopoeia
     entries.
  5. Tokens absent from CC-CEDICT are skipped, never guessed. Take 2500.
     (The word set is frozen here; pos/example are added below without changing
     which words are selected, so the stable zh-#### SRS ids never move.)
  6. pos: the kaikki Chinese extract is indexed by the Simplified form of each
     Traditional headword (kaikki emits Simplified forms as soft-redirects, so
     CC-CEDICT's trad->simp table is used to map them). Where kaikki gives one
     part of speech it wins; where it gives several, jieba's corpus-frequency tag
     breaks the tie when it is one of them; otherwise kaikki's most frequent is
     used. Words kaikki does not tag (mostly single Han characters, which
     Wiktionary files as "character") fall back to jieba.
  7. example + example_english: the shortest Tatoeba cmn<->eng sentence pair that
     contains the word, preferring a single occurrence. Tatoeba cmn sentences are
     script-normalized to Simplified with the same CC-CEDICT table (the deck is
     Simplified). Blank when no pair exists; never translated.

This file lives under content/zh/ (next to its output) because the sourcing task
restricted writes to content/zh/** and data/zh/**.
"""
import bz2, gzip, io, os, re, sys, json, tarfile, zipfile, tempfile, urllib.request
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "content", "zh", "source.tsv")
CACHE = os.path.join(tempfile.gettempdir(), "sqwease-zh-src")
os.makedirs(CACHE, exist_ok=True)
TARGET = 2500

FREQ_URL = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/zh_cn/zh_cn_50k.txt"
CED_URL = "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz"
UNI_URL = "https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip"
KAIKKI_URL = "https://kaikki.org/dictionary/Chinese/kaikki.org-dictionary-Chinese.jsonl.gz"
JIEBA_URL = "https://raw.githubusercontent.com/fxsjy/jieba/master/jieba/dict.txt"
CMN_URL = "https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences.tsv.bz2"
ENG_URL = "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2"
LINKS_URL = "https://downloads.tatoeba.org/exports/links.tar.bz2"

def fetch(url, name, min_size=1024):
    dest = os.path.join(CACHE, name)
    if os.path.exists(dest) and os.path.getsize(dest) >= min_size:
        return dest
    sys.stderr.write("downloading " + url + "\n")
    urllib.request.urlretrieve(url, dest)
    return dest

FREQ = fetch(FREQ_URL, "zh_cn_50k.txt")
CED = fetch(CED_URL, "cedict.txt.gz")
UNI_ZIP = fetch(UNI_URL, "Unihan.zip")

# ---- tone marks ---------------------------------------------------------
TONE = {"a": "āáǎà", "o": "ōóǒò", "e": "ēéěè",
        "i": "īíǐì", "u": "ūúǔù", "ü": "ǖǘǚǜ"}

def add_tone(syl, tone):
    if tone in (0, 5):
        return syl
    for v in "aoe":
        if v in syl:
            idx = syl.index(v)
            break
    else:
        idx = max(i for i, c in enumerate(syl) if c in "iuü")
    return syl[:idx] + TONE[syl[idx]][tone - 1] + syl[idx + 1:]

def tone_marks(pinyin):
    out = []
    for tok in pinyin.split():
        m = re.match(r"^([A-Za-zü:]+?)([1-5])?$", tok)
        if not m:
            out.append(tok.lower()); continue
        letters = m.group(1).replace("u:", "ü").replace("v", "ü").lower()
        num = m.group(2)
        out.append(add_tone(letters, int(num)) if num else letters)
    return " ".join(out)

VAR_RE = re.compile(r"^(?:(?:old|erhua)\s+)?variant of\b|^see\b", re.I)

def clean_gloss(parts):
    for p in parts:
        p = p.strip()
        if not p or p.startswith("CL:"):
            continue
        p = re.sub(r"\[[^\]]*\]", "", p).strip()
        if not p:
            continue
        if VAR_RE.match(p) and len(parts) > 1:
            continue
        return p
    for p in parts:
        p = re.sub(r"\[[^\]]*\]", "", p).strip()
        if p:
            return p
    return ""

# ---- Unihan kMandarin ---------------------------------------------------
UNI = os.path.join(CACHE, "Unihan_Readings.txt")
if not os.path.exists(UNI):
    with zipfile.ZipFile(UNI_ZIP) as z:
        z.extract("Unihan_Readings.txt", CACHE)
kmandarin = {}
with io.open(UNI, encoding="utf-8") as f:
    for line in f:
        if line.startswith("#") or not line.strip():
            continue
        cp, field, val = line.rstrip("\n").split("\t")
        if field == "kMandarin":
            kmandarin[chr(int(cp[2:], 16))] = val

# ---- parse CC-CEDICT ----------------------------------------------------
CED_LINE = re.compile(r"^(\S+)\s+(\S+)\s+\[([^\]]*)\]\s*/(.*)/\s*$")
ced = {}
full_raw, char_raw = {}, {}
with gzip.open(CED, "rt", encoding="utf-8") as f:
    for line in f:
        line = line.rstrip("\n")
        if not line or line.startswith("#"):
            continue
        m = CED_LINE.match(line)
        if not m:
            continue
        trad, simp, py, defs = m.group(1), m.group(2), m.group(3), m.group(4)
        parts = [p for p in defs.split("/") if p.strip()]
        ced.setdefault(simp, []).append((trad, py, parts))
        if trad == simp:
            continue
        full_raw.setdefault(trad, simp)
        if len(trad) == len(simp) == 1:
            char_raw.setdefault(trad, simp)

simp_set = set(ced.keys())
trad2simp_full = {t: s for t, s in full_raw.items() if t not in simp_set}
trad2simp_char = {t: s for t, s in char_raw.items() if t not in simp_set}

def resolve_variant(gloss, py):
    if not VAR_RE.match(gloss):
        return gloss
    m = re.search(r"variant of (\S+)|see (\S+)", gloss)
    if not m:
        return gloss
    ref = m.group(1) or m.group(2)
    ref = ref.split("|")[-1] if "|" in ref else ref
    ref = re.sub(r"\[.*$", "", ref)
    tgt = tone_marks(py)
    for trad, rpy, parts in ced.get(ref, []):
        if tone_marks(rpy) == tgt:
            g = clean_gloss(parts)
            if g and not VAR_RE.match(g):
                return g
    return gloss

def pick(w):
    entries = ced.get(w)
    if not entries:
        return None
    targets = set()
    if len(w) == 1 and w in kmandarin:
        targets = set(t.lower() for t in kmandarin[w].split())
    best, bestscore = None, None
    for trad, py, parts in entries:
        g = clean_gloss(parts)
        if not g:
            continue
        reading = tone_marks(py)
        read_ok = (not targets) or (reading in targets)
        score = (1 if read_ok else 0,
                 0 if VAR_RE.match(g) else 1,
                 1 if py[:1].islower() else 0,
                 0 if g.startswith("(onom") else 1,
                 1 if trad == w else 0)
        if bestscore is None or score > bestscore:
            bestscore, best = score, (reading, resolve_variant(g, py))
    return best

def to_simp(w):
    if w in trad2simp_full:
        return trad2simp_full[w]
    return "".join(trad2simp_char.get(ch, ch) for ch in w)

HAN = re.compile(r"^[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+$")

# ---- frequency -> ranked unique simplified tokens -----------------------
counts, order = {}, {}
with io.open(FREQ, encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        bits = line.rsplit(" ", 1)
        if len(bits) != 2:
            continue
        w, c = bits[0], bits[1]
        if not HAN.match(w):
            continue
        s = to_simp(w)
        if not HAN.match(s):
            continue
        try:
            n = int(c)
        except ValueError:
            continue
        counts[s] = counts.get(s, 0) + n
        order.setdefault(s, len(order))
ranked = sorted(counts.items(), key=lambda kv: (-kv[1], order[kv[0]]))

rows, misses = [], 0
for w, _ in ranked:
    if len(rows) >= TARGET:
        break
    hit = pick(w)
    if hit is None or not hit[1]:
        misses += 1
        continue
    rows.append((w, hit[0], hit[1]))

# ======================================================================== POS
# kaikki Chinese uses the Traditional form as the page title and emits the
# Simplified form only as a "soft-redirect"; index by to_simp(headword).
KAIKKI = fetch(KAIKKI_URL, "kaikki-zh.jsonl.gz", 1024 * 1024)
JIEBA = fetch(JIEBA_URL, "jieba_dict.txt", 1024 * 100)

KA_BAD = {"soft-redirect", "character", "symbol", "punct", "romanization",
          "infix", "interfix", "root", "affix", "contraction", "abbreviation"}
KA_POS = {"noun": "noun", "verb": "verb", "adj": "adj", "adv": "adv",
          "pron": "pron", "det": "det", "num": "num", "conj": "conj",
          "prep": "prep", "particle": "part", "intj": "interj",
          "classifier": "counter", "name": "name", "phrase": "phrase",
          "proverb": "phrase", "suffix": "suffix", "prefix": "prefix",
          "postp": "prep", "circumpos": "prep", "onomatopoeia": "onomat",
          "article": "art"}

kai_pos = defaultdict(Counter)
with gzip.open(KAIKKI, "rt", encoding="utf-8") as f:
    for line in f:
        if '"word"' not in line:
            continue
        try:
            o = json.loads(line)
        except Exception:
            continue
        p = o.get("pos")
        if p in KA_BAD:
            continue
        s = to_simp(o.get("word") or "")
        if not s or not HAN.match(s):
            continue
        kai_pos[s][KA_POS.get(p, p)] += 1

# jieba tag -> readable POS (ICTCLAS-style tags; MIT, corpus frequency)
JIEBA_POS = {"n": "noun", "nr": "name", "ns": "name", "nt": "name",
             "nz": "name", "nl": "noun", "ng": "noun", "an": "noun",
             "nrt": "name", "nrfg": "name", "nrf": "name", "nsf": "name",
             "f": "noun", "s": "noun", "t": "noun", "tg": "noun", "g": "noun",
             "v": "verb", "vn": "verb", "vd": "verb", "vg": "verb",
             "vi": "verb", "vl": "verb",
             "a": "adj", "ad": "adj", "ag": "adj", "z": "adj", "zg": "adj",
             "b": "adj",  # 区别词 (attributive-only), e.g. 女/副/总
             "d": "adv", "dg": "adv", "df": "adv",
             "r": "pron", "rz": "pron", "p": "prep", "c": "conj",
             "m": "num", "mq": "num", "q": "counter",
             "u": "part", "ul": "part", "uj": "part", "uz": "part",
             "ug": "part", "ud": "part", "uv": "part", "y": "part",
             "e": "interj", "o": "onomat", "i": "phrase", "l": "phrase",
             "j": "abbr", "h": "prefix", "k": "suffix", "x": "other"}
jieba_pos = {}
with io.open(JIEBA, encoding="utf-8") as f:
    for line in f:
        c = line.split()
        if len(c) >= 3:
            jieba_pos[c[0]] = JIEBA_POS.get(c[2], "")

def pos_for(w):
    """Return (readable_pos, provenance). kaikki first, jieba fills/tiebreaks."""
    k = kai_pos.get(w)
    if k:
        if len(k) == 1:
            return next(iter(k)), "kaikki"
        jp = jieba_pos.get(w)
        if jp and jp in k:
            return jp, "kaikki+jieba"
        return k.most_common(1)[0][0], "kaikki"
    jp = jieba_pos.get(w)
    if jp:
        return jp, "jieba"
    return "", "none"

# ================================================================== EXAMPLES
CMN = fetch(CMN_URL, "cmn_sentences.tsv.bz2", 1024 * 100)
ENG = fetch(ENG_URL, "eng_sentences.tsv.bz2", 1024 * 1000)
LINKS = fetch(LINKS_URL, "links.tar.bz2", 1024 * 1024)

def san(s):
    return re.sub(r"\s+", " ", (s or "").replace("\t", " ")
                  .replace("\n", " ").replace("\r", " ")).strip()

sys.stderr.write("loading Tatoeba cmn sentences\n")
cmn = {}
with bz2.open(CMN, "rt", encoding="utf-8") as f:
    for line in f:
        c = line.rstrip("\n").split("\t")
        if len(c) >= 3 and c[2].strip():
            cmn[int(c[0])] = to_simp(san(c[2]))

sys.stderr.write("loading Tatoeba eng sentence ids\n")
eng_ids = set()
with bz2.open(ENG, "rt", encoding="utf-8") as f:
    for line in f:
        c = line.split("\t", 2)
        if len(c) >= 3:
            eng_ids.add(int(c[0]))

sys.stderr.write("scanning Tatoeba links\n")
pairs = []
with tarfile.open(LINKS, "r:bz2") as tf:
    member = [m for m in tf.getmembers() if m.isfile()][0]
    fx = tf.extractfile(member)
    prev = b""
    while True:
        chunk = fx.read(1 << 22)
        if not chunk:
            break
        data = prev + chunk
        lines = data.split(b"\n")
        prev = lines.pop()
        for L in lines:
            if not L:
                continue
            q = L.split(b"\t")
            if len(q) != 2:
                continue
            a, b = int(q[0]), int(q[1])
            if a in cmn and b in eng_ids:
                pairs.append((a, b))
            elif b in cmn and a in eng_ids:
                pairs.append((b, a))

sys.stderr.write("loading Tatoeba eng texts for %d pairs\n" % len(pairs))
need = set(e for _, e in pairs)
eng = {}
with bz2.open(ENG, "rt", encoding="utf-8") as f:
    for line in f:
        c = line.split("\t", 2)
        if len(c) >= 3 and int(c[0]) in need:
            eng[int(c[0])] = san(c[2])

words = set(w for w, _, _ in rows)
maxlen = max(len(w) for w in words)
best = {}
for cid, eid in pairs:
    text = cmn.get(cid)
    en = eng.get(eid)
    if not text or not en:
        continue
    if not (2 <= len(text) <= 40) or len(en) > 100:
        continue
    n = len(text)
    for i in range(n):
        for L in range(1, min(maxlen, n - i) + 1):
            sub = text[i:i + L]
            if sub in words:
                occ = text.count(sub)
                score = (0 if occ == 1 else 1,
                         abs(len(text) - 12) + abs(len(en) - 28) * 0.25)
                cur = best.get(sub)
                if cur is None or score < cur[0]:
                    best[sub] = (score, text, en)

def example_for(w):
    hit = best.get(w)
    if hit:
        return hit[1], hit[2], "tatoeba"
    return "", "", "none"

# ================================================================== ASSEMBLE
def cf(s):
    return s.replace("\t", " ").replace("\n", " ").replace("\r", " ").strip()

pos_src = Counter()
ex_src = Counter()
out = []
for w, reading, gloss in rows:
    pos, psrc = pos_for(w)
    ex, exen, esrc = example_for(w)
    pos_src[psrc] += 1
    ex_src[esrc] += 1
    out.append((w, reading, pos, gloss, ex, exen))

with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
    f.write("rank\tword\treading\tpos\tenglish\texample\texample_english\n")
    for i, (w, reading, pos, gloss, ex, exen) in enumerate(out, 1):
        f.write("\t".join([str(i), cf(w), cf(reading), cf(pos), cf(gloss),
                           cf(ex), cf(exen)]) + "\n")

n = len(out)
def cov(idx):
    return sum(1 for r in out if r[idx])

sys.stderr.write("wrote %d words to %s (skipped %d unmatched; %d unique tokens)\n"
                 % (n, os.path.relpath(OUT, ROOT), misses, len(ranked)))
sys.stderr.write("  reading   %4d (%.1f%%)\n" % (cov(1), 100.0 * cov(1) / n))
sys.stderr.write("  english   %4d (%.1f%%)\n" % (cov(3), 100.0 * cov(3) / n))
sys.stderr.write("  pos       %4d (%.1f%%)\n" % (cov(2), 100.0 * cov(2) / n))
both = sum(1 for r in out if r[4] and r[5])
sys.stderr.write("  example   %4d (%.1f%%; both fields)\n" % (both, 100.0 * both / n))
sys.stderr.write("  pos source   : %s\n" % dict(pos_src))
sys.stderr.write("  example source: %s\n" % dict(ex_src))
sys.stderr.write("  score = %.4f\n"
                 % (0.3 * cov(2) / n + 0.3 * both / n
                    + 0.2 * cov(1) / n + 0.2 * cov(3) / n))
