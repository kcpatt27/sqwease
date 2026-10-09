/*
 * Japanese deck adapter.
 *
 * The Japanese deck is still produced as `flashcards-vocab.js`
 * (`const FLASHCARDS_VOCAB = [...]`) by scripts/build-flashcards-vocab.js.
 * This adapter normalizes it into the multi-language deck contract so the core
 * pages can load every language through SqweaseVocab.load(code).
 */
(function () {
    'use strict';

    function getLegacy() {
        // `const` at the top level of a classic script is a global lexical binding,
        // not a window property, so check the bare identifier too.
        if (typeof FLASHCARDS_VOCAB !== 'undefined') return FLASHCARDS_VOCAB;
        return window.FLASHCARDS_VOCAB || [];
    }

    function adapt() {
        var src = getLegacy();
        var words = [];
        for (var i = 0; i < src.length; i++) {
            var x = src[i];
            words.push({
                id: 'ja-' + (i + 1),
                w: x.w,
                p: x.p,
                d: x.d,
                s: x.s,
                tokens: x.tokens
            });
        }
        var deck = { lang: 'ja', version: 1, generatedAt: '2026-10-09', words: words };
        if (window.SqweaseVocab && window.SqweaseVocab.provide) {
            window.SqweaseVocab.provide('ja', deck);
        } else {
            window.SQWEASE_VOCAB = deck;
        }
    }

    if (typeof FLASHCARDS_VOCAB !== 'undefined' || window.FLASHCARDS_VOCAB) {
        adapt();
        return;
    }

    var s = document.createElement('script');
    s.src = 'flashcards-vocab.js';
    s.onload = adapt;
    s.onerror = adapt; // adapt() will provide an empty deck; the page shows a message
    document.head.appendChild(s);
})();
