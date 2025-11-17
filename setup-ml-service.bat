@echo off
echo ========================================
echo Secure UPI - ML Service Setup
echo ========================================
echo.

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Python is not installed!
    echo Please install Python 3.11+ first.
    echo.
    echo Opening installation guide...
    start SETUP_ML_SERVICE.md
    pause
    exit /b 1
)

echo.
echo Python found! Installing dependencies...
echo.

cd ml-service
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ========================================
echo ML Service Setup Complete!
echo ========================================
echo.
echo To start the ML service, run:
echo   python main.py
echo.
echo Or run: start-ml-service.bat
echo.
pause






