# Autogen Design - Development Server Launcher
# This script starts the Next.js development server with auto-elevation to admin if needed

param(
    [switch]$NoElevate
)

function Set-FluxEnvironmentFromEnv {
    param(
        [string]$EnvFile
    )

    $fluxKeys = @(
        "AZURE_FLUX_11_PRO_ENDPOINT",
        "AZURE_FLUX_11_PRO_API_KEY",
        "AZURE_FLUX_KONTEXT_PRO_ENDPOINT",
        "AZURE_FLUX_KONTEXT_PRO_API_KEY"
    )

    if (-not (Test-Path $EnvFile)) {
        Write-Host "Flux configuration skipped: .env file not found." -ForegroundColor Yellow
        return
    }

    try {
        $lines = Get-Content -Path $EnvFile -ErrorAction Stop
    }
    catch {
        Write-Host "Unable to read ${EnvFile}: $($_.Exception.Message)" -ForegroundColor Red
        return
    }

    foreach ($key in $fluxKeys) {
        $line = $lines | Where-Object { $_ -match "^\s*${key}\s*=" } | Select-Object -First 1
        if (-not $line) {
            Write-Host "$key is not set in $EnvFile" -ForegroundColor Yellow
            continue
        }

        $parts = $line -split '=', 2
        if ($parts.Count -lt 2) {
            Write-Host "$key line is malformed in $EnvFile" -ForegroundColor Yellow
            continue
        }

        $value = $parts[1].Trim()
        if ($value.StartsWith('"') -and $value.EndsWith('"') -and $value.Length -ge 2) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        elseif ($value.StartsWith("'") -and $value.EndsWith("'") -and $value.Length -ge 2) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        if ([string]::IsNullOrWhiteSpace($value)) {
            Write-Host "$key is empty in $EnvFile" -ForegroundColor Yellow
            continue
        }

        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        Write-Host "$key loaded from .env" -ForegroundColor Green
    }
}

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# If not admin and not explicitly disabled, elevate
if (-not $isAdmin -and -not $NoElevate) {
    Write-Host "Requesting administrator privileges..." -ForegroundColor Yellow
    
    # Get the path to this script
    $scriptPath = $MyInvocation.MyCommand.Path
    
    # Relaunch as administrator
    try {
        Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -NoElevate" -WorkingDirectory $PSScriptRoot
        exit
    }
    catch {
        Write-Host "Failed to elevate. Running without administrator privileges." -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Start-Sleep -Seconds 2
    }
}

# Set location to script directory
Set-Location $PSScriptRoot

# Detect common virtual environments and attempt to deactivate them to avoid environment sprawl
function Ensure-NoVirtualEnv {
    # Conda
    if ($env:CONDA_DEFAULT_ENV) {
        Write-Host "Detected Conda environment '$env:CONDA_DEFAULT_ENV' — attempting to deactivate..." -ForegroundColor Yellow
        try {
            conda deactivate 2>$null
            Remove-Item Env:CONDA_DEFAULT_ENV -ErrorAction SilentlyContinue
            Write-Host "Conda environment deactivated." -ForegroundColor Green
        } catch {
            Write-Host "Failed to fully deactivate Conda. Proceeding anyway." -ForegroundColor Yellow
        }
    }

    # Python venv / virtualenv
    if ($env:VIRTUAL_ENV) {
        Write-Host "Detected Python virtualenv at '$env:VIRTUAL_ENV' — unsetting environment variables to avoid interference..." -ForegroundColor Yellow
        try {
            Remove-Item Env:VIRTUAL_ENV -ErrorAction SilentlyContinue
            Remove-Item Env:PYTHONHOME -ErrorAction SilentlyContinue
            Remove-Item Env:PYENV_VERSION -ErrorAction SilentlyContinue
            Write-Host "Virtualenv variables cleared." -ForegroundColor Green
        } catch {
            Write-Host "Failed to clear virtualenv environment variables." -ForegroundColor Yellow
        }
    }

    # Pipenv
    if ($env:PIPENV_ACTIVE) {
        Write-Host "Detected Pipenv active environment — unsetting PIPENV_ACTIVE." -ForegroundColor Yellow
        Remove-Item Env:PIPENV_ACTIVE -ErrorAction SilentlyContinue
    }

    # Pyenv
    if ($env:PYENV_VERSION) {
        Write-Host "Detected PYENV_VERSION — unsetting." -ForegroundColor Yellow
        Remove-Item Env:PYENV_VERSION -ErrorAction SilentlyContinue
    }
}

Ensure-NoVirtualEnv

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Autogen Design - Dev Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Terminate any processes running on ports 3000, 3001, 3002
$portsToFree = @(3000, 3001, 3002)
foreach ($port in $portsToFree) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "Terminating process '$($process.ProcessName)' (PID: $processId) on port $port..." -ForegroundColor Yellow
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "Port $port freed successfully." -ForegroundColor Green
                }
            }
        }
    }
    catch {
        # Port is already free or error checking
    }
}
Write-Host ""

# Check if pnpm is installed
$pnpmInstalled = Get-Command pnpm -ErrorAction SilentlyContinue

if (-not $pnpmInstalled) {
    Write-Host "Error: pnpm is not installed!" -ForegroundColor Red
    Write-Host "Please install pnpm first:" -ForegroundColor Yellow
    Write-Host "  npm install -g pnpm" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Dependencies not found. Installing..." -ForegroundColor Yellow
    Write-Host ""
    pnpm install
    Write-Host ""
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Copying .env.example to .env..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Please edit .env file with your configuration before starting." -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne 'y') {
            exit 0
        }
    }
    else {
        Write-Host "Error: .env.example not found!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Set-FluxEnvironmentFromEnv ".env"

Write-Host "Starting development server in new window..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "A new PowerShell window will open with the dev server" -ForegroundColor Yellow
Write-Host ""

# Start the development server in a new PowerShell window to avoid terminal interruptions
try {
    Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$PSScriptRoot'; pnpm dev" -WorkingDirectory $PSScriptRoot
    Write-Host "Development server started successfully!" -ForegroundColor Green
    Write-Host "Check the new PowerShell window for server output." -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "Error starting development server:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
