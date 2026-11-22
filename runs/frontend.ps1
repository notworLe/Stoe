<#
.SYNOPSIS
    Run Maison de Lua Next.js frontend locally in PowerShell.
.EXAMPLE
    .\runs\frontend.ps1
    .\runs\frontend.ps1 -Port 3000
    .\runs\frontend.ps1 -Turbopack
#>

param(
    [int]$Port = 3000,
    [switch]$Turbopack
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "_common.ps1")

Import-RepoEnv
Test-FrontendModules

if (-not $env:NEXT_PUBLIC_API_URL) {
    $env:NEXT_PUBLIC_API_URL = "http://localhost:8000"
}
if (-not $env:INTERNAL_API_URL) {
    $env:INTERNAL_API_URL = $env:NEXT_PUBLIC_API_URL
}

Write-Host "=== Maison de Lua - Frontend Storefront & Admin (Next.js) ===" -ForegroundColor Cyan
Write-Host "Storefront: http://localhost:$Port" -ForegroundColor Green
Write-Host "Admin     : http://localhost:$Port/admin" -ForegroundColor Green
Write-Host "API Base  : $($env:NEXT_PUBLIC_API_URL)" -ForegroundColor DarkGray

Push-Location $script:FrontendDir
try {
    $nextArgs = @("next", "dev", "-p", "$Port")
    if (-not $Turbopack) {
        # Default to --webpack on Windows to avoid @tailwindcss/turbopack IPC crash
        $nextArgs += "--webpack"
    }
    & npx @nextArgs
} finally {
    Pop-Location
}
