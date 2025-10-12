#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build and start Autogen Design production server
.DESCRIPTION
    Stops dev servers, builds Next.js for production, and starts the production server in a new window
.PARAMETER NoElevate
    Skip UAC elevation prompt
#>

param(
    [switch]$NoElevate
)

# Set strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

# Get project root directory
$ProjectRoot = $PSScriptRoot
Set-Location $ProjectRoot

# Terminal colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Info { Write-ColorOutput Cyan $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }

# Banner
Write-Info ""
Write-Info "========================================"
Write-Info "   Autogen Design - Production Build"
Write-Info "========================================"
Write-Info ""

# Check for virtual environments and deactivate
$CondaEnv = $env:CONDA_DEFAULT_ENV
$VirtualEnv = $env:VIRTUAL_ENV
$PipenvActive = $env:PIPENV_ACTIVE
$PyenvVirtualEnv = $env:PYENV_VIRTUAL_ENV

if ($CondaEnv) {
    Write-Warning "Detected Conda environment '$CondaEnv' — attempting to deactivate..."
    try {
        conda deactivate
        Write-Success "Conda environment deactivated."
    } catch {
        Write-Warning "Could not deactivate Conda automatically. Please run 'conda deactivate' manually."
    }
}

if ($VirtualEnv) {
    Write-Warning "Detected virtualenv at '$VirtualEnv' — attempting to deactivate..."
    try {
        deactivate
        Write-Success "Virtualenv deactivated."
    } catch {
        Write-Warning "Could not deactivate virtualenv automatically."
    }
}

if ($PipenvActive) {
    Write-Warning "Detected Pipenv environment — attempting to exit..."
    try {
        exit
        Write-Success "Pipenv environment exited."
    } catch {
        Write-Warning "Could not exit Pipenv automatically."
    }
}

if ($PyenvVirtualEnv) {
    Write-Warning "Detected Pyenv virtualenv '$PyenvVirtualEnv' — attempting to deactivate..."
    try {
        pyenv deactivate
        Write-Success "Pyenv virtualenv deactivated."
    } catch {
        Write-Warning "Could not deactivate Pyenv automatically."
    }
}

# Kill any running dev servers on port 3000
Write-Info "Checking for running servers on port 3000..."
try {
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processes) {
        foreach ($pid in $processes) {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Warning "Terminating process '$($proc.Name)' (PID: $pid) on port 3000..."
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Success "Port 3000 freed successfully."
    } else {
        Write-Info "Port 3000 is available."
    }
} catch {
    Write-Info "Port 3000 appears to be available."
}

# Verify Azure environment variables
Write-Info ""
Write-Info "Verifying Azure Flux configuration..."
$envVars = @(
    "AZURE_FLUX_11_PRO_ENDPOINT",
    "AZURE_FLUX_11_PRO_API_KEY",
    "AZURE_FLUX_KONTEXT_PRO_ENDPOINT",
    "AZURE_FLUX_KONTEXT_PRO_API_KEY"
)

foreach ($var in $envVars) {
    if (Test-Path "env:$var") {
        Write-Success "$var loaded from .env"
    } else {
        Write-Warning "$var not found in environment"
    }
}

# Clean old build artifacts
Write-Info ""
Write-Info "Cleaning previous build artifacts..."
if (Test-Path ".next") {
    try {
        Remove-Item -Path ".next" -Recurse -Force -ErrorAction Stop
        Write-Success "Removed .next directory"
    } catch {
        Write-Warning "Could not remove .next directory - may be locked by another process"
        Write-Info "Attempting to continue anyway..."
    }
}

# Build command to run in new window
$BuildCommand = @"
Write-Host '========================================'
Write-Host '   Autogen Design - Production Build   '
Write-Host '========================================'
Write-Host ''
Set-Location '$ProjectRoot'

Write-Host 'Checking for running servers on port 3000...'
try {
    `$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    if (`$processes) {
        foreach (`$pid in `$processes) {
            `$proc = Get-Process -Id `$pid -ErrorAction SilentlyContinue
            if (`$proc) {
                Write-Host "Terminating process '`$(`$proc.Name)' (PID: `$pid) on port 3000..." -ForegroundColor Yellow
                Stop-Process -Id `$pid -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host 'Port 3000 freed successfully.' -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host 'Port 3000 is available.' -ForegroundColor Green
    }
} catch {
    Write-Host 'Port 3000 appears to be available.' -ForegroundColor Green
}

Write-Host ''
Write-Host 'Building Next.js application...'
Write-Host ''
pnpm run build
if (`$LASTEXITCODE -eq 0) {
    Write-Host ''
    Write-Host '========================================'
    Write-Host '   Build completed successfully!      '
    Write-Host '========================================'
    Write-Host ''
    Write-Host 'Starting production server...'
    Write-Host 'Server will be available at: http://localhost:3000'
    Write-Host ''
    Write-Host 'Press Ctrl+C to stop the server'
    Write-Host ''
    pnpm start
} else {
    Write-Host ''
    Write-Host '========================================'
    Write-Host '   Build failed!                      '
    Write-Host '========================================'
    Write-Host ''
    Write-Host 'Press any key to close...'
    `$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}
"@

# Encode command for execution
$EncodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($BuildCommand))

Write-Info ""
Write-Info "Starting production build in new window..."
Write-Info ""

# Start new PowerShell window with build and start commands
try {
    Start-Process powershell.exe -ArgumentList "-NoExit", "-EncodedCommand", $EncodedCommand -WindowStyle Normal
    Write-Success "Production build started successfully!"
    Write-Info "Check the new PowerShell window for build output."
    Write-Info ""
    Write-Info "Once build completes, server will be available at: http://localhost:3000"
} catch {
    Write-Error "Failed to start production build window: $_"
    exit 1
}

Write-Info ""
