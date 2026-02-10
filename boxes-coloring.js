/**
 * Boxes-specific coloring: single owner of rules for the 1-2-3 Boxes page.
 * Uses Romaji (isParticleToken, containsKanji) and SyllableColor (getColorForRomaji) as utilities.
 * Load after romaji.js and syllable-color.js.
 */
(function(global) {
    'use strict';

    function escapeHtml(s) {
        if (s == null) return '';
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function normalize(s) {
        return String(s).trim().toLowerCase().replace(/[.,!?]/g, '');
    }

    /** JA/romaji: do not color these tokens even if they have kanji. */
    var BOXES_SKIP_ROMAJI = { 'naze': true, 'anime': true, 'dorama': true, 'karaoke': true };

    /** EN: grammatical function words (do not color). */
    var EN_HELPERS = {
        'i': true, 'you': true, 'he': true, 'she': true, 'it': true, 'we': true, 'they': true,
        'am': true, 'is': true, 'are': true, 'was': true, 'were': true, 'be': true, 'been': true,
        'a': true, 'an': true, 'the': true, 'to': true, 'of': true, 'in': true, 'on': true, 'at': true,
        'and': true, 'or': true, 'but': true, 'my': true, 'your': true, 'his': true, 'her': true,
        'its': true, 'our': true, 'their': true,
        'do': true, 'does': true, 'did': true, 'have': true, 'has': true, 'had': true,
        'because': true, 'not': true, 'no': true, 'yes': true,
        'can': true, 'will': true, 'would': true, 'could': true, 'should': true,
        'when': true, 'what': true, 'why': true, 'how': true, 'where': true, 'who': true, 'which': true,
        'that': true, 'this': true, 'some': true, 'any': true, 'with': true, 'for': true, 'from': true, 'about': true
    };

    /** EN: content words we never color (loanwords). */
    var EN_NO_COLOR = { 'anime': true, 'dramas': true, 'karaoke': true, 'coffee': true, 'breakfast': true, 'apples': true, 'games': true, 'sports': true, 'udon': true, 'ramen': true, 'soba': true, 'mandarins': true };

    /** EN: multi-word phrases that get ONE color. */
    var EN_PHRASES = { 'hot springs': true, 'hot spring': true, 'get up': true, 'go home': true, 'every day': true };

    /** EN: time words/phrases that should map to JA time tokens. */
    var EN_TIME_WORDS = { 'night': true, 'weekend': true, 'noon': true, 'morning': true, 'afternoon': true, 'evening': true };
    var EN_TIME_PHRASES = { 'every day': true };

    function isEnHelper(word) {
        return EN_HELPERS[normalize(word)];
    }

    function isEnNoColor(word) {
        return EN_NO_COLOR[normalize(word)];
    }

    function shouldColorTokenForBoxes(t) {
        if (t == null) return false;
        if (typeof global.Romaji === 'undefined') return /[\u4e00-\u9faf]/.test(t.ja || '');
        if (!global.Romaji.containsKanji(t)) return false;
        if (global.Romaji.isParticleToken(t)) return false;
        var r = normalize(t.romaji);
        if (BOXES_SKIP_ROMAJI[r]) return false;
        return true;
    }

    /**
     * Color one boxes item (JA + romaji + EN) with boxes-specific rules.
     * @param {string} ja - Full Japanese sentence
     * @param {Array<{ja:string, romaji?:string, start:number, end:number}>} tokens
     * @param {boolean} isDark
     * @param {string} [fullEn] - Full English sentence (used for EN line; phrase grouping applied)
     * @returns {{jaHtml:string, romajiHtml:string, enHtml:string}}
     */
    function colorizeBoxesItem(ja, tokens, isDark, fullEn) {
        if (!tokens || !tokens.length) {
            return {
                jaHtml: escapeHtml(ja || ''),
                romajiHtml: '',
                enHtml: fullEn != null && fullEn !== '' ? escapeHtml(fullEn) : ''
            };
        }

        var getColor = (typeof global.SyllableColor !== 'undefined' && global.SyllableColor.getColorForRomaji)
            ? function(romaji) { return global.SyllableColor.getColorForRomaji(romaji, isDark); }
            : function() { return 'inherit'; };

        var colors = [];
        for (var i = 0; i < tokens.length; i++) {
            var sc = shouldColorTokenForBoxes(tokens[i]);
            var c = sc ? getColor(tokens[i].romaji) : null;
            if (sc) {
                colors.push(c);
            }
        }

        var colorIdx = 0;
        var jaHtml = '';
        var romajiHtml = '';
        var i, t, segJa, isContent, colorStyle;
        for (i = 0; i < tokens.length; i++) {
            t = tokens[i];
            segJa = (ja || '').slice(t.start, t.end);
            isContent = shouldColorTokenForBoxes(t);
            colorStyle = isContent && colorIdx < colors.length ? 'color:' + colors[colorIdx] + ';font-weight:600' : '';
            if (isContent) colorIdx++;
            jaHtml += colorStyle ? '<span style="' + colorStyle + '">' + escapeHtml(segJa) + '</span>' : escapeHtml(segJa);
            if (t.romaji != null && t.romaji !== '') {
                romajiHtml += (romajiHtml ? ' ' : '') + (colorStyle ? '<span style="' + colorStyle + '">' + escapeHtml(t.romaji) + '</span>' : escapeHtml(t.romaji));
            }
        }

        var enHtml = '';
        if (fullEn != null && fullEn !== '') {
            var enWords = fullEn.trim().split(/\s+/).filter(Boolean);
            var contentGroups = [];
            var w = 0;
            while (w < enWords.length) {
                var cur = normalize(enWords[w]);
                var next = w + 1 < enWords.length ? normalize(enWords[w + 1]) : '';
                var next2 = w + 2 < enWords.length ? normalize(enWords[w + 2]) : '';
                if (cur === 'want' && next === 'to' && next2 && !isEnHelper(next2)) {
                    contentGroups.push({ start: w, end: w + 3, noColor: false, allowHelpers: true });
                    w += 3;
                    continue;
                }
                if (isEnHelper(enWords[w])) { w++; continue; }
                var start = w;
                if (w + 1 < enWords.length && !isEnHelper(enWords[w + 1])) {
                    var two = (enWords[w] + ' ' + enWords[w + 1]).toLowerCase().replace(/[.,!?]/g, '');
                    var nextNorm = normalize(enWords[w + 1]);
                    var curNorm = normalize(enWords[w]);
                    if (EN_PHRASES[two] || (nextNorm === "o'clock" && /^\d+$/.test(curNorm))) {
                        w += 2;
                        contentGroups.push({ start: start, end: w, noColor: false });
                        continue;
                    }
                }
                w += 1;
                var single = normalize(enWords[start]);
                contentGroups.push({ start: start, end: w, noColor: isEnNoColor(enWords[start]) });
            }

            var numColorGroups = 0;
            for (var g = 0; g < contentGroups.length; g++) {
                if (!contentGroups[g].noColor) contentGroups[g].colorGroupIdx = numColorGroups++;
                else contentGroups[g].colorGroupIdx = -1;
            }
            function isEnTimeGroup(gr) {
                if (!gr || gr.start == null || gr.end == null) return false;
                var parts = [];
                for (var i = gr.start; i < gr.end; i++) {
                    parts.push(normalize(enWords[i]));
                }
                var phrase = parts.join(' ').trim();
                if (phrase && EN_TIME_PHRASES[phrase]) return true;
                if (parts.length === 1 && EN_TIME_WORDS[parts[0]]) return true;
                return false;
            }

            var lastTimeGroup = null;
            if (contentGroups.length) {
                var lastGroup = contentGroups[contentGroups.length - 1];
                if (lastGroup.colorGroupIdx >= 0 && isEnTimeGroup(lastGroup)) {
                    lastTimeGroup = lastGroup;
                }
            }

            for (w = 0; w < enWords.length; w++) {
                var gr = null;
                for (var g = 0; g < contentGroups.length; g++) {
                    if (w >= contentGroups[g].start && w < contentGroups[g].end) {
                        gr = contentGroups[g];
                        break;
                    }
                }
                if (gr != null && gr.colorGroupIdx >= 0 && colors.length > 0) {
                    if (isEnHelper(enWords[w]) && !gr.allowHelpers) {
                        enHtml += (enHtml ? ' ' : '') + escapeHtml(enWords[w]);
                        continue;
                    }
                    // SOV: first EN content word → last JA color; remaining EN content → JA colors in order (same as syllable-color.js).
                    // If EN ends with a time phrase and we have 3 groups, use full reverse to map time → first JA.
                    var useTimeReverse = (colors.length === 3 && numColorGroups === 3 && lastTimeGroup != null);
                    var reversedIdx = useTimeReverse
                        ? (colors.length - 1 - gr.colorGroupIdx)
                        : (gr.colorGroupIdx === 0 ? colors.length - 1 : gr.colorGroupIdx - 1);
                    if (reversedIdx < 0) reversedIdx = 0;
                    if (reversedIdx >= colors.length) reversedIdx = colors.length - 1;
                    
                    var colorStyleEn = 'color:' + colors[reversedIdx] + ';font-weight:600';
                    enHtml += (enHtml ? ' ' : '') + '<span style="' + colorStyleEn + '">' + escapeHtml(enWords[w]) + '</span>';
                } else {
                    enHtml += (enHtml ? ' ' : '') + escapeHtml(enWords[w]);
                }
            }
        }

        return { jaHtml: jaHtml, romajiHtml: romajiHtml, enHtml: enHtml };
    }

    global.BoxesColoring = {
        colorizeBoxesItem: colorizeBoxesItem
    };
})(typeof window !== 'undefined' ? window : this);
