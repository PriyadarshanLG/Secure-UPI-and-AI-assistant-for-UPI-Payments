@echo off
title Start ML Service - Secure UPI (Alternative Methods)
color 0A

echo.
echo ============================================================
echo        ML SERVICE STARTER - Multiple Methods
echo ============================================================
echo.

REM Try different Python commands in order

echo [1/5] Checking for python...
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo     SUCCESS: 'python' command found!
    goto :start_with_python
)
echo     'python' not found, trying next...

echo.
echo [2/5] Checking for py launcher...
py --version >nul 2>&1
if %errorlevel% == 0 (
    echo     SUCCESS: 'py' launcher found!
    goto :start_with_py
)
echo     'py' launcher not found, trying next...

echo.
echo [3/5] Checking for python3...
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo     SUCCESS: 'python3' command found!
    goto :start_with_python3
)
echo     'python3' not found, trying next...

echo.
echo [4/5] Checking specific Python versions...
py -3.11 --version >nul 2>&1
if %errorlevel% == 0 (
    echo     SUCCESS: Python 3.11 found!
    goto :start_with_py311
)

py -3.12 --version >nul 2>&1
if %errorlevel% == 0 (
    echo     SUCCESS: Python 3.12 found!
    goto :start_with_py312
)
echo     Specific versions not found...

echo.
echo [5/5] Looking for Python in common locations...
if exist "C:\Python311\python.exe" (
    echo     SUCCESS: Found Python at C:\Python311\
    goto :start_with_path311
)

if exist "C:\Python312\python.exe" (
    echo     SUCCESS: Found Python at C:\Python312\
    goto :start_with_path312
)

if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    echo     SUCCESS: Found Python in LocalAppData!
    goto :start_with_localappdata311
)

if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    echo     SUCCESS: Found Python in LocalAppData!
    goto :start_with_localappdata312
)

REM If we get here, Python is not found
goto :python_not_found

REM ============================================================
REM Start methods
REM ============================================================

:start_with_python
echo.
echo Starting ML service with 'python' command...
echo.
cd ml-service
python main.py
goto :end

:start_with_py
echo.
echo Starting ML service with 'py' launcher...
echo.
cd ml-service
py main.py
goto :end

:start_with_python3
echo.
echo Starting ML service with 'python3' command...
echo.
cd ml-service
python3 main.py
goto :end

:start_with_py311
echo.
echo Starting ML service with Python 3.11...
echo.
cd ml-service
py -3.11 main.py
goto :end

:start_with_py312
echo.
echo Starting ML service with Python 3.12...
echo.
cd ml-service
py -3.12 main.py
goto :end

:start_with_path311
echo.
echo Starting ML service with C:\Python311\python.exe...
echo.
cd ml-service
C:\Python311\python.exe main.py
goto :end

:start_with_path312
echo.
echo Starting ML service with C:\Python312\python.exe...
echo.
cd ml-service
C:\Python312\python.exe main.py
goto :end

:start_with_localappdata311
echo.
echo Starting ML service from LocalAppData Python 3.11...
echo.
cd ml-service
"%LOCALAPPDATA%\Programs\Python\Python311\python.exe" main.py
goto :end

:start_with_localappdata312
echo.
echo Starting ML service from LocalAppData Python 3.12...
echo.
cd ml-service
"%LOCALAPPDATA%\Programs\Python\Python312\python.exe" main.py
goto :end

REM ============================================================
REM Error handling
REM ============================================================

:python_not_found
echo.
echo ============================================================
echo ERROR: Python NOT FOUND!
echo ============================================================
echo.
echo Python is required to run the ML service.
echo.
echo QUICK FIX OPTIONS:
echo.
echo Option 1 - Install from Microsoft Store (Easiest):
echo   1. Press Windows Key
echo   2. Type "Microsoft Store"
echo   3. Search for "Python 3.12"
echo   4. Click Install
echo   5. Restart this script
echo.
echo Option 2 - Install from Python.org (Recommended):
echo   1. Visit: https://www.python.org/downloads/
echo   2. Download Python 3.11 or 3.12
echo   3. Run installer
echo   4. IMPORTANT: Check "Add Python to PATH"
echo   5. Restart your computer
echo   6. Run this script again
echo.
echo Option 3 - Read detailed guide:
echo   Open: INSTALL_PYTHON_WINDOWS.md
echo.
echo ============================================================
echo.
pause
exit /b 1

:end
pause



