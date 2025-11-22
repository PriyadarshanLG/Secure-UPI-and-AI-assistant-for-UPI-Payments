@echo off
title ML Service Startup
color 0A
echo ========================================
echo   Starting ML Service
echo ========================================
echo.

cd /d "%~dp0"
cd ml-service

echo Current directory: %CD%
echo.

echo Checking Python...
python --version
if errorlevel 1 (
    echo.
    echo ERROR: Python not found!
    echo Please install Python 3.11
    pause
    exit /b 1
)

echo.
echo Starting ML Service on http://localhost:8000
echo.
echo IMPORTANT: Keep this window open!
echo The service will run here.
echo.
echo To stop the service, close this window or press Ctrl+C
echo.
echo ========================================
echo.

python main.py

pause


