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
echo Starting ML Service on http://localhost:8000
echo Press Ctrl+C to stop the service
echo.

%PYTHON_CMD% main.py

if errorlevel 1 (
    echo.
    echo ERROR: ML Service failed to start
    echo Check the error messages above
    pause
    exit /b 1
)






