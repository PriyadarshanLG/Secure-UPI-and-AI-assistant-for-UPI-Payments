@echo off
cd /d "%~dp0"
cd ml-service
echo Starting ML Service on port 8000...
echo.
start "ML Service" cmd /k "python main.py"
timeout /t 3 /nobreak >nul
echo.
echo Service window opened. Check that window for status.
echo.
echo Waiting 10 seconds for service to start...
timeout /t 10 /nobreak >nul
echo.
echo Testing service...
curl http://localhost:8000/health
echo.
echo If you see JSON response above, service is running!
echo If not, check the ML Service window for errors.
pause


