/*
 * SQWease target-language registry.
 * `ui` is the UI locale; `target` is the language being learned. New language
 * branches add their deck at data/<code>/vocab.js and (if needed) correct one entry
 * here. Nothing else in the core app needs to change.
 */
(function (global) {
    'use strict';
    var KEY = 'sqwease-target-lang';

    var LANGS = [
        {
            code: 'ja', name: 'Japanese', nativeName: '日本語', script: 'Jpan',
            direction: 'ltr', romanization: 'romaji',
            dataModule: 'data/ja/vocab.js', tokenizable: true, wordSegmentation: 'none',
            capabilities: { flashcards: true, boxes: true, kana: true, kanji: true, editor: true }
        },
        {
            code: 'es', name: 'Spanish', nativeName: 'Español', script: 'Latn',
            direction: 'ltr', romanization: 'none',
            dataModule: 'data/es/vocab.js', tokenizable: false, wordSegmentation: 'whitespace',
            capabilities: { flashcards: true, boxes: false, kana: false, kanji: false, editor: false }
        },
        {
            code: 'fr', name: 'French', nativeName: 'Français', script: 'Latn',
            direction: 'ltr', romanization: 'none',
            dataModule: 'data/fr/vocab.js', tokenizable: false, wordSegmentation: 'whitespace',
            capabilities: { flashcards: true, boxes: false, kana: false, kanji: false, editor: false }
        },
        {
            code: 'ko', name: 'Korean', nativeName: '한국어', script: 'Hang',
            direction: 'ltr', romanization: 'rr',
            dataModule: 'data/ko/vocab.js', tokenizable: false, wordSegmentation: 'whitespace',
            capabilities: { flashcards: true, boxes: false, kana: false, kanji: false, editor: false }
        },
        {
            code: 'zh', name: 'Mandarin', nativeName: '中文', script: 'Hans',
            direction: 'ltr', romanization: 'pinyin',
            dataModule: 'data/zh/vocab.js', tokenizable: false, wordSegmentation: 'required',
            capabilities: { flashcards: true, boxes: false, kana: false, kanji: false, editor: false }
        }
    ];

    function list() { return LANGS.slice(); }

    function find(code) {
        for (var i = 0; i < LANGS.length; i++) {
            if (LANGS[i].code === code) return LANGS[i];
        }
        return null;
    }

    function getActive() {
        var stored = global.SqweaseStore ? SqweaseStore.getString(KEY, '') : '';
        return find(stored) ? stored : 'ja';
    }

    function getActiveLang() { return find(getActive()); }

    function setActive(code) {
        if (!find(code)) code = 'ja';
        if (global.SqweaseStore) SqweaseStore.setString(KEY, code);
        if (document.body) document.body.setAttribute('data-target-lang', code);
        global.dispatchEvent(new Event('sqwease:targetchange'));
        return code;
    }

    function apply() {
        var code = getActive();
        if (document.body) document.body.setAttribute('data-target-lang', code);
        return code;
    }

    global.SqweaseLangs = {
        defaultCode: 'ja',
        list: list,
        find: find,
        getActive: getActive,
        getActiveLang: getActiveLang,
        setActive: setActive,
        apply: apply
    };

    global.addEventListener('DOMContentLoaded', apply);
})(typeof window !== 'undefined' ? window : this);
