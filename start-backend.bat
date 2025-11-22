@echo off
title Secure UPI Backend Server
echo ========================================
echo Starting Secure UPI Backend Server
echo ========================================
echo.

cd /d "%~dp0backend"
if errorlevel 1 (
    echo ERROR: Could not change to backend directory
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Using Node.js:
node --version
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found. Creating default...
    echo PORT=5000 > .env
    echo MONGODB_URI=mongodb://localhost:27017/secure-upi >> .env
    echo JWT_SECRET=your-secret-key-change-in-production >> .env
    echo.
    echo Please update .env file with your configuration
    echo.
)

echo.
echo Starting backend server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

node server.js

if errorlevel 1 (
    echo.
    echo ERROR: Backend server failed to start
    echo Check the error messages above
    pause
    exit /b 1
)

