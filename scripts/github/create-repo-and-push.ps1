#Requires -Version 5.1
<#
  Inicializa git (si hace falta), crea el repo en Dev-InSoft-web y hace push a main.

  Requisitos:
    gh auth login
    git configurado (user.name / user.email)
#>
param(
	[string]$Org = "Dev-InSoft-web",
	[string]$RepoName = "lab-langgraph",
	[switch]$Private
)

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $Root

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
	throw "Instale GitHub CLI: winget install GitHub.cli"
}
gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
	throw "Ejecute: gh auth login"
}

if (-not (Test-Path ".git")) {
	git init -b main
	git add .
	git commit -m "Initial commit: lab-langgraph Azure Functions + CI deploy"
}

$visibility = if ($Private) { "--private" } else { "--public" }
gh repo view "$Org/$RepoName" 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
	gh repo create "$Org/$RepoName" $visibility --source=. --remote=origin --description "FitDocs RAG - Azure Functions + LangChain.js + PGVector (lab InSoft)"
	Write-Host ('Repo creado: https://github.com/{0}/{1}' -f $Org, $RepoName)
} else {
	Write-Host 'Repo ya existe; enlazando remote origin...'
	git remote remove origin 2>$null
	git remote add origin "https://github.com/$Org/$RepoName.git"
}

git push -u origin main
Write-Host ''
Write-Host 'Configure secretos Actions (ver docs/DEPLOY-AZURE.md) y vuelva a push para desplegar.'
