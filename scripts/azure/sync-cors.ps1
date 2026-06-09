#Requires -Version 5.1
<#
  CORS de plataforma Azure Functions (preflight OPTIONS lo resuelve Azure, no el código de la función).

  Por defecto deja solo "*" (todos los orígenes). Para lista explícita:
    .\scripts\azure\sync-cors.ps1 -ExplicitOrigins

  .\scripts\azure\sync-cors.ps1
#>
param(
	[string]$ResourceGroup = "rg-lab-langgraph",
	[string]$FunctionAppName = "rag-lab",
	[switch]$ExplicitOrigins,
	[string[]]$Origins = @(
		"https://portal.azure.com",
		"http://localhost:5199",
		"http://127.0.0.1:5199",
		"http://localhost:5501",
		"http://127.0.0.1:5501"
	)
)

$ErrorActionPreference = "Stop"
$az = if (Get-Command az -ErrorAction SilentlyContinue) { "az" } else { "$env:ProgramFiles\Microsoft SDKs\Azure\CLI2\wbin\az.cmd" }
if (-not (Test-Path $az)) { throw "Azure CLI no encontrado" }

function Get-CorsOrigins {
	param([string]$App, [string]$Group)
	& $az functionapp cors show -n $App -g $Group --query "allowedOrigins" -o json | ConvertFrom-Json
}

function Remove-AllCorsOrigins {
	param([string]$App, [string]$Group)
	foreach ($origin in (Get-CorsOrigins -App $App -Group $Group)) {
		& $az functionapp cors remove -n $App -g $Group --allowed-origins $origin | Out-Null
		Write-Host "  - $origin"
	}
}

if (-not $ExplicitOrigins) {
	Write-Host "CORS → * (todos los orígenes)"
	Remove-AllCorsOrigins -App $FunctionAppName -Group $ResourceGroup
	$now = Get-CorsOrigins -App $FunctionAppName -Group $ResourceGroup
	if ($now -notcontains "*") {
		& $az functionapp cors add -n $FunctionAppName -g $ResourceGroup --allowed-origins "*" | Out-Null
		Write-Host "  + *"
	}
} else {
	Write-Host "CORS → orígenes explícitos (sin *)"
	Remove-AllCorsOrigins -App $FunctionAppName -Group $ResourceGroup
	foreach ($origin in $Origins) {
		$now = Get-CorsOrigins -App $FunctionAppName -Group $ResourceGroup
		if ($now -contains $origin) {
			Write-Host "  OK: $origin"
		} else {
			& $az functionapp cors add -n $FunctionAppName -g $ResourceGroup --allowed-origins $origin | Out-Null
			Write-Host "  + $origin"
		}
	}
}

& $az functionapp cors credentials -n $FunctionAppName -g $ResourceGroup --enable false | Out-Null

Write-Host "`nReiniciando $FunctionAppName…"
& $az functionapp restart -n $FunctionAppName -g $ResourceGroup | Out-Null
& $az functionapp cors show -n $FunctionAppName -g $ResourceGroup -o json
