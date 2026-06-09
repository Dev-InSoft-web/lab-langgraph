#Requires -Version 5.1
<#
  Inyecta AzureSignalRConnectionString y SIGNALR_HUB_NAME en la Function App.
  .\scripts\azure\sync-signalr-settings.ps1
#>
param(
	[string]$ResourceGroup = "rg-lab-langgraph",
	[string]$FunctionAppName = "rag-lab",
	[string]$SignalRName = "sigr-lab-langgraph",
	[string]$HubName = "lab"
)

$ErrorActionPreference = "Stop"
$az = if (Get-Command az -ErrorAction SilentlyContinue) { "az" } else { "$env:ProgramFiles\Microsoft SDKs\Azure\CLI2\wbin\az.cmd" }
if (-not (Test-Path $az)) { throw "Azure CLI no encontrado" }

$conn = & $az signalr key list -n $SignalRName -g $ResourceGroup --query "primaryConnectionString" -o tsv
if (-not $conn) { throw "No se obtuvo connection string de $SignalRName" }

& $az functionapp config appsettings set `
	-n $FunctionAppName `
	-g $ResourceGroup `
	--settings "AzureSignalRConnectionString=$conn" "SIGNALR_HUB_NAME=$HubName" | Out-Null

Write-Host "SignalR settings OK ($SignalRName → $FunctionAppName)"
& $az functionapp restart -n $FunctionAppName -g $ResourceGroup | Out-Null
Write-Host "Reiniciado $FunctionAppName"
