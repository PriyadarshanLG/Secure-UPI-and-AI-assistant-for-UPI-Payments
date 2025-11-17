@echo off
echo ========================================
echo Installing OpenCV and ML Service Dependencies
echo ========================================
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

cd ml-service
if errorlevel 1 (
    echo ERROR: Cannot find ml-service directory
    echo Make sure you're running this from the project root
    pause
    exit /b 1
)

echo Checking Python installation...
REM Try py first (Windows Python Launcher), then python, then python3
py --version >nul 2>&1
if errorlevel 1 (
    python --version >nul 2>&1
    if errorlevel 1 (
        python3 --version >nul 2>&1
        if errorlevel 1 (
            echo.
            echo ERROR: Python is not installed or not in PATH
            echo.
            echo Please install Python 3.8+ from https://www.python.org/
            echo Make sure to check "Add Python to PATH" during installation
            echo.
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
echo Upgrading pip...
%PYTHON_CMD% -m pip install --upgrade pip --quiet

echo.
echo ========================================
echo Installing OpenCV (cv2) - REQUIRED
echo ========================================
echo.

REM Try python -m pip first (most reliable)
%PYTHON_CMD% -m pip --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python pip is not available
    echo.
    echo Please install Python from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo Installing OpenCV...
%PYTHON_CMD% -m pip install opencv-python
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install opencv-python
    echo.
    echo Trying with --user flag (no admin required)...
    %PYTHON_CMD% -m pip install --user opencv-python
    if errorlevel 1 (
        echo.
        echo ERROR: Installation failed even with --user flag
        echo.
        echo Try:
        echo 1. Run this script as Administrator (Right-click - Run as Administrator)
        echo 2. Or install manually: %PYTHON_CMD% -m pip install opencv-python
        echo 3. Or upgrade pip first: %PYTHON_CMD% -m pip install --upgrade pip
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Verifying OpenCV installation...
%PYTHON_CMD% -c "import cv2; print(f'✓ OpenCV {cv2.__version__} installed successfully!')"
if errorlevel 1 (
    echo WARNING: OpenCV import failed, but installation may have succeeded
    echo Try restarting the ML service
)

echo.
echo ========================================
echo Installing all ML service dependencies...
echo ========================================
echo.
%PYTHON_CMD% -m pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo WARNING: Some dependencies may have failed to install
    echo Trying with --user flag...
    %PYTHON_CMD% -m pip install --user -r requirements.txt
    if errorlevel 1 (
        echo.
        echo WARNING: Some dependencies may still be missing
        echo You can try installing them individually:
        echo   %PYTHON_CMD% -m pip install fastapi uvicorn pillow numpy scipy
        echo   %PYTHON_CMD% -m pip install opencv-python scikit-image imageio
        echo.
    )
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Verifying key packages...
%PYTHON_CMD% -c "import cv2, fastapi, uvicorn, PIL, numpy; print('✓ All critical packages installed!')" 2>nul
if errorlevel 1 (
    echo Some packages may still be missing
    echo Check the errors above
) else (
    echo.
    echo ✓ Ready to start ML service!
)

echo.
echo You can now start the ML service with:
echo   start-ml-service.bat
echo.
pause

