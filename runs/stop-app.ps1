<#
.SYNOPSIS
    Stop any running Maison de Lua local servers on ports 8000 (Backend) and 3000 (Frontend).
.EXAMPLE
    .\runs\stop-app.ps1
#>

param(
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 3000
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "_common.ps1")

Write-Host "=== Maison de Lua - Stopping Local Services ===" -ForegroundColor Yellow
Stop-PortProcesses -Ports @($BackendPort, $FrontendPort)
Write-Host "Done. Ports $BackendPort and $FrontendPort are clear." -ForegroundColor Green
