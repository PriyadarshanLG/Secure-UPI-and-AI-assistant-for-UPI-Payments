@echo off
title IEEE Paper PDF Generator
color 0A

echo.
echo ============================================================
echo          IEEE PAPER PDF GENERATOR - SECURE UPI
echo ============================================================
echo.
echo This will open your IEEE paper in your default browser.
echo Then you can press Ctrl+P to save it as PDF.
echo.
echo ============================================================
echo.

REM Try to open the simplified version first
if exist "IEEE_Paper_Print_Simple.html" (
    echo Opening simplified version (recommended)...
    echo.
    echo INSTRUCTIONS:
    echo 1. Browser will open in 3 seconds
    echo 2. Press Ctrl+P on your keyboard
    echo 3. Select "Save as PDF" 
    echo 4. Click Save
    echo.
    timeout /t 3 /nobreak >nul
    start "" "IEEE_Paper_Print_Simple.html"
    echo.
    echo Browser opened! Press Ctrl+P to save as PDF
) else if exist "IEEE_Paper_Secure_UPI.html" (
    echo Opening main version...
    echo.
    echo INSTRUCTIONS:
    echo 1. Browser will open in 3 seconds
    echo 2. Click the blue "Print" button OR press Ctrl+P
    echo 3. Select "Save as PDF"
    echo 4. Click Save
    echo.
    timeout /t 3 /nobreak >nul
    start "" "IEEE_Paper_Secure_UPI.html"
    echo.
    echo Browser opened! Use Ctrl+P to save as PDF
) else (
    echo.
    echo ERROR: IEEE Paper HTML files not found!
    echo.
    echo Please make sure you have:
    echo - IEEE_Paper_Print_Simple.html
    echo OR
    echo - IEEE_Paper_Secure_UPI.html
    echo.
    echo in the same folder as this batch file.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo.
echo TIP: If the print button doesn't work, just press Ctrl+P
echo      This keyboard shortcut ALWAYS works!
echo.
echo ============================================================
echo.
echo This window will close in 10 seconds...
timeout /t 10 /nobreak >nul
exit


