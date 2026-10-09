/*
 * SQWease safe storage: JSON/string access that never throws on corrupt data,
 * disabled storage, or quota errors. Keys stay namespaced with `sqwease-`.
 */
(function (global) {
    'use strict';

    function getString(key, fallback) {
        try {
            var v = global.localStorage.getItem(key);
            return v == null ? fallback : v;
        } catch (e) {
            return fallback;
        }
    }

    function setString(key, value) {
        try {
            global.localStorage.setItem(key, String(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    function get(key, fallback) {
        var raw = getString(key, null);
        if (raw == null) return fallback;
        try {
            return JSON.parse(raw);
        } catch (e) {
            remove(key); // corrupt value: drop it so the next write is clean
            return fallback;
        }
    }

    function set(key, value) {
        try {
            return setString(key, JSON.stringify(value));
        } catch (e) {
            return false;
        }
    }

    function getInt(key, fallback) {
        var n = parseInt(getString(key, ''), 10);
        return isFinite(n) ? n : fallback;
    }

    function remove(key) {
        try { global.localStorage.removeItem(key); } catch (e) {}
    }

    global.SqweaseStore = {
        get: get,
        set: set,
        getString: getString,
        setString: setString,
        getInt: getInt,
        remove: remove
    };
})(typeof window !== 'undefined' ? window : this);
