$tmp = Join-Path $env:TEMP "fn-min"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null
Copy-Item (Join-Path $PSScriptRoot "..\..\host.json") $tmp
Set-Content (Join-Path $tmp "function.json") '{"bindings":[{"authLevel":"anonymous","type":"httpTrigger","direction":"in","name":"req","methods":["get"]},{"type":"http","direction":"out","name":"res"}]}'
Set-Content (Join-Path $tmp "index.js") 'module.exports = async function (context, req) { context.res = { body: "ok" }; };'
$zip = Join-Path $env:TEMP "fn-min.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $tmp "*") -DestinationPath $zip
Write-Output $zip
