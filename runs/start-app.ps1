<#
.SYNOPSIS
    Start Maison de Lua Backend (FastAPI) and Frontend (Next.js) locally in Windows PowerShell (no Docker).
.DESCRIPTION
    Loads root .env, checks PostgreSQL connectivity, and starts both services.
    - Default mode launches both in the current console, writes logs to logs\backend.log and logs\frontend.log,
      and cleans up both process trees cleanly when you press Ctrl+C.
    - Pass -NewWindows to open dedicated PowerShell windows for Backend and Frontend.
    - Pass -Restart to stop any processes currently listening on ports 8000 / 3000 before starting.
.EXAMPLE
    .\runs\start-app.ps1
    .\runs\start-app.ps1 -NewWindows
    .\runs\start-app.ps1 -Restart
#>

param(
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 3000,
    [switch]$NewWindows,
    [switch]$Restart,
    [switch]$Turbopack
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "_common.ps1")

Import-RepoEnv

if ($Restart) {
    Stop-PortProcesses -Ports @($BackendPort, $FrontendPort)
}

# Check for port conflicts before launching
$busyBackend = @(Get-ListeningPidsOnPort -Port $BackendPort)
$busyFrontend = @(Get-ListeningPidsOnPort -Port $FrontendPort)
if ($busyBackend.Count -gt 0 -or $busyFrontend.Count -gt 0) {
    if ($busyBackend.Count -gt 0) {
        Write-Host "[ERROR] Port $BackendPort is already in use by PID(s): $($busyBackend -join ', ')" -ForegroundColor Red
    }
    if ($busyFrontend.Count -gt 0) {
        Write-Host "[ERROR] Port $FrontendPort is already in use by PID(s): $($busyFrontend -join ', ')" -ForegroundColor Red
    }
    Write-Host "Run '.\runs\stop-app.ps1' or pass '-Restart' to free those ports." -ForegroundColor Yellow
    exit 1
}

$venvPython = Test-BackendVenv
Test-FrontendModules

if (-not (Test-Path $script:LogsDir)) {
    New-Item -ItemType Directory -Path $script:LogsDir | Out-Null
}

$env:NEXT_PUBLIC_API_URL = "http://localhost:$BackendPort"
$env:INTERNAL_API_URL = "http://localhost:$BackendPort"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  MAISON DE LUA - Local Fullstack Runner (PowerShell)     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
$dbOk = Test-PostgresReachable -VenvPython $venvPython -AutoCreateDb
if (-not $dbOk) {
    Write-Host "[WARN] Proceeding anyway; backend will retry PostgreSQL on startup." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Storefront : http://localhost:$FrontendPort" -ForegroundColor Green
Write-Host "  Admin UI   : http://localhost:$FrontendPort/admin" -ForegroundColor Green
Write-Host "  API Docs   : http://localhost:$BackendPort/docs" -ForegroundColor Green
Write-Host "  Admin Login: admin@maisondelua.com.au / admin123" -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Option 1: Open two separate PowerShell windows
if ($NewWindows) {
    $backendScript = Join-Path $script:RunsDir "backend.ps1"
    $frontendScript = Join-Path $script:RunsDir "frontend.ps1"
    $turboFlag = if ($Turbopack) { "-Turbopack" } else { "" }

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", "`$Host.UI.RawUI.WindowTitle = 'Maison de Lua - Backend ($BackendPort)'; & '$backendScript' -Port $BackendPort"
    )

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", "`$Host.UI.RawUI.WindowTitle = 'Maison de Lua - Frontend ($FrontendPort)'; & '$frontendScript' -Port $FrontendPort $turboFlag"
    )

    Write-Host "Launched Backend and Frontend in separate PowerShell windows." -ForegroundColor Green
    Write-Host "To stop all services later, run: .\runs\stop-app.ps1" -ForegroundColor Yellow
    exit 0
}

# Option 2 (Default): Run both managed inside this window and clean up on Ctrl+C
$backendLog = Join-Path $script:LogsDir "backend.log"
$backendErrLog = Join-Path $script:LogsDir "backend.err.log"
$frontendLog = Join-Path $script:LogsDir "frontend.log"
$frontendErrLog = Join-Path $script:LogsDir "frontend.err.log"

$uvicornExe = Join-Path $script:BackendDir ".venv\Scripts\uvicorn.exe"
$nodeExe = (Get-Command node -ErrorAction Stop).Source
$nextEntry = Join-Path $script:FrontendDir "node_modules\next\dist\bin\next"
$nextModeFlag = if ($Turbopack) { "" } else { "--webpack" }

