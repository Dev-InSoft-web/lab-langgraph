#Requires -Version 5.1
<#
.SYNOPSIS
  Crea RG + Storage + plan Consumption (Y1) + Function App Linux Node 20 para lab-langgraph.

.PREREQUISITOS
  - Azure CLI (`az`) con `az login` hecho en la suscripción correcta.
  - Permisos para crear Resource Group, Storage y Function App.

.USO
  .\scripts\azure\provision.ps1
  .\scripts\azure\provision.ps1 -FunctionAppName "func-insoft-lablanggraph" -Location "eastus2"
#>
param(
	[string]$ResourceGroup = "rg-insoft-lab-langgraph",
	[string]$Location = "eastus2",
	[string]$FunctionAppName = "func-insoft-lablanggraph",
	[string]$ParametersFile = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$Bicep = Join-Path $Root "infra\azure\main.bicep"

function Ensure-Az {
	$az = Get-Command az -ErrorAction SilentlyContinue
	if (-not $az) {
		throw "Azure CLI no está en PATH. Instale: winget install Microsoft.AzureCLI"
	}
	$acct = az account show 2>&1
	if ($LASTEXITCODE -ne 0) {
		throw "Ejecute primero: az login`nPortal: https://portal.azure.com/"
	}
	Write-Host "Suscripción:" (az account show --query name -o tsv)
}

function Test-FunctionAppName([string]$Name) {
	$avail = az functionapp list --query "[?name=='$Name']" -o json 2>$null
	if ($avail -and $avail -ne "[]") {
		Write-Warning "Ya existe una Function App llamada '$Name' en la suscripción."
	}
	# Comprobar nombre global (web app)
	$check = az webapp list --query "[?name=='$Name']" -o json
	if ($check -and $check -ne "[]") {
		throw "El nombre '$Name' ya está en uso. Pase otro -FunctionAppName."
	}
}

Ensure-Az
Test-FunctionAppName -Name $FunctionAppName

Write-Host "→ Resource group: $ResourceGroup ($Location)"
az group create --name $ResourceGroup --location $Location --output none

$deployArgs = @(
	"deployment", "group", "create",
	"--resource-group", $ResourceGroup,
	"--template-file", $Bicep,
	"--parameters", "functionAppName=$FunctionAppName", "location=$Location",
	"--output", "json"
)
if ($ParametersFile -and (Test-Path $ParametersFile)) {
	$deployArgs += @("--parameters", "@$ParametersFile")
}

Write-Host "→ Despliegue Bicep (plan Y1 / Consumption)…"
$outJson = az @deployArgs | ConvertFrom-Json
$outputs = $outJson.properties.outputs

$hostName = $outputs.functionAppDefaultHostName.value
$apiUrl = $outputs.apiHealthUrl.value
Write-Host ""
Write-Host "✓ Function App:" $outputs.functionAppName.value
	Write-Host "  URL:         https://$hostName"
	Write-Host "  Health:      $apiUrl"
	if ($outputs.signalRNegotiateUrl) {
		Write-Host "  SignalR:     $($outputs.signalRNegotiateUrl.value) (hub lab, SKU Free_F1)"
	}
Write-Host ""
Write-Host "Siguiente (secretos de aplicación en portal o CLI):"
Write-Host "  DATABASE_URL, RAG_DATABASE_URL, GROQ_API_KEY, HUGGINGFACE_API_KEY, …"
Write-Host "  Ver: docs/DEPLOY-AZURE.md y local.settings.json.example"
Write-Host ""
Write-Host "Perfil de publicación (GitHub secret AZURE_FUNCTIONAPP_PUBLISH_PROFILE):"
Write-Host "  .\scripts\azure\fetch-publish-profile.ps1 -ResourceGroup $ResourceGroup -FunctionAppName $FunctionAppName"
