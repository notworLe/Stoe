# Shared PowerShell helpers for Maison de Lua local runner scripts (Windows)

Set-StrictMode -Version Latest

$script:RunsDir = Split-Path -Parent $PSCommandPath
$script:RepoRoot = Split-Path -Parent $script:RunsDir
$script:BackendDir = Join-Path $script:RepoRoot "backend"
$script:FrontendDir = Join-Path $script:RepoRoot "frontend"
$script:LogsDir = Join-Path $script:RepoRoot "logs"

function Import-RepoEnv {
    param(
        [string]$EnvPath = (Join-Path $script:RepoRoot ".env")
    )

    if (-not (Test-Path $EnvPath)) {
        $examplePath = Join-Path $script:RepoRoot ".env.example"
        if (Test-Path $examplePath) {
            Copy-Item $examplePath $EnvPath
            Write-Host "[ENV] Created .env from .env.example. Review your PostgreSQL credentials in .env." -ForegroundColor Yellow
        } else {
            Write-Host "[ENV] No .env file found. Using default environment values." -ForegroundColor Yellow
            return
        }
    }

    foreach ($rawLine in Get-Content $EnvPath) {
        $line = $rawLine.Trim()
        if (-not $line -or $line.StartsWith("#")) {
            continue
        }
        $eqIndex = $line.IndexOf("=")
        if ($eqIndex -lt 1) {
            continue
        }
        $key = $line.Substring(0, $eqIndex).Trim()
        $val = $line.Substring($eqIndex + 1).Trim()

        if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
            $val = $val.Substring(1, $val.Length - 2)
        }

        [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
    }
}

function Get-ListeningPidsOnPort {
    param([int]$Port)

    $pids = @()
    try {
        $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
        $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    } catch {
        $lines = netstat -ano 2>$null | Select-String ":$Port\s+.*LISTENING\s+(\d+)$"
        foreach ($match in $lines) {
            if ($match.Line -match "LISTENING\s+(\d+)$") {
                $pids += [int]$Matches[1]
            }
        }
        $pids = $pids | Select-Object -Unique
    }
    return @($pids | Where-Object { $_ -and $_ -gt 0 })
}

function Stop-ProcessTree {
    param([int]$ProcessId)

    if ($ProcessId -le 0) { return }
    try {
        & taskkill /PID $ProcessId /T /F 2>$null | Out-Null
    } catch {
        Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
    }
}

function Stop-PortProcesses {
    param([int[]]$Ports)

    foreach ($port in $Ports) {
        $pids = @(Get-ListeningPidsOnPort -Port $port)
        foreach ($procId in $pids) {
            Write-Host "[STOP] Stopping PID $procId listening on port $port..." -ForegroundColor Yellow
            Stop-ProcessTree -ProcessId $procId
        }
    }
}

function Test-BackendVenv {
    $venvPython = Join-Path $script:BackendDir ".venv\Scripts\python.exe"
    if (-not (Test-Path $venvPython)) {
        Write-Host "[SETUP] backend\.venv not found. Running uv sync..." -ForegroundColor Cyan
        & uv sync --directory $script:BackendDir --dev
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to initialize backend virtual environment with uv."
        }
    }
    return $venvPython
}

function Test-FrontendModules {
    $nodeModules = Join-Path $script:FrontendDir "node_modules"
    if (-not (Test-Path $nodeModules)) {
        Write-Host "[SETUP] frontend\node_modules not found. Running npm ci..." -ForegroundColor Cyan
        & npm --prefix $script:FrontendDir ci
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install frontend npm dependencies."
        }
    }
}

function Test-PostgresReachable {
    param(
        [string]$VenvPython,
        [switch]$AutoCreateDb
    )

    $autoCreateFlag = if ($AutoCreateDb) { "1" } else { "0" }
    $checkScript = @"
import os, re, sys
import psycopg
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from app.config import get_settings

raw_url = get_settings().database_url
auto_create = os.environ.get('STOE_AUTO_CREATE_DB') == '1'

def try_connect(url_str: str) -> None:
    engine = create_engine(url_str, connect_args={'connect_timeout': 3} if url_str.startswith('postgresql') else {})
    try:
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
    finally:
        engine.dispose()

try:
    try_connect(raw_url)
    print('OK')
except Exception as exc:
    msg = str(exc)
    if auto_create and raw_url.startswith('postgresql') and 'does not exist' in msg:
        parsed = make_url(raw_url)
        db_name = parsed.database or 'stoe'
        if not re.fullmatch(r'[A-Za-z0-9_]+', db_name):
            print(f'ERR: Unsafe database name: {db_name}')
            sys.exit(1)
        admin_url = parsed.set(database='postgres').render_as_string(hide_password=False)
        admin_url = admin_url.replace('postgresql+psycopg://', 'postgresql://', 1)
        try:
            with psycopg.connect(admin_url, autocommit=True, connect_timeout=3) as conn:
                with conn.cursor() as cur:
                    cur.execute(f'CREATE DATABASE "{db_name}"')
            try_connect(raw_url)
            print(f'CREATED:{db_name}')
            sys.exit(0)
        except Exception as create_exc:
            print(f'ERR: Could not create database "{db_name}": {create_exc}')
            sys.exit(1)
    print(f'ERR: {msg}')
    sys.exit(1)
"@

    Push-Location $script:BackendDir
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $env:STOE_AUTO_CREATE_DB = $autoCreateFlag
    try {
        $output = & $VenvPython -c $checkScript 2>&1
        $exitCode = $LASTEXITCODE
        $joined = ($output | ForEach-Object { $_.ToString() }) -join " "
        if ($exitCode -eq 0) {
            if ($joined -match "CREATED:(\S+)") {
                Write-Host "[DB] Created missing PostgreSQL database '$($Matches[1])' and verified connection." -ForegroundColor Green
            } else {
                Write-Host "[DB] PostgreSQL connection verified." -ForegroundColor Green
            }
            return $true
        }
        Write-Host "[DB] Could not connect to PostgreSQL:" -ForegroundColor Red
        Write-Host "     $joined" -ForegroundColor DarkYellow
        Write-Host "     Verify your local PostgreSQL service is running and DATABASE_URL in .env is correct." -ForegroundColor Yellow
        return $false
    } finally {
        Remove-Item Env:STOE_AUTO_CREATE_DB -ErrorAction SilentlyContinue
        $ErrorActionPreference = $prevEap
        Pop-Location
    }
}
