/**
 * Romaji conversion (modified Hepburn) and particle/polite token helpers.
 * Single source of truth: kana → romaji; token coloring (kanji + !particle).
 */
(function(global) {
    'use strict';

    // --- Modified Hepburn: じ/ぢ→ji, ず/づ→zu; long vowels; ん before vowel→n'; っ→double consonant ---

    /** Base hiragana (gojuon) to romaji. し→shi, ち→chi, つ→tsu, ふ→fu. */
    var H_BASE = {
        'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
        'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
        'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
        'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
        'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
        'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
        'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
        'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
        'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
        'わ': 'wa', 'を': 'wo', 'ん': 'n'
    };
    /** Dakuten (ga, za, da, ba). じ/ぢ→ji, ず/づ→zu. */
    var H_DAKU = {
        'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
        'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
        'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
        'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo'
    };
    /** Handakuten (pa). */
    var H_HANDAKU = {
        'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po'
    };
    /** Small y combinations: きゃ→kya, しゃ→sha, ちゃ→cha, にゃ→nya, ひゃ→hya, みゃ→mya, りゃ→rya, ぎゃ→gya, じゃ→ja, びゃ→bya, ぴゃ→pya. */
    var H_SMALL_Y = {
        'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
        'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
        'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
        'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
        'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
        'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
        'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
        'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
        'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
        'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
        'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo'
    };

    /** Katakana base (same romaji as hiragana). */
    var K_BASE = {
        'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
        'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
        'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
        'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
        'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
        'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
        'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
        'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
        'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
        'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n'
    };
    var K_DAKU = {
        'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
        'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
        'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
        'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo'
    };
    var K_HANDAKU = {
        'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po'
    };
    var K_SMALL_Y = {
        'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
        'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
        'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
        'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
        'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
        'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
        'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
        'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
        'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
        'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
        'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo'
    };

    function buildSingleMap() {
        var m = {};
        function add(map) { for (var k in map) m[k] = map[k]; }
        add(H_BASE); add(H_DAKU); add(H_HANDAKU); add(K_BASE); add(K_DAKU); add(K_HANDAKU);
        add(H_SMALL_Y); add(K_SMALL_Y);
        return m;
    }
    var SINGLE = buildSingleMap();

    /** First consonant cluster of romaji syllable (for sokuon doubling). きゃ→k, しゃ→sh. */
    function getLeadingConsonant(romaji) {
        if (!romaji) return '';
        var s = romaji.toLowerCase();
        if (/^[aiueo]/.test(s)) return '';
        var match = s.match(/^(ch|sh|ts|[kgztdnhfbpmyrw])([aiueo]?)/);
        return match ? (match[1] || '') : (s.charAt(0) || '');
    }

    /**
     * Convert kana string to romaji (modified Hepburn).
     * Input: hiragana + katakana only (callers pass per-token kana).
     * Rules: じ/ぢ/ず/づ → ji/zu; long vowels; ん before vowel → n'; っ/ッ → double next consonant; ー → extend previous vowel.
     * @param {string} kana
     * @returns {string} lowercase romaji
     */
    function kanaToRomaji(kana) {
        if (kana == null || typeof kana !== 'string') return '';
        var s = kana.trim();
        if (s.length === 0) return '';
        var out = '';
        var i = 0;
        var lastVowel = ''; // for ー (katakana long vowel)
        while (i < s.length) {
            var c = s[i];
            var c2 = s[i + 1];
            // Sokuon っ/ッ: double next consonant (advance by kana chars consumed, not romaji length)
            if (c === 'っ' || c === 'ッ') {
                i++;
                if (i >= s.length) { out += 't'; break; }
                var nextResult = readOneOrTwoWithLen(s, i);
                if (nextResult) {
                    var cons = getLeadingConsonant(nextResult.romaji);
                    if (cons) out += cons;
                    out += nextResult.romaji;
                    i += nextResult.chars;
                } else {
                    out += 't';
                }
                continue;
            }
            // ん/ン before vowel or y → n'
            if (c === 'ん' || c === 'ン') {
                var nextIsVowelOrY = false;
                if (c2) {
                    var nextR = SINGLE[c2];
                    if (nextR && /^[aiueo]/.test(nextR)) nextIsVowelOrY = true;
                    if (c2 === 'や' || c2 === 'ゆ' || c2 === 'よ' || c2 === 'ャ' || c2 === 'ュ' || c2 === 'ョ') nextIsVowelOrY = true;
                    if (c2 === 'ゃ' || c2 === 'ゅ' || c2 === 'ょ') nextIsVowelOrY = true;
                }
                out += nextIsVowelOrY ? "n'" : 'n';
                i++;
                continue;
            }
            // Katakana long vowel ー: extend previous vowel
            if (c === 'ー') {
                if (lastVowel && /[aiueo]/.test(lastVowel)) out += lastVowel;
                else out += lastVowel || ' ';
                i++;
                continue;
            }
            // Two-char small y (e.g. きゃ)
            var two = c + (c2 || '');
            if (SINGLE[two]) {
                var rom = SINGLE[two];
                out += rom;
                lastVowel = (rom.match(/[aiueo]/g) || []).pop() || '';
                i += 2;
                continue;
            }
            // Single char
            if (SINGLE[c]) {
                var r = SINGLE[c];
                out += r;
                lastVowel = (r.match(/[aiueo]/g) || []).pop() || '';
                i++;
                continue;
            }
            i++;
        }
        return out.toLowerCase();
    }

    function readOneOrTwo(str, start) {
        var r = readOneOrTwoWithLen(str, start);
        return r ? r.romaji : null;
    }
    /** @returns {{ romaji: string, chars: number }|null} */
    function readOneOrTwoWithLen(str, start) {
        var c = str[start];
        var c2 = str[start + 1];
        var two = c + (c2 || '');
        if (SINGLE[two]) return { romaji: SINGLE[two], chars: 2 };
        if (SINGLE[c]) return { romaji: SINGLE[c], chars: 1 };
        return null;
    }

    // --- Particle / polite sets (research doc Section 6) ---
    var PARTICLES_ROMAJI = new Set([
        'ga', 'wa', 'o', 'wo', 'ni', 'e', 'de', 'to',
        'kara', 'made', 'yori', 'mo', 'no', 'ya', 'ka',
        'ne', 'yo', 'nado', 'shika', 'dake'
    ]);
    var POLITE_ROMAJI = new Set([
        'desu', 'deshita', 'da', 'masu', 'mashita',
        'masen', 'masen deshita', 'datta'
    ]);

    function normalizeRomajiForParticle(r) {
        if (r == null) return '';
        return String(r).trim().toLowerCase().replace(/[.,!?]/g, '');
    }

    /**
     * @param {{ ja?: string, kana?: string, romaji?: string, en?: string, start?: number, end?: number, pos?: string, isParticle?: boolean }} token
     * @returns {boolean}
     */
    function isParticleToken(token) {
        if (token == null) return false;
        if (token.isParticle !== undefined) return !!token.isParticle;
        var r = normalizeRomajiForParticle(token.romaji);
        if (PARTICLES_ROMAJI.has(r)) return true;
        if (POLITE_ROMAJI.has(r)) return true;
        if (r === 'masen' && token.romaji != null && /deshita/i.test(String(token.romaji))) return true;
        return false;
    }

    /** @param {{ ja: string }} token */
    function containsKanji(token) {
        if (token == null || token.ja == null) return false;
        return /[\u4e00-\u9faf]/.test(token.ja);
    }

    /**
     * Color token iff it contains kanji and is not a particle.
     * @param {{ ja: string, romaji?: string, isParticle?: boolean }} token
     * @returns {boolean}
     */
    function shouldColorToken(token) {
        return containsKanji(token) && !isParticleToken(token);
    }

    global.Romaji = {
        kanaToRomaji: kanaToRomaji,
        isParticleToken: isParticleToken,
        containsKanji: containsKanji,
        shouldColorToken: shouldColorToken,
        PARTICLES_ROMAJI: PARTICLES_ROMAJI,
        POLITE_ROMAJI: POLITE_ROMAJI
    };
})(typeof window !== 'undefined' ? window : this);

/*
 * Optional test list for kanaToRomaji (modified Hepburn):
 *   がっこう → gakkou
 *   しんぶん → shinbun
 *   さんぽ → sanpo
 *   こんや → kon'ya
 *   コーヒー → koohii
 *   じ → ji, ず → zu
 * Run romaji-test.js in browser (after romaji.js) to verify.
 */
