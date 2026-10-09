/*
 * SQWease vocabulary loader.
 *
 * A deck module (data/<code>/vocab.js) must call:
 *     SqweaseVocab.provide('<code>', { lang, version, generatedAt, words: [...] });
 * It may also simply set window.SQWEASE_VOCAB once loaded.
 *
 * load(code) returns a Promise that resolves with the deck. Decks are cached.
 * Language branches only add data/<code>/vocab.js — no core code changes.
 */
(function (global) {
    'use strict';

    var cache = {};
    var pending = {};
    var handlers = {};

    function provide(code, deck) {
        if (!code || !deck) return;
        if (deck.lang == null) deck.lang = code;
        cache[code] = deck;
        if (handlers[code]) {
            var h = handlers[code];
            delete handlers[code];
            h.resolve(deck);
        }
    }

    function takeGlobal(code) {
        var d = global.SQWEASE_VOCAB;
        if (d && (d.lang === code || d.lang == null) && d.words) {
            global.SQWEASE_VOCAB = null;
            provide(code, d);
            return true;
        }
        return false;
    }

    function load(code) {
        if (cache[code]) return Promise.resolve(cache[code]);
        if (pending[code]) return pending[code];
        pending[code] = new Promise(function (resolve, reject) {
            handlers[code] = { resolve: resolve, reject: reject };
            if (takeGlobal(code)) return;
            var s = document.createElement('script');
            s.src = 'data/' + code + '/vocab.js';
            s.onload = function () {
                // The module may provide() asynchronously (e.g. the ja adapter pulls
                // the legacy deck in). Give it a bounded grace period before failing.
                if (!handlers[code]) return; // already resolved via provide()
                setTimeout(function () {
                    if (handlers[code]) {
                        var h = handlers[code];
                        delete handlers[code];
                        delete pending[code];
                        h.reject(new Error('Vocabulary module for "' + code + '" did not provide a deck.'));
                    }
                }, 8000);
            };
            s.onerror = function () {
                if (handlers[code]) {
                    var h = handlers[code]; delete handlers[code]; delete pending[code];
                    h.reject(new Error('Could not load vocabulary for "' + code + '".'));
                }
            };
            document.head.appendChild(s);
        });
        return pending[code];
    }

    function get(code) {
        var c = code || (global.SqweaseLangs ? SqweaseLangs.getActive() : 'ja');
        return cache[c] || null;
    }

    global.SqweaseVocab = { load: load, provide: provide, get: get };
})(typeof window !== 'undefined' ? window : this);
