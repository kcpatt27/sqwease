/**
 * Syllable-based color coding for romaji/Japanese (Gojuon-style).
 * First syllable determines color: a/i/u/e/o = red, k+ = orange, s+ = yellow, etc.
 */
(function(global) {
    'use strict';

    var LIGHT = {
        vowel: '#c0392b',
        k: '#e67e22',
        s: '#f1c40f',
        t: '#27ae60',
        n: '#3498db',
        h: '#9b59b6',
        m: '#5c6bc0',
        y: '#27ae60',
        r: '#c0392b',
        w: '#a67c52'
    };
    var DARK = {
        vowel: '#e74c3c',
        k: '#f39c12',
        s: '#f1c40f',
        t: '#2ecc71',
        n: '#3498db',
        h: '#9b59b6',
        m: '#7986cb',
        y: '#2ecc71',
        r: '#e74c3c',
        w: '#b7956e'
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

    /** Map first syllable to row key (vowel, k, s, t, n, h, m, y, r, w). */
    function syllableToRow(syllable) {
        if (!syllable) return 'vowel';
        var c = syllable.charAt(0);
        if (/[aiueo]/.test(c)) return 'vowel';
        if (/[kg]/.test(c)) return 'k';
        if (/[sz]/.test(c) || syllable.indexOf('sh') === 0 || syllable.indexOf('j') === 0) return 's';
        if (/[td]/.test(c) || syllable.indexOf('ch') === 0 || syllable.indexOf('ts') === 0) return 't';
        if (c === 'n') return 'n';
        if (/[hfbp]/.test(c)) return 'h';
        if (c === 'm') return 'm';
        if (c === 'y') return 'y';
        if (c === 'r') return 'r';
        if (c === 'w') return 'w';
        return 'vowel';
    }

    /** Return hex color for a romaji string (uses first syllable). isDark = dark theme. */
    function getColorForRomaji(romaji, isDark) {
        var syl = getFirstSyllable(romaji);
        var row = syllableToRow(syl);
        var palette = isDark ? DARK : LIGHT;
        return palette[row] || palette.vowel;
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
    var PARTICLES = {
        'ga': true, 'wa': true, 'wo': true, 'o': true, 'ni': true, 'de': true, 'to': true,
        'ka': true, 'ne': true, 'yo': true, 'na': true, 'no': true, 'mo': true, 'ya': true,
        'desu': true, 'masu': true, 'da': true, 'deshita': true, 'mashita': true, 'masen': true,
        'kara': true, 'made': true, 'yori': true, 'node': true, 'kedo': true, 'keredo': true,
        'shi': true, 'te': true, 'ta': true, 'tari': true, 'nara': true, 'ba': true, 'kedo': true
    };
    
    /** Common English helper words to exclude from coloring. */
    var EN_HELPERS = {
        'i': true, 'you': true, 'he': true, 'she': true, 'it': true, 'we': true, 'they': true,
        'am': true, 'is': true, 'are': true, 'was': true, 'were': true, 'be': true, 'been': true,
        'a': true, 'an': true, 'the': true, 'to': true, 'of': true, 'in': true, 'on': true, 'at': true,
        'and': true, 'or': true, 'but': true, 'my': true, 'your': true, 'his': true, 'her': true,
        'its': true, 'our': true, 'their': true
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
     * English: assign colors in REVERSE order so SOV (kohi, suki) matches SVO (like, coffee) → kohi=coffee, suki=like.
     * Returns {jaHtml, romajiHtml, enHtml}.
     */
    function colorizeByWords(ja, romaji, en, isDark) {
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

        var enContentIndices = [];
        for (var i = 0; i < enWords.length; i++) {
            if (!isEnHelper(enWords[i])) enContentIndices.push(i);
        }
        var numContent = Math.min(colors.length, enContentIndices.length);
        for (var i = 0; i < enWords.length; i++) {
            var idx = enContentIndices.indexOf(i);
            if (idx >= 0 && idx < numContent) {
                var reversedIdx = numContent - 1 - idx;
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
     * Token-based coloring: use token start/end for Japanese; color only tokens where containsKanji && !isParticle.
     * Requires Romaji.shouldColorToken and Romaji.isParticleToken when Romaji is loaded.
     * @param {string} ja - Full sentence (source of truth for start/end)
     * @param {Array<{ja:string, kana?:string, romaji:string, en?:string|null, start:number, end:number, pos?:string, isParticle?:boolean}>} tokens
     * @param {boolean} isDark
     * @returns {{jaHtml:string, romajiHtml:string, enHtml:string}}
     */
    function colorizeByTokens(ja, tokens, isDark) {
        if (!tokens || !tokens.length) {
            return {
                jaHtml: escapeHtml(ja || ''),
                romajiHtml: '',
                enHtml: ''
            };
        }
        var shouldColor = (typeof global.Romaji !== 'undefined' && global.Romaji.shouldColorToken)
            ? global.Romaji.shouldColorToken.bind(global.Romaji)
            : function(t) { return /[\u4e00-\u9faf]/.test(t.ja) && !(typeof global.Romaji !== 'undefined' && global.Romaji.isParticleToken(t)); };
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
            if (t.en != null && t.en !== '') {
                enHtml += (enHtml ? ' ' : '') + (colorStyle
                    ? '<span style="' + colorStyle + '">' + escapeHtml(t.en) + '</span>'
                    : escapeHtml(t.en));
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
