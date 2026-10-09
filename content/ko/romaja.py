# -*- coding: utf-8 -*-
"""Revised Romanization (RR) of Korean, deterministic, no dependencies.

Transcribes standard pronunciation, per the Revised Romanization system:
liaison, nasal assimilation, ㄹ-assimilation, ㅎ-aspiration, palatalization.
Output is lower-case plain a-z. Used only as a fallback where Wiktionary has
no romanization for the exact surface form; validated against Wiktionary.
"""

CHO = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h','l']
JUNG = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i']
JONG = ['','k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t']

# jamo indices
GC,GG,GN,GD,GR,GM,GB,GS,GY = 0,1,2,3,5,6,7,9,11   # onsets g kk n d r m b s j-index...
IDX = {'ㄱ':0,'ㄲ':1,'ㄴ':2,'ㄷ':3,'ㄸ':4,'ㄹ':5,'ㅁ':6,'ㅂ':7,'ㅃ':8,'ㅅ':9,'ㅆ':10,'ㅇ':11,
       'ㅈ':12,'ㅉ':13,'ㅊ':14,'ㅋ':15,'ㅌ':16,'ㅍ':17,'ㅎ':18}
JONGI = {'':0,'ㄱ':1,'ㄲ':2,'ㄳ':3,'ㄴ':4,'ㄵ':5,'ㄶ':6,'ㄷ':7,'ㄹ':8,'ㄺ':9,'ㄻ':10,'ㄼ':11,
         'ㄽ':12,'ㄾ':13,'ㄿ':14,'ㅀ':15,'ㅁ':16,'ㅂ':17,'ㅄ':18,'ㅅ':19,'ㅆ':20,'ㅇ':21,
         'ㅈ':22,'ㅊ':23,'ㅋ':24,'ㅌ':25,'ㅍ':26,'ㅎ':27}
JONG_JAMO = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

SBase = 0xAC00
def decomp(ch):
    c = ord(ch) - SBase
    return c // (21 * 28), (c % (21 * 28)) // 28, c % 28

def is_hangul(ch):
    return 0xAC00 <= ord(ch) <= 0xD7A3

def romanize(text):
    syl = []
    for ch in text:
        if is_hangul(ch):
            syl.append(list(decomp(ch)))
        else:
            # non-Hangul: keep as-is (rare in the corpus)
            syl.append(('x', ch, 0))
    # handle literal chunks: merge simple
    # apply rules left to right
    n = len(syl)
    for i in range(n - 1):
        a = syl[i]
        b = syl[i + 1]
        if a[0] == 'x':
            continue
        cho1, jung1, jong1 = a
        cho2, jung2, jong2 = b
        if b[0] == 'x':
            continue
        # ---- aspiration / ㅎ ----
        if jong1 in (27, 6, 15):  # ㅎ, ㄶ, ㅀ
            merged_cho = 27  # marker
            if jong1 == 6:
                jong1 = 4  # ㄶ -> ㄴ
            elif jong1 == 15:
                jong1 = 8  # ㅀ -> ㄹ
            else:
                jong1 = 0
            if cho2 == 0:      # ㄱ -> ㅋ
                cho2 = 15
            elif cho2 == 3:    # ㄷ -> ㅌ
                cho2 = 16
            elif cho2 == 7:    # ㅂ -> ㅍ
                cho2 = 17
            elif cho2 == 12:   # ㅈ -> ㅊ
                cho2 = 14
            elif cho2 == 11:   # ㅇ : ㅎ is silent
                pass
        elif cho2 == 18 and jong1 in (1, 2, 24, 7, 25, 17, 26):  # onset ㅎ after stop
            if jong1 in (1, 2, 24):
                cho2 = 15; jong1 = 0
            elif jong1 in (7, 25):
                cho2 = 16; jong1 = 0
            elif jong1 in (17, 26):
                cho2 = 17; jong1 = 0
        # ---- palatalization: ㄷ/ㅌ + 이 ----
        if jong1 in (7, 25) and cho2 == 11 and jung2 == 20:  # + 이
            cho2 = 14 if jong1 == 25 else 12  # ㅌ->ㅊ, ㄷ->ㅈ
            jong1 = 0
        if jong1 in (7,) and cho2 == 18 and jung2 == 20:  # ㄷ + 히
            cho2 = 14; jong1 = 0
        # ---- ㄹ assimilation ----
        if cho2 == 5:  # onset ㄹ
            if jong1 == 4:        # ㄴ + ㄹ -> ll
                jong1 = 8; cho2 = 19
            elif jong1 == 8:      # ㄹ + ㄹ -> ll
                cho2 = 19
            elif jong1 in (1, 2, 24, 7, 25, 17, 26):
                if jong1 in (1, 2, 24): jong1 = 21
                elif jong1 in (7, 25): jong1 = 4
                else: jong1 = 16
                cho2 = 2  # ㄴ
            elif jong1 in (16, 21):
                cho2 = 2
        elif cho2 == 2 and jong1 == 8:  # ㄹ + ㄴ -> ll
            cho2 = 19
        # ---- nasal assimilation ----
        if cho2 in (2, 6) and jong1:
            if jong1 in (1, 2, 24): jong1 = 21
            elif jong1 in (7, 25): jong1 = 4
            elif jong1 in (17, 26): jong1 = 16
            elif jong1 in (19, 20, 22, 23): jong1 = 4  # ㅅ/ㅆ/ㅈ/ㅊ + ㄴ/ㅁ -> n
        # ---- liaison: coda + silent ㅇ (only if still a coda and not ㅇ) ----
        if cho2 == 11 and jong1 not in (0, 21):
            if jong1 in DOUBLE_LIAISON:
                jong1, cho2 = DOUBLE_LIAISON[jong1]
            else:
                cho2 = JONG_TO_CHO[jong1]
                jong1 = 0
        a[0], a[1], a[2] = cho1, jung1, jong1
        b[0], b[1], b[2] = cho2, jung2, jong2

    out = []
    for s in syl:
        if s[0] == 'x':
            out.append(s[1]); continue
        cho, jung, jong = s
        out.append(CHO[cho] + JUNG[jung] + JONG[jong])
    return ''.join(out)

JONG_TO_CHO = {1:0,2:1,4:2,7:3,8:5,16:6,17:7,19:9,20:10,22:12,23:14,24:15,25:16,26:17,27:18}
# double final + silent ㅇ onset -> (remaining coda, next onset); '-1' = ㅎ silent
DOUBLE_LIAISON = {
    3:(1,9),   # ㄳ -> k + s
    5:(4,12),  # ㄵ -> n + j
    6:(4,11),  # ㄶ -> n + (h silent)
    9:(8,0),   # ㄺ -> l + g
    10:(8,6),  # ㄻ -> l + m
    11:(8,7),  # ㄼ -> l + b
    12:(8,9),  # ㄽ -> l + s
    13:(8,16), # ㄾ -> l + t
    14:(8,17), # ㄿ -> l + p
    15:(8,11), # ㅀ -> l + (h silent)
    18:(17,9), # ㅄ -> p + s
}

if __name__ == '__main__':
    import sys
    for w in sys.argv[1:]:
        print(w, romanize(w))
