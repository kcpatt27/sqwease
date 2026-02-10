/**
 * Syllable-based color coding for romaji/Japanese (Gojuon-style).
 *
 * CONTRACT: Color is determined ONLY from romaji (first syllable of each romaji word/token).
 * - Syllable → color: getFirstSyllable(romaji) → row → palette. We never use English text
 *   or English syllables to pick a color.
 * - Japanese segments and English translated words INHERIT the color of their aligned
 *   romaji counterpart. JA and EN are never passed to getColorForRomaji.
 *
 * Row colors: あ=red, か/が=orange, さ=yellow (su/suki=like), た=teal, な=blue,
 * は=purple, ま=tan, や=olive, ら=magenta, わ=brown.
 *
 * Debug: set window.SyllableColorDebug = true and open the console to log (romaji, syllable, row, color) for every getColorForRomaji call.
 */
(function(global) {
    'use strict';

    var vowel_RED = 'hsl(0, 76.60%, 54.70%)'; /* red for monograph vowels (a, i, u, e, o) */
    var k_ORANGE = 'hsl(22, 79.60%, 53.90%)'; /* orange for monographs and digraphs (ka, ki, ku, ke, ko, kya, kyu, kyo) */
    var k_LIGHT = 'hsl(22, 79.20%, 71.80%)'; /* lighter orange for diacritics and digraphs with diacritics (gyo, gya, gyu, ga, go, gi, ge, gu) */
    var s_YELLOW = 'hsl(59, 100.00%, 45.10%)'; /* yellow for monographs and digraphs (sa, shi, su, se, so, sha, shu, sho) */
    var s_LIGHT = 'hsl(54, 76.20%, 72.00%)'; /* lighter yellow for diacritics and digraphs with diacritics (zu, ze, za, zo, ji, ja, ju, jo) */
    var t_GREEN = 'hsl(140, 65.10%, 53.90%)'; /* green for monographs and digraphs (ta, chi, tsu, te, to, cha, chu, cho) */
    var t_LIGHT = 'hsl(160, 49.10%, 66.90%)'; /* lighter green for diacritics (da, ji, zu, de, do) */
    var n_BLUE = 'hsl(207, 81.90%, 49.80%)'; /* blue for monographs and digraphs (na, ni, nu, ne, no, nya, nyu, nyo) */
    var h_PURPLE = 'hsl(268, 78.30%, 63.90%)'; /* purple for monographs and digraphs (ha, hi, fu, he, ho, hya, hyu, hyo) */
    var h_LIGHT = 'hsl(268, 68.10%, 72.90%)'; /* lighter purple for diacritics and digraphs with diacritics (bi, ba, bu, be, bo, pa, pi, pu, pe, po, bya, byu, byo, pya, pyu, pyo) */
    var m_NAVY_BLUE = 'hsl(226, 51.10%, 46.50%)'; /* navy blue for monographs and digraphs (ma, mi, mu, me, mo, mya, myu, myo) */
    var y_MAGENTA = 'hsl(315, 42.60%, 49.20%)'; /* magenta for monographs (ya, yu, yo) */
    var r_BROWN = 'hsl(33, 29.60%, 39.00%)'; /* brown for monographs and digraphs (ra, ri, ru, re, ro, rya, ryu, ryo) */
    var w_GRAY = 'hsl(0, 0.00%, 62.00%)'; /* gray for monographs wa and wo */

    var LIGHT = {
        vowel: vowel_RED,   
        k: k_ORANGE,      
        g: k_LIGHT, 
        s: s_YELLOW,       
        z: s_LIGHT, 
        t: t_GREEN,      
        d: t_LIGHT, 
        n: n_BLUE,      
        h: h_PURPLE,      
        b: h_LIGHT, 
        p: h_LIGHT, 
        m: m_NAVY_BLUE,      
        y: y_MAGENTA,      
        r: r_BROWN,      
        w: w_GRAY       
    };
    var DARK = {
        vowel: vowel_RED,   
        k: k_ORANGE,      
        g: k_LIGHT, 
        s: s_YELLOW,       
        z: s_LIGHT, 
        t: t_GREEN,      
        d: t_LIGHT, 
        n: n_BLUE,      
        h: h_PURPLE,      
        b: h_LIGHT, 
        p: h_LIGHT, 
        m: m_NAVY_BLUE,      
        y: y_MAGENTA,      
        r: r_BROWN,      
        w: w_GRAY 
    };

    /** Get first syllable from romaji (e.g. "nihon" -> "ni", "ichi" -> "i"). */
    function getFirstSyllable(romaji) {
        if (!romaji || typeof romaji !== 'string') return '';
        var s = romaji.trim().toLowerCase();
        if (/^[aiueo]/.test(s)) return s.charAt(0);
        var m = s.match(/^(ch|sh|ts|ky|gy|ny|hy|my|ry|by|py|[kgsztdnhfbpmyrw])([aiueo])?/);
        if (m) return (m[1] || '') + (m[2] || '');
        if (/^[a-z]/.test(s)) return s.charAt(0);
        return '';
    }

    /** Map first syllable to row key: consonant letter (k, g, s, z, t, d, n, h, b, p, m, y, r, w) or vowel. */
    function syllableToRow(syllable) {
        if (!syllable) return 'vowel';
        var c = syllable.charAt(0);
        if (/[aiueo]/.test(c)) return 'vowel';
        if (c === 'g') return 'g';
        if (c === 'k') return 'k';
        if (syllable.indexOf('j') === 0 || c === 'z') return 'z';
        if (c === 's' || syllable.indexOf('sh') === 0) return 's';
        if (c === 'd') return 'd';
        if (c === 't' || syllable.indexOf('ch') === 0 || syllable.indexOf('ts') === 0) return 't';
        if (c === 'n') return 'n';
        if (c === 'p') return 'p';
        if (c === 'b') return 'b';
        if (c === 'h' || c === 'f') return 'h';
        if (c === 'm') return 'm';
        if (c === 'y') return 'y';
        if (c === 'r') return 'r';
        if (c === 'w') return 'w';
        return 'vowel';
    }

    /** Return hex color for a romaji string (uses first syllable). Call only with romaji; never with English. */
    function getColorForRomaji(romaji, isDark) {
        var syl = getFirstSyllable(romaji);
        var row = syllableToRow(syl);
        var palette = isDark ? DARK : LIGHT;
        var color = palette[row] || palette.vowel;
        if (typeof global !== 'undefined' && global.SyllableColorDebug) {
            try { console.log('SyllableColor', { romaji: romaji, syllable: syl, row: row, color: color }); } catch (e) {}
        }
        return color;
    }

    /** Wrap text in a span with background color from romaji's first syllable. */
    function colorize(text, romaji, isDark) {
        if (!text) return '';
        var color = getColorForRomaji(romaji, isDark);
        var span = document.createElement('span');
        span.style.color = color;
        span.style.fontWeight = '600';
        span.textContent = text;
        return span;
    }

    /** Return HTML string: span with color style for use in innerHTML. */
    function colorizeHtml(text, romaji, isDark) {
        if (!text) return '';
        var color = getColorForRomaji(romaji, isDark);
        return '<span style="color:' + color + ';font-weight:600">' + escapeHtml(text) + '</span>';
    }

    function escapeHtml(s) {
        if (s == null) return '';
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    /** Check if dark theme is active. */
    function isDarkTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    /** Common Japanese particles and helper words to exclude from coloring. */
    // why do we have this? why is the code not robust enough to handle particles? this needs to be refactored
    var PARTICLES = {
        'ga': true, 'wa': true, 'wo': true, 'o': true, 'ni': true, 'de': true, 'to': true,
        'ka': true, 'ne': true, 'yo': true, 'na': true, 'no': true, 'mo': true, 'ya': true,
        'desu': true, 'masu': true, 'da': true, 'deshita': true, 'mashita': true, 'masen': true,
        'kara': true, 'made': true, 'yori': true, 'node': true, 'kedo': true, 'keredo': true,
        'shi': true, 'te': true, 'ta': true, 'tari': true, 'nara': true, 'ba': true,
        'shite': true, 'imasu': true, 'shimasu': true, 'shimashita': true,
        'shiteimasu': true, 'imashita': true, 'imasen': true, 'arimasen': true, 'ja': true
    };
    
    /** Common English grammatical/function words to exclude from coloring (only true helpers, not content words). */
    // this also needs to be refactored, per the above comment
    var EN_HELPERS = {
        'i': true, 'you': true, 'he': true, 'she': true, 'it': true, 'we': true, 'they': true,
        'am': true, 'is': true, 'are': true, 'was': true, 'were': true, 'be': true, 'been': true,
        'a': true, 'an': true, 'the': true, 'to': true, 'of': true, 'in': true, 'on': true, 'at': true,
        'and': true, 'or': true, 'but': true, 'my': true, 'your': true, 'his': true, 'her': true,
        'its': true, 'our': true, 'their': true,
        'do': true, 'does': true, 'did': true, 'have': true, 'has': true, 'had': true,
        'want': true, 'because': true, 'not': true, 'no': true, 'yes': true,
        'can': true, 'will': true, 'would': true, 'could': true, 'should': true,
        'when': true, 'what': true, 'why': true, 'how': true, 'where': true, 'who': true, 'which': true,
        'that': true, 'this': true, 'some': true, 'any': true, 'with': true, 'for': true, 'from': true, 'about': true
    };


    /** Check if romaji word is a particle. */
    function isParticle(word) {
        return PARTICLES[word.toLowerCase().replace(/[.,!?]/g, '')];
    }
    
    /** Check if English word is a helper. */
    function isEnHelper(word) {
        return EN_HELPERS[word.toLowerCase().replace(/[.,!?]/g, '')];
    }

    /**
     * Split Japanese string into N segments by proportional character count (one segment per romaji word).
     * When the romaji word is a known particle, allocate 1 Japanese character (research §7 fallback).
     */
    function segmentJaByRomajiWordCount(ja, romajiWords) {
        if (!ja || !romajiWords.length) return [];
        var len = ja.length;
        var n = romajiWords.length;
        var particleCount = 0;
        var contentLengthTotal = 0;
        for (var i = 0; i < n; i++) {
            if (isParticle(romajiWords[i])) {
                particleCount += 1;
            } else {
                contentLengthTotal += romajiWords[i].length;
            }
        }
        var remainingForContent = len - particleCount;
        if (remainingForContent < 0) remainingForContent = 0;
        if (contentLengthTotal === 0) contentLengthTotal = 1;
        var segments = [];
        var start = 0;
        for (var i = 0; i < n; i++) {
            var take;
            if (i === n - 1) {
                take = len - start;
            } else if (isParticle(romajiWords[i])) {
                take = 1;
            } else {
                take = Math.round(remainingForContent * romajiWords[i].length / contentLengthTotal);
            }
            if (take < 1) take = 1;
            if (start + take > len) take = len - start;
            segments.push(ja.slice(start, start + take));
            start += take;
        }
        return segments;
    }

    /**
     * Color only content words (skip particles). Japanese: only color segments that match content romaji words.
     * English: verb-first (EN) maps to verb-last (JA). First EN content word → last JA color; remaining EN content words → JA colors in order (object1→object1, object2→object2). So SOV [obj1, obj2, verb] aligns with SVO [verb, obj1, obj2].
     * @param {number} [maxEnColors] - If provided (e.g. from token-based colored count), only this many EN content words get a color, so EN matches JA/romaji (e.g. kana-only words stay uncolored).
     * Returns {jaHtml, romajiHtml, enHtml}.
     */
    function colorizeByWords(ja, romaji, en, isDark, maxEnColors) {
        if (!romaji) {
            return {
                jaHtml: escapeHtml(ja || ''),
                romajiHtml: escapeHtml(romaji || ''),
                enHtml: escapeHtml(en || '')
            };
        }
        var romajiWords = romaji.trim().split(/\s+/).filter(Boolean);
        var enWords = (en || '').trim().split(/\s+/).filter(Boolean);
        var jaSegments = segmentJaByRomajiWordCount((ja || '').trim(), romajiWords);

        /* Colors come ONLY from romaji; never from English. */
        var colors = [];
        for (var i = 0; i < romajiWords.length; i++) {
            if (!isParticle(romajiWords[i])) {
                colors.push(getColorForRomaji(romajiWords[i], isDark));
            }
        }

        var romajiHtml = '';
        var jaHtml = '';
        var enHtml = '';

        for (var i = 0; i < romajiWords.length; i++) {
            var rWord = romajiWords[i];
            var isContent = !isParticle(rWord);
            var colorIdx = 0;
            for (var j = 0; j < i; j++) if (!isParticle(romajiWords[j])) colorIdx++;
            if (isContent && colorIdx < colors.length) {
                var colorStyle = 'color:' + colors[colorIdx] + ';font-weight:600';
                romajiHtml += (i > 0 ? ' ' : '') + '<span style="' + colorStyle + '">' + escapeHtml(rWord) + '</span>';
            } else {
                romajiHtml += (i > 0 ? ' ' : '') + escapeHtml(rWord);
            }
        }

        for (var i = 0; i < jaSegments.length; i++) {
            var seg = jaSegments[i];
            var isContent = i < romajiWords.length && !isParticle(romajiWords[i]);
            var colorIdx = 0;
            for (var j = 0; j < i; j++) if (j < romajiWords.length && !isParticle(romajiWords[j])) colorIdx++;
            if (isContent && colorIdx < colors.length) {
                var colorStyle = 'color:' + colors[colorIdx] + ';font-weight:600';
                jaHtml += '<span style="' + colorStyle + '">' + escapeHtml(seg) + '</span>';
            } else {
                jaHtml += escapeHtml(seg);
            }
        }

        /* EN inherits romaji-derived colors by position (SOV↔SVO mapping). We never use English text to pick a color. */
        var enContentIndices = [];
        for (var i = 0; i < enWords.length; i++) {
            if (!isEnHelper(enWords[i])) enContentIndices.push(i);
        }
        var numContent = Math.min(colors.length, enContentIndices.length);
        if (maxEnColors !== undefined && maxEnColors !== null) {
            numContent = Math.min(numContent, maxEnColors);
        }
        for (var i = 0; i < enWords.length; i++) {
            var idx = enContentIndices.indexOf(i);
            if (idx >= 0 && idx < numContent) {
                var reversedIdx = idx === 0 ? numContent - 1 : idx - 1;
                var colorStyle = 'color:' + colors[reversedIdx] + ';font-weight:600';
                enHtml += (i > 0 ? ' ' : '') + '<span style="' + colorStyle + '">' + escapeHtml(enWords[i]) + '</span>';
            } else {
                enHtml += (i > 0 ? ' ' : '') + escapeHtml(enWords[i]);
            }
        }

        return {
            jaHtml: jaHtml || escapeHtml(ja || ''),
            romajiHtml: romajiHtml || escapeHtml(romaji || ''),
            enHtml: enHtml || escapeHtml(en || '')
        };
    }

    /**
     * Token-based coloring: color is from token.romaji only; JA and token.en inherit that color.
     * Requires Romaji.shouldColorToken when Romaji is loaded. We never use token.en to pick a color.
     * @param {string} ja - Full sentence (source of truth for start/end)
     * @param {Array<{ja:string, kana?:string, romaji:string, en?:string|null, start:number, end:number}>} tokens
     * @param {boolean} isDark
     * @param {string} [fullEn] - Optional full English sentence; when set, enHtml is built from this (content words colored by token colors).
     * @returns {{jaHtml:string, romajiHtml:string, enHtml:string}}
     */
    function colorizeByTokens(ja, tokens, isDark, fullEn) {
        if (!tokens || !tokens.length) {
            return {
                jaHtml: escapeHtml(ja || ''),
                romajiHtml: '',
                enHtml: fullEn != null && fullEn !== '' ? escapeHtml(fullEn) : ''
            };
        }
        /* Color tokens that contain kanji and are not particles. Pure kana words (like なぜ/naze) are not colored. */
        var shouldColor = (typeof global.Romaji !== 'undefined' && global.Romaji.isParticleToken)
            ? function(t) { 
                var hasKanji = /[\u4e00-\u9faf]/.test(t.ja);
                var isParticle = global.Romaji.isParticleToken(t);
                return hasKanji && !isParticle;
              }
            : function(t) { return /[\u4e00-\u9faf]/.test(t.ja); };
        /* Color only from token.romaji; token.en inherits the same color. */
        var colors = [];
        for (var i = 0; i < tokens.length; i++) {
            if (shouldColor(tokens[i])) colors.push(getColorForRomaji(tokens[i].romaji, isDark));
        }
        var colorIdx = 0;
        var jaHtml = '';
        var romajiHtml = '';
        var enHtml = '';
        for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            var segJa = (ja || '').slice(t.start, t.end);
            var isContent = shouldColor(t);
            var colorStyle = isContent && colorIdx < colors.length ? 'color:' + colors[colorIdx] + ';font-weight:600' : '';
            if (isContent) colorIdx++;
            jaHtml += colorStyle
                ? '<span style="' + colorStyle + '">' + escapeHtml(segJa) + '</span>'
                : escapeHtml(segJa);
            if (t.romaji != null && t.romaji !== '') {
                romajiHtml += (romajiHtml ? ' ' : '') + (colorStyle
                    ? '<span style="' + colorStyle + '">' + escapeHtml(t.romaji) + '</span>'
                    : escapeHtml(t.romaji));
            }
            if (fullEn == null || fullEn === '') {
                if (t.en != null && t.en !== '') {
                    var enWord = String(t.en).trim().toLowerCase().replace(/[.,!?]/g, '');
                    var styleForEn = (colorStyle && !EN_HELPERS[enWord]) ? colorStyle : '';
                    enHtml += (enHtml ? ' ' : '') + (styleForEn
                        ? '<span style="' + styleForEn + '">' + escapeHtml(t.en) + '</span>'
                        : escapeHtml(t.en));
                }
            }
        }
        if (fullEn != null && fullEn !== '') {
            var enWords = fullEn.trim().split(/\s+/).filter(Boolean);
            var enContentIndices = [];
            for (var w = 0; w < enWords.length; w++) {
                if (!isEnHelper(enWords[w])) enContentIndices.push(w);
            }
            var numContent = Math.min(colors.length, enContentIndices.length);
            for (w = 0; w < enWords.length; w++) {
                var idx = enContentIndices.indexOf(w);
                if (idx >= 0 && idx < numContent && colors.length > 0) {
                    var reversedIdx = idx === 0 ? numContent - 1 : idx - 1;
                    var colorStyleEn = 'color:' + colors[reversedIdx] + ';font-weight:600';
                    enHtml += (enHtml ? ' ' : '') + '<span style="' + colorStyleEn + '">' + escapeHtml(enWords[w]) + '</span>';
                } else {
                    enHtml += (enHtml ? ' ' : '') + escapeHtml(enWords[w]);
                }
            }
        }
        return {
            jaHtml: jaHtml,
            romajiHtml: romajiHtml,
            enHtml: enHtml
        };
    }

    global.SyllableColor = {
        getFirstSyllable: getFirstSyllable,
        getColorForRomaji: getColorForRomaji,
        colorize: colorize,
        colorizeHtml: colorizeHtml,
        colorizeByWords: colorizeByWords,
        colorizeByTokens: colorizeByTokens,
        isDarkTheme: isDarkTheme
    };
})(typeof window !== 'undefined' ? window : this);
