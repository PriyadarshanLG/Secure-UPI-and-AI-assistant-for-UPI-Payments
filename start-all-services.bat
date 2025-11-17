@echo off
echo ========================================
echo Starting Secure UPI - All Services
echo ========================================
echo.

echo Starting Backend...
start "Backend" cmd /k "cd backend && set ML_SERVICE_ENABLED=true && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting ML Service...
start "ML Service" cmd /k "cd ml-service && python main.py"

echo.
echo ========================================
echo All services starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo ML Service: http://localhost:8000
echo.
echo Close this window when done.
pause






