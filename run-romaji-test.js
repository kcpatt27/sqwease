/* Run kanaToRomaji tests in Node. Usage: node run-romaji-test.js */
var fs = require('fs');
global.window = global;
eval(fs.readFileSync('romaji.js', 'utf8'));
var tests = [
    ['がっこう', 'gakkou'],
    ['しんぶん', 'shinbun'],
    ['さんぽ', 'sanpo'],
    ['こんや', "kon'ya"],
    ['コーヒー', 'koohii'],
    ['じ', 'ji'],
    ['ず', 'zu']
];
var passed = 0;
tests.forEach(function(t) {
    var got = Romaji.kanaToRomaji(t[0]);
    if (got === t[1]) {
        passed++;
    } else {
        console.error('FAIL:', t[0], 'expected', t[1], 'got', got);
    }
});
console.log('kanaToRomaji:', passed + '/' + tests.length, 'passed');
process.exit(passed === tests.length ? 0 : 1);
