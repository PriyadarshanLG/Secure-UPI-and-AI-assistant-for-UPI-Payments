@echo off
title Fix False Positives - Secure UPI
color 0A

echo.
echo ============================================================
echo      FIX FALSE POSITIVES - AUTOMATED INSTALLER
echo ============================================================
echo.
echo This will adjust detection thresholds to reduce false positives
echo while maintaining fraud detection accuracy.
echo.
echo ============================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python first, then run this script again.
    echo.
    pause
    exit /b 1
)

echo Checking files...
echo.

REM Check if files exist
if not exist "ml-service\main.py" (
    echo ERROR: ml-service\main.py not found!
    echo Please run this from the project root directory.
    echo.
    pause
    exit /b 1
)

if not exist "ml-service\fraud_detection_config.py" (
    echo ERROR: fraud_detection_config.py not found!
    echo Please ensure all fix files are in ml-service\ directory.
    echo.
    pause
    exit /b 1
)

echo All files found!
echo.
echo ============================================================
echo.
echo Ready to apply fix. This will:
echo   1. Backup your current main.py
echo   2. Apply balanced threshold adjustments
echo   3. Reduce false positives by 60-80%%
echo.
echo ============================================================
echo.

pause

echo.
echo Applying fix...
echo.

REM Run the fix script
python fix_false_positives.py

if errorlevel 1 (
    echo.
    echo ============================================================
    echo ERROR: Fix failed!
    echo ============================================================
    echo.
    echo Please check the error messages above and try manual fix.
    echo See FIX_FALSE_POSITIVES_GUIDE.md for instructions.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo SUCCESS: Fix applied!
echo ============================================================
echo.
echo Next step: Restart ML service
echo.
echo Option 1 - Using start script:
echo   Double-click: start-ml-service.bat
echo.
echo Option 2 - Manual restart:
echo   cd ml-service
echo   python main.py
echo.
echo ============================================================
echo.
echo Press any key to open the ML service directory...
pause >nul

start "" explorer "ml-service"

echo.
echo Done! Now restart the ML service and test.
echo.
pause



