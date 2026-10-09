/*
 * SQWease i18n: a tiny string table for UI chrome.
 * - Dictionaries: en, ja, es, fr, ko, zh. Missing keys fall back to `en`.
 * - Markup: data-i18n="key" (textContent) and data-i18n-attr="attr:key;attr2:key2".
 * - Non-English strings are a starter set and need native review (see ticket T-045).
 */
(function (global) {
    'use strict';

    var KEY = 'sqwease-ui-locale';
    var DEFAULT = 'en';
    var SUPPORTED = ['en', 'ja', 'es', 'fr', 'ko', 'zh'];

    var EN = {
        'common.menu': '← Menu',
        'common.toggleTheme': 'Toggle dark mode',
        'common.language': 'Language',
        'common.uiLanguage': 'Interface language',
        'common.targetLanguage': "I'm learning",
        'common.notAvailable': 'Not available for {lang} yet.',
        'app.name': 'SQWease',
        'app.full': 'Speak Quite Well with Ease',
        'app.tagline': 'Vocabulary and conversation practice',
        'index.hint.flashcards': '1,500 high-frequency words',
        'index.desc.flashcards': 'Flip to see romaji, definition, and example sentence.',
        'index.hint.boxes': 'Verbs with sentence patterns',
        'index.desc.boxes': 'Build real conversational habits with question and answer sets.',
        'index.hint.kana': 'Hiragana & Katakana',
        'index.desc.kana': 'Gojuon grid: vowels and consonants with romaji. Reference anytime.',
        'index.hint.kanji': 'Characters & meanings',
        'index.desc.kanji': 'Add and study your own Kanji list. Build a personal reference.',
        'index.hint.editor': 'Authoring',
        'index.desc.editor': 'Edit tokenized sentences, kana, romaji, and recompute from kana.',
        'nav.flashcards': 'Flashcards',
        'nav.boxes': '1-2-3 Boxes',
        'nav.kana': 'Kana Charts',
        'nav.kanji': 'Kanji List',
        'nav.editor': 'Sentence Editor',
        'fc.title': '{lang} {count}',
        'fc.new': 'New',
        'fc.learning': 'Learning',
        'fc.review': 'To Review',
        'fc.display': 'Display:',
        'fc.phase1': 'Phase 1 (romaji + definition)',
        'fc.phase2': 'Phase 2 (no romaji)',
        'fc.phase3': 'Phase 3 (word only)',
        'fc.studyNow': 'Study Now',
        'fc.tapToFlip': '(Tap or press Space to flip)',
        'fc.again': 'Again',
        'fc.hard': 'Hard',
        'fc.good': 'Good',
        'fc.easy': 'Easy',
        'fc.cardOf': 'Card {n} of {total}',
        'fc.ready': 'Ready to study!',
        'fc.noCardsDue': 'No cards due right now. Come back later or tomorrow for more new cards.',
        'fc.loading': 'Loading…',
        'err.noData': 'Could not load vocabulary for {lang}.',
        'a11y.flipCard': 'Flashcard. Activate to flip and reveal the answer.',
        'a11y.themeToggle': 'Toggle dark mode'
    };

    var JA = {
        'common.menu': '← メニュー',
        'common.toggleTheme': 'ダークモード切替',
        'common.language': '言語',
        'common.uiLanguage': '表示言語',
        'common.targetLanguage': '学習する言語',
        'common.notAvailable': '{lang} は未対応です。',
        'app.name': 'SQWease',
        'app.full': 'Speak Quite Well with Ease',
        'app.tagline': '単語と会話の練習',
        'nav.flashcards': '単語カード',
        'nav.boxes': '1-2-3 ボックス',
        'nav.kana': 'かな表',
        'nav.kanji': '漢字リスト',
        'nav.editor': '文エディター',
        'fc.new': '新規',
        'fc.learning': '学習中',
        'fc.review': '復習',
        'fc.display': '表示:',
        'fc.studyNow': '学習を始める',
        'fc.tapToFlip': '(タップまたはスペースで裏返す)',
        'fc.again': 'もう一度',
        'fc.hard': '難しい',
        'fc.good': '普通',
        'fc.easy': '簡単',
        'fc.cardOf': '{n} / {total} 枚目',
        'fc.ready': '学習の準備完了！',
        'fc.loading': '読み込み中…'
    };

    var ES = {
        'common.menu': '← Menú',
        'common.toggleTheme': 'Cambiar modo oscuro',
        'common.language': 'Idioma',
        'common.uiLanguage': 'Idioma de la interfaz',
        'common.targetLanguage': 'Estoy aprendiendo',
        'common.notAvailable': 'Todavía no disponible para {lang}.',
        'app.tagline': 'Práctica de vocabulario y conversación',
        'nav.flashcards': 'Tarjetas',
        'nav.boxes': 'Cajas 1-2-3',
        'nav.kana': 'Tablas de kana',
        'nav.kanji': 'Lista de kanji',
        'nav.editor': 'Editor de frases',
        'fc.new': 'Nuevas',
        'fc.learning': 'Aprendiendo',
        'fc.review': 'Por repasar',
        'fc.display': 'Mostrar:',
        'fc.studyNow': 'Estudiar ahora',
        'fc.tapToFlip': '(Toca o pulsa Espacio para girar)',
        'fc.again': 'Otra vez',
        'fc.hard': 'Difícil',
        'fc.good': 'Bien',
        'fc.easy': 'Fácil',
        'fc.cardOf': 'Tarjeta {n} de {total}',
        'fc.ready': '¡Listo para estudiar!',
        'fc.loading': 'Cargando…'
    };

    var FR = {
        'common.menu': '← Menu',
        'common.toggleTheme': 'Basculer le thème sombre',
        'common.language': 'Langue',
        'common.uiLanguage': "Langue de l'interface",
        'common.targetLanguage': "J'apprends",
        'common.notAvailable': 'Pas encore disponible pour {lang}.',
        'app.tagline': 'Entraînement de vocabulaire et de conversation',
        'nav.flashcards': 'Cartes',
        'nav.boxes': 'Boîtes 1-2-3',
        'nav.kana': 'Tableaux kana',
        'nav.kanji': 'Liste de kanji',
        'nav.editor': 'Éditeur de phrases',
        'fc.new': 'Nouvelles',
        'fc.learning': 'En cours',
        'fc.review': 'À réviser',
        'fc.display': 'Affichage :',
        'fc.studyNow': 'Étudier maintenant',
        'fc.tapToFlip': '(Touchez ou appuyez sur Espace pour retourner)',
        'fc.again': 'Encore',
        'fc.hard': 'Difficile',
        'fc.good': 'Bien',
        'fc.easy': 'Facile',
        'fc.cardOf': 'Carte {n} sur {total}',
        'fc.ready': 'Prêt à étudier !',
        'fc.loading': 'Chargement…'
    };

    var KO = {
        'common.menu': '← 메뉴',
        'common.toggleTheme': '다크 모드 전환',
        'common.language': '언어',
        'common.uiLanguage': '인터페이스 언어',
        'common.targetLanguage': '배우는 언어',
        'common.notAvailable': '{lang}은(는) 아직 지원되지 않습니다.',
        'app.tagline': '어휘 및 회화 연습',
        'nav.flashcards': '단어 카드',
        'nav.boxes': '1-2-3 상자',
        'nav.kana': '가나 표',
        'nav.kanji': '한자 목록',
        'nav.editor': '문장 편집기',
        'fc.new': '새 카드',
        'fc.learning': '학습 중',
        'fc.review': '복습',
        'fc.display': '표시:',
        'fc.studyNow': '공부 시작',
        'fc.tapToFlip': '(탭하거나 스페이스로 뒤집기)',
        'fc.again': '다시',
        'fc.hard': '어려움',
        'fc.good': '보통',
        'fc.easy': '쉬움',
        'fc.cardOf': '{total}장 중 {n}장',
        'fc.ready': '학습 준비 완료!',
        'fc.loading': '불러오는 중…'
    };

    var ZH = {
        'common.menu': '← 菜单',
        'common.toggleTheme': '切换深色模式',
        'common.language': '语言',
        'common.uiLanguage': '界面语言',
        'common.targetLanguage': '我在学习',
        'common.notAvailable': '{lang} 暂不支持。',
        'app.tagline': '词汇与会话练习',
        'nav.flashcards': '单词卡',
        'nav.boxes': '1-2-3 盒子',
        'nav.kana': '假名表',
        'nav.kanji': '汉字列表',
        'nav.editor': '句子编辑器',
        'fc.new': '新卡',
        'fc.learning': '学习中',
        'fc.review': '待复习',
        'fc.display': '显示：',
        'fc.studyNow': '开始学习',
        'fc.tapToFlip': '（点击或按空格翻面）',
        'fc.again': '重来',
        'fc.hard': '困难',
        'fc.good': '一般',
        'fc.easy': '简单',
        'fc.cardOf': '第 {n} / {total} 张',
        'fc.ready': '可以开始学习了！',
        'fc.loading': '加载中…'
    };

    var DICTS = { en: EN, ja: JA, es: ES, fr: FR, ko: KO, zh: ZH };

    function normalize(code) {
        if (!code) return DEFAULT;
        var c = String(code).toLowerCase().split('-')[0];
        return SUPPORTED.indexOf(c) >= 0 ? c : DEFAULT;
    }

    function getLocale() {
        var stored = global.SqweaseStore ? SqweaseStore.getString(KEY, '') : '';
        if (SUPPORTED.indexOf(stored) >= 0) return stored;
        return normalize(global.navigator && global.navigator.language);
    }

    function t(key, vars) {
        var loc = getLocale();
        var dict = DICTS[loc] || EN;
        var str = dict[key];
        if (str == null) str = EN[key];
        if (str == null) return key;
        if (vars) {
            str = str.replace(/\{(\w+)\}/g, function (m, name) {
                return vars[name] != null ? String(vars[name]) : m;
            });
        }
        return str;
    }

    function apply(root) {
        root = root || document;
        var nodes = root.querySelectorAll('[data-i18n]');
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
        }
        var attrNodes = root.querySelectorAll('[data-i18n-attr]');
        for (var j = 0; j < attrNodes.length; j++) {
            var spec = attrNodes[j].getAttribute('data-i18n-attr');
            var pairs = spec.split(';');
            for (var k = 0; k < pairs.length; k++) {
                var parts = pairs[k].split(':');
                if (parts.length === 2) attrNodes[j].setAttribute(parts[0].trim(), t(parts[1].trim()));
            }
        }
        var titleEl = document.querySelector('title[data-i18n]');
        if (titleEl) document.title = t(titleEl.getAttribute('data-i18n'));
    }

    function setLocale(code) {
        var c = normalize(code);
        if (global.SqweaseStore) SqweaseStore.setString(KEY, c);
        document.documentElement.setAttribute('lang', c);
        document.documentElement.setAttribute('dir', 'ltr');
        apply();
        global.dispatchEvent(new Event('sqwease:localechange'));
        return c;
    }

    function init() {
        var loc = getLocale();
        document.documentElement.setAttribute('lang', loc);
        document.documentElement.setAttribute('dir', 'ltr');
        apply();
    }

    global.SqweaseI18n = {
        supported: SUPPORTED,
        getLocale: getLocale,
        setLocale: setLocale,
        t: t,
        apply: apply,
        init: init
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(typeof window !== 'undefined' ? window : this);
