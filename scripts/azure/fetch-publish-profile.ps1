#Requires -Version 5.1
param(
	[string]$ResourceGroup = "rg-lab-langgraph",
	[string]$FunctionAppName = "rag-lab",
	[string]$OutFile = ""
)

$ErrorActionPreference = "Stop"
if (-not $OutFile) {
	$OutFile = Join-Path $env:TEMP "lab-langgraph-publish-profile.xml"
}

az webapp deployment list-publishing-profiles `
	--name $FunctionAppName `
	--resource-group $ResourceGroup `
	--xml | Out-File -FilePath $OutFile -Encoding utf8

Write-Host "Perfil guardado en: $OutFile"
Write-Host ""
Write-Host "GitHub → Dev-InSoft-web/lab-langgraph → Settings → Secrets → Actions:"
Write-Host "  AZURE_FUNCTIONAPP_NAME = $FunctionAppName"
Write-Host "  AZURE_FUNCTIONAPP_PUBLISH_PROFILE = (pegar contenido XML completo del archivo)"
