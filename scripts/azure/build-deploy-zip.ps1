#Requires -Version 5.1
<#
  Empaqueta solo lo necesario para Azure Functions Node (post npm run build).
  Salida: ruta del .zip creado (stdout última línea).
#>
param(
	[string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
	[string]$OutZip = ""
)

$ErrorActionPreference = "Stop"
if (-not $OutZip) {
	$OutZip = Join-Path $env:RUNNER_TEMP "lab-langgraph-deploy.zip"
	if (-not $env:RUNNER_TEMP) { $OutZip = Join-Path $env:TEMP "lab-langgraph-deploy.zip" }
}

$stage = Join-Path ([System.IO.Path]::GetDirectoryName($OutZip)) "fn-stage"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

foreach ($item in @("host.json", "package.json", "package-lock.json")) {
	Copy-Item (Join-Path $ProjectRoot $item) $stage
}
Copy-Item (Join-Path $ProjectRoot "dist") (Join-Path $stage "dist") -Recurse
Copy-Item (Join-Path $ProjectRoot "node_modules") (Join-Path $stage "node_modules") -Recurse

if (Test-Path $OutZip) { Remove-Item $OutZip -Force }
# tar (no Compress-Archive): rutas con / para que Linux en Azure cargue dist/src/index.js
Push-Location $stage
& tar.exe -a -cf $OutZip *
Pop-Location
Remove-Item $stage -Recurse -Force

$mb = [Math]::Round((Get-Item $OutZip).Length / 1MB, 1)
Write-Host "Created $OutZip ($mb MB)"
Write-Output $OutZip
