# Simple reordering script for symbols
cd "d:\projects\personal-projects\japanese-learning-app\content"

$content = Get-Content "japanese-fluency-vocab.csv" -Encoding UTF8
$vocabulary = @()
$symbols = @()

foreach ($line in $content) {
    if ($line -match '^([^,]+),') {
        $firstField = $matches[1].Trim()

        # Check if it's a symbol by length and content
        if ($firstField.Length -le 3 -and
            ($firstField -match '^[!-/:-@\[-`{-~¡-ÿ、-〿]$' -or
             $firstField -match '^(・|〜|『|』|「|」|【|】|《|》|〈|〉|〝|〟|〞|゛|゜|´|｀|¨)$' -or
             $firstField -match '^[a-zA-Z]$' -or
             $firstField -match '^(\.\.\.|\-\-|\-\-\-)$')) {
            $symbols += $line
        } else {
            $vocabulary += $line
        }
    } else {
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

# Also replace the original file
$newContent | Out-File -Encoding UTF8 "japanese-fluency-vocab.csv"