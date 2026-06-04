#Requires -Version 5.1
param(
	[string]$ResourceGroup = "rg-lab-langgraph",
	[string]$FunctionAppName = "rag-lab",
	[string]$ZipPath = ""
)

$ErrorActionPreference = "Stop"
if (-not $ZipPath) {
	$ZipPath = Join-Path $env:TEMP "fn-min.zip"
}

$xml = az webapp deployment list-publishing-profiles `
	--name $FunctionAppName `
	--resource-group $ResourceGroup `
	--xml

[xml]$doc = $xml
$zipProfile = $doc.publishData.publishProfile | Where-Object { $_.publishMethod -eq "ZipDeploy" } | Select-Object -First 1
if (-not $zipProfile) { throw "ZipDeploy profile not found" }

$hostName = ($zipProfile.publishUrl -split ":")[0]
$user = $zipProfile.userName
$pass = $zipProfile.userPWD
$uri = "https://$hostName/api/zipdeploy?isAsync=true"

$pair = "${user}:${pass}"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$basic = [Convert]::ToBase64String($bytes)

Write-Host "Deploying $ZipPath to $uri ..."
$resp = Invoke-WebRequest -Uri $uri -Method POST -InFile $ZipPath `
	-Headers @{ Authorization = "Basic $basic" } `
	-ContentType "application/zip" -TimeoutSec 600 -UseBasicParsing
Write-Host "Status:" $resp.StatusCode
