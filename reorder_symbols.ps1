# Reorder CSV file to move all symbols to the bottom
cd "d:\projects\personal-projects\japanese-learning-app\content"

$content = Get-Content "japanese-fluency-vocab.csv" -Encoding UTF8

$symbols = @()
$vocabulary = @()

foreach ($line in $content) {
    if ($line -match '^([^,]+),') {
        $firstField = $matches[1]
        # Check if the first field is a symbol/punctuation mark
        if ($firstField -match '^[!"#$%&''()*+,\-./:;<=>?@[\\\]^_`{|}~、。〃〜・『』「」【】《》〈〉『』〝〟〞゛゜´｀¨¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿×÷∀∃∅∈∉∋∌∏∑∞∠∟∠∡∢∥∦∧∨∩∪∫∮√∝∵∴≒≡≠≦≧≪≫⊂⊃⊆⊇⊥⊨⊩⊫⊿⋮⋯⋰⋱∇∂∆∇∈∋⊆⊇⊂⊃∪∩∧∨¬⇒⇔∀∃∠⊥∥∦≅≈≡≠≪≫∽∝∵∴⋈⊗⊕⊙⊘⊚⊛⊜⊝⊞⊟⊠⊡⋄⋅⋆⋇⋈⋉⋊⋋⋌⋍⋎⋏⋐⋑⋒⋓⋔⋕⋖⋗⋘⋙⋚⋛⋜⋝⋞⋟⋠⋡⋢⋣⋤⋥⋦⋧⋨⋩⋪⋫⋬⋭⋮⋯⋰⋱⋲⋳⋴⋵⋶⋷⋸⋹⋺⋻⋼⋽⋾⋿⌀⌂⌐⌒⌓⌖⊙⏧⏨⏩⏪⏫⏬⏭⏮⏯⏰⏱⏲⏳⏴⏵⏶⏷⏸⏹⏺⏻⏼⏽⏾⏿]$' -or
            $firstField -match '^[a-zA-Z]$' -or
            $firstField -match '^.$' -and $firstField -notmatch '[\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]') {
            $symbols += $line
        } else {
            $vocabulary += $line
        }
    } else {
        # Handle empty first line or malformed lines
        $vocabulary += $line
    }
}

# Write the reordered content
$newContent = $vocabulary + $symbols
$newContent | Out-File -Encoding UTF8 "japanese-fluency-vocab-reordered.csv"

Write-Host "Reordering complete:"
Write-Host "Vocabulary entries: $($vocabulary.Count)"
Write-Host "Symbol entries: $($symbols.Count)"
Write-Host "Total entries: $($newContent.Count)"