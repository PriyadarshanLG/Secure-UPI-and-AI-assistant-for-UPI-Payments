@echo off
echo ========================================
echo ML Service Startup Test
echo ========================================
echo.

cd ml-service

echo Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo.
echo Checking dependencies...
python -c "import fastapi, uvicorn; print('Dependencies OK')"
if errorlevel 1 (
    echo ERROR: Dependencies missing!
    echo Installing dependencies...
    pip install -r requirements.txt
)

echo.
echo Starting ML Service...
echo (This will show any errors - press Ctrl+C to stop)
echo.
python main.py

pause



