/**
 * Optional tests for Romaji.kanaToRomaji (modified Hepburn).
 * Load after romaji.js in browser (e.g. <script src="romaji.js"></script><script src="romaji-test.js"></script>).
 */
(function() {
    'use strict';
    if (typeof Romaji === 'undefined' || !Romaji.kanaToRomaji) return;
    var tests = [
        { kana: 'がっこう', expected: 'gakkou' },
        { kana: 'しんぶん', expected: 'shinbun' },
        { kana: 'さんぽ', expected: 'sanpo' },
        { kana: 'こんや', expected: "kon'ya" },
        { kana: 'コーヒー', expected: 'koohii' },
        { kana: 'じ', expected: 'ji' },
        { kana: 'ず', expected: 'zu' }
    ];
    var passed = 0;
    var failed = 0;
    for (var i = 0; i < tests.length; i++) {
        var t = tests[i];
        var got = Romaji.kanaToRomaji(t.kana);
        if (got === t.expected) {
            passed++;
        } else {
            failed++;
            if (typeof console !== 'undefined' && console.error) {
                console.error('kanaToRomaji("' + t.kana + '") expected "' + t.expected + '", got "' + got + '"');
            }
        }
    }
    if (typeof console !== 'undefined' && console.log) {
        console.log('Romaji tests: ' + passed + ' passed, ' + failed + ' failed');
    }
})();
