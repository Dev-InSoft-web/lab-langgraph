#Requires -Version 5.1
<#
  Actualiza secretos de GitHub Actions para el deploy a Azure Functions.
  Requiere: az login, gh auth login

  .\scripts\github\set-azure-deploy-secrets.ps1
#>
param(
	[string]$Repo = "Dev-InSoft-web/lab-langgraph",
	[string]$ResourceGroup = "rg-insoft-lab-langgraph",
	[string]$FunctionAppName = "func-insoft-lablanggraph"
)

$ErrorActionPreference = "Stop"
$profilePath = Join-Path $env:TEMP "lab-langgraph-publish-profile.xml"

$xml = az webapp deployment list-publishing-profiles `
	--name $FunctionAppName `
	--resource-group $ResourceGroup `
	--xml
if (-not $xml -or $xml -notmatch "ZipDeploy") {
	throw "No se obtuvo publish profile XML"
}
[System.IO.File]::WriteAllText($profilePath, $xml, [System.Text.UTF8Encoding]::new($false))

gh secret set AZURE_FUNCTIONAPP_NAME --body $FunctionAppName -R $Repo
Get-Content -Raw -Encoding UTF8 $profilePath | gh secret set AZURE_FUNCTIONAPP_PUBLISH_PROFILE -R $Repo

Write-Host ('Secretos actualizados en https://github.com/{0}' -f $Repo)
Write-Host ('Perfil local: {0} ({1} bytes)' -f $profilePath, (Get-Item $profilePath).Length)
