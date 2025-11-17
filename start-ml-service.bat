@echo off
echo ========================================
echo Starting ML Service for Deepfake Detection
echo ========================================
echo.

cd ml-service

echo Checking Python installation...
REM Try py first (Windows Python Launcher), then python, then python3
py --version >nul 2>&1
if errorlevel 1 (
    python --version >nul 2>&1
    if errorlevel 1 (
        python3 --version >nul 2>&1
        if errorlevel 1 (
            echo ERROR: Python is not installed or not in PATH
            echo Please install Python 3.8+ from https://www.python.org/
            echo Make sure to check "Add Python to PATH" during installation
            pause
            exit /b 1
        ) else (
            set PYTHON_CMD=python3
        )
    ) else (
        set PYTHON_CMD=python
    )
) else (
    set PYTHON_CMD=py
)

echo Using Python command: %PYTHON_CMD%
%PYTHON_CMD% --version

echo.
echo Checking required packages...
%PYTHON_CMD% -c "import fastapi, uvicorn, PIL, numpy, cv2" 2>nul
if errorlevel 1 (
    echo Some packages are missing. Installing...
    echo.
    echo IMPORTANT: OpenCV (cv2) is required for deepfake detection!
    echo Installing all dependencies from requirements.txt...
    echo.
    %PYTHON_CMD% -m pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install packages
        echo.
        echo Trying with --user flag (no admin required)...
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