$backendProc = $null
$frontendProc = $null

try {
    "" | Set-Content $backendLog
    "" | Set-Content $backendErrLog
    "" | Set-Content $frontendLog
    "" | Set-Content $frontendErrLog

    Write-Host "[BACKEND]  Starting FastAPI on port $BackendPort..." -ForegroundColor Magenta
    $backendProc = Start-Process -FilePath $uvicornExe `
        -ArgumentList @("main:app", "--host", "0.0.0.0", "--port", "$BackendPort", "--reload") `
        -WorkingDirectory $script:BackendDir `
        -NoNewWindow `
        -RedirectStandardOutput $backendLog `
        -RedirectStandardError $backendErrLog `
        -PassThru

    Write-Host "[FRONTEND] Starting Next.js on port $FrontendPort..." -ForegroundColor Blue
    $frontendArgs = @($nextEntry, "dev", "-p", "$FrontendPort")
    if ($nextModeFlag) {
        $frontendArgs += $nextModeFlag
    }
    $frontendProc = Start-Process -FilePath $nodeExe `
        -ArgumentList $frontendArgs `
        -WorkingDirectory $script:FrontendDir `
        -NoNewWindow `
        -RedirectStandardOutput $frontendLog `
        -RedirectStandardError $frontendErrLog `
        -PassThru

    Write-Host ""
    Write-Host "Logs streaming below (also saved to logs\backend.log & logs\frontend.log)." -ForegroundColor DarkGray
    Write-Host "Press Ctrl+C to stop BOTH Backend and Frontend cleanly." -ForegroundColor Yellow
    Write-Host ""

    $offsets = @{
        $backendLog    = 0
        $backendErrLog = 0
        $frontendLog   = 0
        $frontendErrLog = 0
    }

    function Flush-LogFile {
        param([string]$Path, [string]$Tag, [ConsoleColor]$Color)
        if (-not (Test-Path $Path)) { return }
        $lines = @(Get-Content $Path -ErrorAction SilentlyContinue)
        $seen = $offsets[$Path]
        if ($lines.Count -gt $seen) {
            for ($i = $seen; $i -lt $lines.Count; $i++) {
                if ($lines[$i].Trim() -ne "") {
                    Write-Host "$Tag $($lines[$i])" -ForegroundColor $Color
                }
            }
            $offsets[$Path] = $lines.Count
        }
    }

    while (-not $backendProc.HasExited -and -not $frontendProc.HasExited) {
        Flush-LogFile -Path $backendLog -Tag "[BACKEND] " -Color Magenta
        Flush-LogFile -Path $backendErrLog -Tag "[BACKEND] " -Color DarkMagenta
        Flush-LogFile -Path $frontendLog -Tag "[FRONTEND]" -Color Cyan
        Flush-LogFile -Path $frontendErrLog -Tag "[FRONTEND]" -Color Yellow
        Start-Sleep -Milliseconds 350
    }

    Flush-LogFile -Path $backendLog -Tag "[BACKEND] " -Color Magenta
    Flush-LogFile -Path $backendErrLog -Tag "[BACKEND] " -Color DarkMagenta
    Flush-LogFile -Path $frontendLog -Tag "[FRONTEND]" -Color Cyan
    Flush-LogFile -Path $frontendErrLog -Tag "[FRONTEND]" -Color Yellow

    if ($backendProc.HasExited) {
        Write-Host "[BACKEND] Exited with code $($backendProc.ExitCode)." -ForegroundColor Red
    }
    if ($frontendProc.HasExited) {
        Write-Host "[FRONTEND] Exited with code $($frontendProc.ExitCode)." -ForegroundColor Red
    }
} finally {
    Write-Host "`n[SHUTDOWN] Stopping Backend and Frontend process trees..." -ForegroundColor Yellow
    if ($backendProc -and -not $backendProc.HasExited) {
        Stop-ProcessTree -ProcessId $backendProc.Id
    }
    if ($frontendProc -and -not $frontendProc.HasExited) {
        Stop-ProcessTree -ProcessId $frontendProc.Id
    }
    Stop-PortProcesses -Ports @($BackendPort, $FrontendPort)
    Write-Host "[SHUTDOWN] Ports $BackendPort and $FrontendPort released." -ForegroundColor Green
}
