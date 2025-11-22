@echo off
echo ========================================
echo Starting ML Service for Deepfake Detection
echo ========================================
echo.

cd ml-service

set "PREFERRED_PY_VERSION=3.11"
set "PYTHON_CMD="

echo Checking Python installation...
echo Looking for Python %PREFERRED_PY_VERSION% ...

REM Try Python launcher with explicit version pin first
py -%PREFERRED_PY_VERSION% --version >nul 2>&1
if errorlevel 1 (
    REM Fallback to python and python3, but ensure they match 3.11.x
    python --version >nul 2>&1
    if not errorlevel 1 (
        python -c "import sys; exit(0 if sys.version_info[:2]==(3,11) else 1)" >nul 2>&1
        if not errorlevel 1 (
            set PYTHON_CMD=python
        )
    )
    if "%PYTHON_CMD%"=="" (
        python3 --version >nul 2>&1
        if not errorlevel 1 (
            python3 -c "import sys; exit(0 if sys.version_info[:2]==(3,11) else 1)" >nul 2>&1
            if not errorlevel 1 (
                set PYTHON_CMD=python3
            )
        )
    )
) else (
    set "PYTHON_CMD=py -%PREFERRED_PY_VERSION%"
)

if "%PYTHON_CMD%"=="" (
    echo ERROR: Could not find a Python %PREFERRED_PY_VERSION%.x interpreter.
    echo.
    echo Please install Python %PREFERRED_PY_VERSION%.x from https://www.python.org/downloads/windows/
    echo and ensure it is added to PATH or accessible via the Python Launcher.
    echo.
    echo Tip: Re-run "py -0p" to confirm that 3.11 appears, or reinstall with
    echo the "Add to PATH" checkbox enabled.
    pause
    exit /b 1
)

echo Using Python command: %PYTHON_CMD%
%PYTHON_CMD% --version

echo.
echo Checking required packages...
%PYTHON_CMD% -c "import fastapi, uvicorn, PIL, numpy, cv2" 2>nul
if errorlevel 1 (
    echo Some packages are missing. Installing...
    echo.
    echo IMPORTANT: OpenCV ^(cv2^) is required for deepfake detection!
    echo Installing all dependencies from requirements.txt...
    echo.
    %PYTHON_CMD% -m pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install packages
        echo.
        echo Trying with --user flag ^(no admin required^)...
        %PYTHON_CMD% -m pip install --user -r requirements.txt
        if errorlevel 1 (
            echo.
            echo ERROR: Installation failed
            echo.
            echo Try installing manually:
            echo   %PYTHON_CMD% -m pip install opencv-python
            echo   %PYTHON_CMD% -m pip install -r requirements.txt
            echo.
            echo Or run: install-opencv.bat
            pause
            exit /b 1
        )
    )
    echo.
    echo Verifying OpenCV installation...
    %PYTHON_CMD% -c "import cv2; print(f'OpenCV version: {cv2.__version__}')" 2>nul
    if errorlevel 1 (
        echo WARNING: OpenCV installation may have failed
        echo Deepfake detection will have limited functionality
        echo.
        echo Try running: install-opencv.bat
    ) else (
        echo OpenCV installed successfully!
    )
)

echo.
echo Checking if port 8000 is already in use...
netstat -ano | findstr :8000 >nul 2>&1
if not errorlevel 1 (
    echo Port 8000 is in use. Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
        echo Killing process %%a on port 8000...
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo.
echo Starting ML Service on http://localhost:8000
echo Service will start in the background...
echo.

REM Start service in background using start command
start "Secure UPI ML Service" /MIN %PYTHON_CMD% main.py

REM Wait a moment for service to initialize
timeout /t 5 /nobreak >nul

echo Waiting for ML service to be ready...
set MAX_RETRIES=30
set RETRY_COUNT=0
set SERVICE_READY=0

:check_health
set /a RETRY_COUNT+=1
if %RETRY_COUNT% gtr %MAX_RETRIES% (
    echo.
    echo WARNING: Health check timeout, but service may still be running
    echo Checking if service is responding...
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8000/health' -TimeoutSec 3 -UseBasicParsing | Out-Null; Write-Host 'Service is responding!' } catch { Write-Host 'Service not responding yet' }"
    echo.
    echo Please check the "Secure UPI ML Service" window for status
    echo Service URL: http://localhost:8000
    echo.
    pause
    exit /b 0
)

REM Check if service is responding using PowerShell
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing -TimeoutSec 3 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo Waiting for service... (%RETRY_COUNT%/%MAX_RETRIES%)
    timeout /t 1 /nobreak >nul
    goto check_health
)

echo.
echo ========================================
echo ML Service is READY and running!
echo ========================================
echo Service URL: http://localhost:8000
echo Health Check: http://localhost:8000/health
echo.
echo The service is running in the background.
echo To stop it, close the "Secure UPI ML Service" window or run:
echo   taskkill /FI "WINDOWTITLE eq Secure UPI ML Service*" /F
echo.
pause






