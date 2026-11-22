<#
.SYNOPSIS
    Install and verify local dependencies for Maison de Lua without Docker (Windows PowerShell).
.EXAMPLE
    .\runs\setup.ps1
    .\runs\setup.ps1 -ForceNpm
#>

param(
    [switch]$ForceNpm
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "_common.ps1")

Write-Host "=== Maison de Lua - Local Setup (No Docker) ===" -ForegroundColor Cyan

Import-RepoEnv

# 1. Backend Python environment
Write-Host "`n[1/3] Syncing backend Python dependencies (uv)..." -ForegroundColor Cyan
& uv sync --directory $script:BackendDir --dev
if ($LASTEXITCODE -ne 0) {
    throw "Backend dependency sync failed."
}

# 2. Frontend Node dependencies
Write-Host "`n[2/3] Checking frontend npm dependencies..." -ForegroundColor Cyan
$nodeModules = Join-Path $script:FrontendDir "node_modules"
if ($ForceNpm -or -not (Test-Path $nodeModules)) {
    & npm --prefix $script:FrontendDir ci
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend npm ci failed."
    }
} else {
    Write-Host "      frontend\node_modules already installed (pass -ForceNpm to reinstall)." -ForegroundColor Green
}

# 3. Verify PostgreSQL connection from .env (auto-create DB if missing)
Write-Host "`n[3/3] Checking PostgreSQL connection (auto-creates database if missing)..." -ForegroundColor Cyan
$venvPython = Join-Path $script:BackendDir ".venv\Scripts\python.exe"
$dbOk = Test-PostgresReachable -VenvPython $venvPython -AutoCreateDb
if (-not $dbOk) {
    exit 1
}

Write-Host "`nSetup complete. Start the app with:" -ForegroundColor Green
Write-Host "  .\runs\start-app.ps1" -ForegroundColor White
