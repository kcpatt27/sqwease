#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regenerate content/zh/source.tsv for the SQWease Mandarin deck.

Real data only, deterministic, no fabrication. Run from the repo root:

    python content/zh/enrich_source.py

Inputs (downloaded to a temp cache, never into the repo):
  * FrequencyWords zh_cn_50k  (OpenSubtitles 2018)   CC BY-SA 4.0
  * CC-CEDICT mdbg export                            CC BY-SA 4.0
  * Unihan_Readings.txt (kMandarin)                  Unicode License V3

Pipeline
  1. Read the frequency list; keep all-Han tokens.
  2. Normalize Traditional -> Simplified using CC-CEDICT's own trad->simp table
     and merge counts, so 說/说 and 這/这 do not split the frequency. A character
     that is itself a Simplified headword is never remapped (keeps 什么 != 什幺).
  3. Rank by merged count (ties by first appearance).
  4. Enrich from CC-CEDICT. For single characters, Unihan kMandarin picks the
     common reading; the matching CC-CEDICT entry supplies pinyin + gloss,
     preferring non-variant, non-proper-noun, non-onomatopoeia entries.
  5. Tokens absent from CC-CEDICT are skipped, never guessed. Take 2500.

This file lives under content/zh/ (next to its output) because the sourcing task
restricted writes to content/zh/** and data/zh/**.
"""
import gzip, io, os, re, sys, json, zipfile, tempfile, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "content", "zh", "source.tsv")
CACHE = os.path.join(tempfile.gettempdir(), "sqwease-zh-src")
os.makedirs(CACHE, exist_ok=True)
TARGET = 2500

FREQ_URL = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/zh_cn/zh_cn_50k.txt"
CED_URL = "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz"
UNI_URL = "https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip"

def fetch(url, name):
    dest = os.path.join(CACHE, name)
    if not os.path.exists(dest) or os.path.getsize(dest) == 0:
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

# ---- frequency -> ranked unique simplified tokens -----------------------
HAN = re.compile(r"^[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+$")
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

def cf(s):
    return s.replace("\t", " ").replace("\n", " ").replace("\r", " ").strip()

with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
    f.write("rank\tword\treading\tpos\tenglish\texample\texample_english\n")
    for i, (w, reading, gloss) in enumerate(rows, 1):
        f.write("\t".join([str(i), cf(w), cf(reading), "", cf(gloss), "", ""]) + "\n")

sys.stderr.write("wrote %d words to %s (skipped %d unmatched; %d unique tokens)\n"
                 % (len(rows), os.path.relpath(OUT, ROOT), misses, len(ranked)))
