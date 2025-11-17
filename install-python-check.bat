@echo off
echo Checking Python installation...
echo.
python --version
if %errorlevel% equ 0 (
    echo.
    echo ✓ Python is installed successfully!
    echo.
    echo Now run: setup-ml-service.bat
) else (
    echo.
    echo ✗ Python is not found.
    echo.
    echo Please:
    echo 1. Make sure you checked "Add Python to PATH" during installation
    echo 2. Close and reopen PowerShell/Command Prompt
    echo 3. Run this script again
)
echo.
pause






