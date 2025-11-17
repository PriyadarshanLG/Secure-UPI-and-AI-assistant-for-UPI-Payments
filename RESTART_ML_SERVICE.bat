@echo off
echo ===================================================
echo  Restarting ML Service - Screenshot Detection Fix
echo ===================================================
echo.

cd ml-service

echo Stopping any running ML service...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq ML Service*" 2>nul

echo.
echo Starting ML Service with new screenshot detection...
echo.

REM Try different Python commands
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting with 'python' command...
    start "ML Service" python main.py
    goto :success
)

where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting with 'py' command...
    start "ML Service" py main.py
    goto :success
)

where python3 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting with 'python3' command...
    start "ML Service" python3 main.py
    goto :success
)

echo.
echo ERROR: Python not found!
echo Please install Python and add it to PATH.
echo See: INSTALL_PYTHON_WINDOWS.md
pause
exit /b 1

:success
echo.
echo ===================================================
echo  ML Service restarted successfully!
echo ===================================================
echo.
echo Look for these logs:
echo   - Screenshot detected: No camera metadata...
echo   - Screenshot with low edit score...
echo   - ORIGINAL IMAGE - confidence: 0.85
echo.
echo Test by uploading a real transaction screenshot.
echo Expected: Status = "Original", Confidence ^> 80%%
echo.
pause
