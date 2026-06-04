#Requires -Version 5.1
<#
  Despliega a Function App Flex Consumption vía Kudu /api/publish (no zipdeploy).
  RemoteBuild=false: el paquete ya viene compilado desde GitHub Actions.

  .\scripts\azure\publish-flex-package.ps1 -ZipPath C:\temp\deploy.zip -PublishProfilePath C:\temp\profile.xml
#>
param(
	[Parameter(Mandatory = $true)]
	[string]$ZipPath,
	[Parameter(Mandatory = $true)]
	[string]$PublishProfilePath,
	[int]$MaxAttempts = 12
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path $ZipPath)) { throw "Zip no encontrado: $ZipPath" }
if (-not (Test-Path $PublishProfilePath)) { throw "Publish profile no encontrado: $PublishProfilePath" }

[xml]$doc = Get-Content -Raw -Encoding UTF8 $PublishProfilePath
$prof = $doc.publishData.publishProfile | Where-Object { $_.publishMethod -eq "ZipDeploy" } | Select-Object -First 1
if (-not $prof) { throw "ZipDeploy profile not found in publish XML" }

$scmHost = ($prof.publishUrl -split ":")[0]
$user = $prof.userName
$pwd = $prof.userPWD
$pair = "${user}:${pwd}"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$basic = [Convert]::ToBase64String($bytes)

$uri = "https://$scmHost/api/publish?isAsync=true&RemoteBuild=false"
Write-Host "Publishing to $uri"

for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
	Write-Host "Attempt $attempt/$MaxAttempts"
	try {
		$resp = Invoke-WebRequest -Uri $uri -Method POST -InFile $ZipPath `
			-Headers @{ Authorization = "Basic $basic" } `
			-ContentType "application/zip" -TimeoutSec 900 -UseBasicParsing
		Write-Host "Status:" $resp.StatusCode
		if ($resp.StatusCode -in 200, 202) {
			Write-Host "Publish accepted. Deployment id:" $resp.Content
			return
		}
	} catch {
		$status = $null
		if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
		Write-Host "Error HTTP $status — $($_.Exception.Message)"
		if ($status -notin 502, 503, 504, $null) { throw }
	}
	Start-Sleep -Seconds ([Math]::Min(30, 5 * $attempt))
}

throw "Flex publish failed after $MaxAttempts attempts (SCM 502/503). Reintente el workflow o use func-lab-langgraph (plan clásico)."
