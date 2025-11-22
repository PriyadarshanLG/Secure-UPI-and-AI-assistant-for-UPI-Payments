@echo off
REM Optimized ML Service Startup Script
REM Starts service in background and verifies it's ready

cd /d "%~dp0"
cd ml-service

set "PREFERRED_PY_VERSION=3.11"
set "PYTHON_CMD="

echo ========================================
echo Starting ML Service (Background Mode)
echo ========================================
echo.

REM Find Python
py -%PREFERRED_PY_VERSION% --version >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=py -%PREFERRED_PY_VERSION%"
) else (
    python --version >nul 2>&1
    if not errorlevel 1 (
        python -c "import sys; exit(0 if sys.version_info[:2]==(3,11) else 1)" >nul 2>&1
        if not errorlevel 1 set PYTHON_CMD=python
    )
)

if "%PYTHON_CMD%"=="" (
    echo ERROR: Python 3.11 not found
    pause
    exit /b 1
)

echo Using: %PYTHON_CMD%
echo.

REM Kill any existing service on port 8000
echo Checking port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    echo Freeing port 8000 from PID %%a...
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

REM Start service
echo Starting ML Service...
start "Secure UPI ML Service" /MIN %PYTHON_CMD% main.py

REM Wait for service to be ready
echo Waiting for service to initialize...
timeout /t 5 /nobreak >nul

set MAX_WAIT=20
set WAIT_COUNT=0

:wait_loop
set /a WAIT_COUNT+=1
if %WAIT_COUNT% gtr %MAX_WAIT% (
    echo ERROR: Service did not start in time
    echo Check the "Secure UPI ML Service" window for errors
    pause
    exit /b 1
)

REM Try to connect to health endpoint
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/health' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 (
    echo.
    echo ========================================
    echo ML Service is READY!
    echo ========================================
    echo Service running at: http://localhost:8000
    echo Health check: http://localhost:8000/health
    echo.
    echo Service is running in background window.
    echo To stop: Close the "Secure UPI ML Service" window
    echo.
    pause
    exit /b 0
)

echo Waiting... (%WAIT_COUNT%/%MAX_WAIT%)
timeout /t 1 /nobreak >nul
goto wait_loop

