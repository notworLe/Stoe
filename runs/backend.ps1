<#
.SYNOPSIS
    Run Maison de Lua FastAPI backend locally in PowerShell (connects to PostgreSQL from .env).
.EXAMPLE
    .\runs\backend.ps1
    .\runs\backend.ps1 -Port 8000
#>

param(
    [int]$Port = 8000,
    [switch]$NoReload
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "_common.ps1")

Import-RepoEnv
$venvPython = Test-BackendVenv

$uvicornExe = Join-Path $script:BackendDir ".venv\Scripts\uvicorn.exe"
$env:PYTHONUNBUFFERED = "1"

Write-Host "=== Maison de Lua - Backend API (FastAPI + PostgreSQL) ===" -ForegroundColor Cyan
Write-Host "API URL : http://localhost:$Port" -ForegroundColor Green
Write-Host "Docs URL: http://localhost:$Port/docs" -ForegroundColor Green

$null = Test-PostgresReachable -VenvPython $venvPython -AutoCreateDb

Push-Location $script:BackendDir
try {
    $argsList = @("main:app", "--host", "0.0.0.0", "--port", "$Port")
    if (-not $NoReload) {
        $argsList += "--reload"
    }
    & $uvicornExe @argsList
} finally {
    Pop-Location
}
