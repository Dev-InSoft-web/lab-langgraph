#Requires -Version 5.1
<#
  Crea RG + Storage + Function App (Consumption Linux Node 20) + SignalR Free_F1
  sin depender del portal. Requiere: az login

  .\scripts\azure\provision-az-cli.ps1
#>
param(
	[string]$ResourceGroup = "rg-insoft-lab-langgraph",
	[string]$Location = "eastus2",
	[string]$FunctionAppName = "func-insoft-lablanggraph",
	[string]$SignalRName = "sigr-insoft-lablanggraph"
)

$ErrorActionPreference = "Stop"
$Suffix = -join ((48..57) + (97..122) | Get-Random -Count 6 | ForEach-Object { [char]$_ })
$StorageName = "stlab$Suffix"
$PlanName = "plan-$FunctionAppName"

function Ensure-AzLogin {
	$null = az account show 2>$null
	if ($LASTEXITCODE -ne 0) {
		Write-Host "Ejecute: az login --use-device-code"
		throw "Azure CLI sin sesión"
	}
	Write-Host "Suscripción:" (az account show --query name -o tsv)
}

Ensure-AzLogin

Write-Host "→ Grupo de recursos $ResourceGroup ($Location)"
az group create --name $ResourceGroup --location $Location --output none

Write-Host "→ Storage $StorageName"
az storage account create `
	--name $StorageName `
	--resource-group $ResourceGroup `
	--location $Location `
	--sku Standard_LRS `
	--kind StorageV2 `
	--output none

Write-Host "→ Plan Consumption (Y1)"
az functionapp plan create `
	--name $PlanName `
	--resource-group $ResourceGroup `
	--location $Location `
	--sku Y1 `
	--is-linux `
	--output none

Write-Host "→ Function App $FunctionAppName (Node 20)"
az functionapp create `
	--name $FunctionAppName `
	--resource-group $ResourceGroup `
	--storage-account $StorageName `
	--plan $PlanName `
	--runtime node `
	--runtime-version 20 `
	--functions-version 4 `
	--os-type Linux `
	--output none

Write-Host "→ SignalR $SignalRName (Free_F1, Serverless)"
az signalr create `
	--name $SignalRName `
	--resource-group $ResourceGroup `
	--location $Location `
	--sku Free_F1 `
	--unit-count 1 `
	--service-mode Serverless `
	--output none

$conn = az signalr key list --name $SignalRName --resource-group $ResourceGroup --query primaryConnectionString -o tsv

az functionapp config appsettings set `
	--name $FunctionAppName `
	--resource-group $ResourceGroup `
	--settings `
	"AzureSignalRConnectionString=$conn" `
	"SIGNALR_HUB_NAME=lab" `
	"WEBSITE_RUN_FROM_PACKAGE=1" `
	"SCM_DO_BUILD_DURING_DEPLOYMENT=false" `
	--output none

az functionapp cors add `
	--name $FunctionAppName `
	--resource-group $ResourceGroup `
	--allowed-origins "*" `
	--output none 2>$null

Write-Host ""
Write-Host "[OK] Listo"
Write-Host "  Function App: https://$FunctionAppName.azurewebsites.net"
Write-Host "  Health:       https://$FunctionAppName.azurewebsites.net/api/health"
Write-Host "  SignalR:      $SignalRName"
Write-Host "  Negotiate:    https://$FunctionAppName.azurewebsites.net/api/signalr/negotiate"
Write-Host ""
Write-Host 'Siguiente: configurar DATABASE_URL, GROQ_API_KEY, etc. en Configuration de la Function App.'
