@echo off
REM Autogen Design - Development Server Launcher (Batch)
REM Simple batch file to start the Next.js development server

title Autogen Design - Dev Server

echo.
echo ========================================
echo    Autogen Design - Dev Server
echo ========================================
echo.

REM Check if pnpm is available
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: pnpm is not installed!
    echo Please install pnpm first:
    echo   npm install -g pnpm
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Dependencies not found. Installing...
    echo.
    call pnpm install
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found!
    
    if exist ".env.example" (
        echo Copying .env.example to .env...
        copy ".env.example" ".env" >nul
        echo Please edit .env file with your configuration.
        echo.
        set /p continue="Continue anyway? (y/n): "
        if /i not "%continue%"=="y" exit /b 0
    ) else (
        echo Error: .env.example not found!
        pause
        exit /b 1
    )
)

echo Starting development server...
echo.
echo Checking for processes on ports 3000-3002...
echo.

REM Kill processes on ports 3000, 3001, 3002
for %%p in (3000 3001 3002) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p" ^| findstr "LISTENING"') do (
        echo Terminating process on port %%p (PID: %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo Starting development server in new window...
echo.
echo Server will be available at: http://localhost:3000
echo A new window will open with the dev server
echo.

REM Start the development server in a new window to avoid interruptions
REM Detect common virtual environments and attempt to deactivate them to avoid environment sprawl
setlocal enabledelayedexpansion
set _conda_active=
for /f "usebackq tokens=2 delims==" %%A in (`set CONDA_DEFAULT_ENV 2^>nul`) do set _conda_active=%%A
if defined _conda_active (
    echo Detected Conda environment !_conda_active! — attempting to deactivate...
    call conda deactivate 2>nul || echo Failed to deactivate Conda — proceeding
)
if defined VIRTUAL_ENV (
    echo Detected Python virtualenv at %VIRTUAL_ENV% — clearing environment variables...
    set VIRTUAL_ENV=
    set PYTHONHOME=
    set PYENV_VERSION=
)

REM Start the development server in a new window to avoid interruptions
start "Autogen Design Dev Server" cmd /k "pnpm dev"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error starting development server!
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo Development server started successfully!
    echo Check the new window for server output.
    echo.
    pause
)
