<#
.SYNOPSIS
    Run full Backend (ruff + pytest) and Frontend (eslint + tsc + next build) checks in PowerShell.
.EXAMPLE
    .\runs\test.ps1
#>

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "_common.ps1")

Write-Host "=== 1/5 Backend Lint (ruff) ===" -ForegroundColor Cyan
& (Join-Path $script:BackendDir ".venv\Scripts\ruff.exe") check $script:BackendDir
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== 2/5 Backend Tests (pytest) ===" -ForegroundColor Cyan
& (Join-Path $script:BackendDir ".venv\Scripts\pytest.exe") (Join-Path $script:BackendDir "test") -v
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location $script:FrontendDir
try {
    Write-Host "`n=== 3/5 Frontend Lint (eslint) ===" -ForegroundColor Cyan
    & npm run lint
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "`n=== 4/5 Frontend Typecheck (tsc --noEmit) ===" -ForegroundColor Cyan
    & npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "`n=== 5/5 Frontend Build (next build --webpack) ===" -ForegroundColor Cyan
    & npx next build --webpack
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host "`nAll Backend and Frontend checks passed!" -ForegroundColor Green
