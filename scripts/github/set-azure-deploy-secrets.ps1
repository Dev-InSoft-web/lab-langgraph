#Requires -Version 5.1
<#
  Actualiza secretos de GitHub Actions para el deploy a Azure Functions.
  Requiere: az login, gh auth login

  .\scripts\github\set-azure-deploy-secrets.ps1
#>
param(
	[string]$Repo = "Dev-InSoft-web/lab-langgraph",
	[string]$ResourceGroup = "rg-lab-langgraph",
	[string]$FunctionAppName = "rag-lab"
)

$ErrorActionPreference = "Stop"
$profilePath = Join-Path $env:TEMP "lab-langgraph-publish-profile.xml"

$az = if (Get-Command az -ErrorAction SilentlyContinue) { "az" } else { "$env:ProgramFiles\Microsoft SDKs\Azure\CLI2\wbin\az.cmd" }
if (-not (Test-Path $az)) { throw "Azure CLI no encontrado. Instale: winget install Microsoft.AzureCLI" }

$xml = & $az webapp deployment list-publishing-profiles `
	--name $FunctionAppName `
	--resource-group $ResourceGroup `
	--xml
if (-not $xml -or $xml -notmatch "ZipDeploy") {
	throw "No se obtuvo publish profile XML"
}
[System.IO.File]::WriteAllText($profilePath, $xml, [System.Text.UTF8Encoding]::new($false))

$hostname = & $az functionapp show --name $FunctionAppName --resource-group $ResourceGroup --query "properties.defaultHostName" -o tsv
if (-not $hostname) { throw "No se obtuvo defaultHostName de $FunctionAppName" }

$gh = if (Get-Command gh -ErrorAction SilentlyContinue) { "gh" } else { "$env:ProgramFiles\GitHub CLI\gh.exe" }

& $gh secret set AZURE_FUNCTIONAPP_NAME --body $FunctionAppName -R $Repo
& $gh secret set AZURE_FUNCTIONAPP_HOSTNAME --body $hostname -R $Repo
Get-Content -Raw -Encoding UTF8 $profilePath | & $gh secret set AZURE_FUNCTIONAPP_PUBLISH_PROFILE -R $Repo

Write-Host ('Secretos actualizados en https://github.com/{0}' -f $Repo)
Write-Host ('  AZURE_FUNCTIONAPP_NAME = {0}' -f $FunctionAppName)
Write-Host ('  AZURE_FUNCTIONAPP_HOSTNAME = {0}' -f $hostname)
Write-Host ('Perfil local: {0} ({1} bytes)' -f $profilePath, (Get-Item $profilePath).Length)
