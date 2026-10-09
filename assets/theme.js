/*
 * SQWease theme: no-flash bootstrap + toggle.
 * Load synchronously in <head> (runs before paint so the theme attribute is set
 * without a flash) and again nothing else is needed; click handlers attach on
 * DOMContentLoaded.
 */
(function (global) {
    'use strict';
    var KEY = 'sqwease-theme';

    function get() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    function apply(theme) {
        theme = theme === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem(KEY, theme); } catch (e) {}
        var btns = document.querySelectorAll('.theme-toggle');
        for (var i = 0; i < btns.length; i++) {
            btns[i].setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        }
    }

    function toggle() {
        apply(get() === 'dark' ? 'light' : 'dark');
    }

    function init() {
        // Re-apply the stored value and sync aria-pressed.
        var stored = null;
        try { stored = localStorage.getItem(KEY); } catch (e) {}
        apply(stored === 'dark' || stored === 'light' ? stored : 'light');
        var btns = document.querySelectorAll('.theme-toggle');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', toggle);
        }
        global.dispatchEvent(new Event('sqwease:themechange'));
    }

    global.SqweaseTheme = { get: get, apply: apply, toggle: toggle };

    // Apply immediately (head load, before <body> exists) to avoid a flash.
    (function bootstrap() {
        var stored = null;
        try { stored = localStorage.getItem(KEY); } catch (e) {}
        var theme = (stored === 'dark' || stored === 'light') ? stored
            : (global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
    })();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(typeof window !== 'undefined' ? window : this);
