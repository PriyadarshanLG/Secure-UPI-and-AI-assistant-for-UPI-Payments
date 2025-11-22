# PowerShell script to start all Secure UPI services
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting All Secure UPI Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; .\start-backend.bat"
Start-Sleep -Seconds 3

# Start ML Service
Write-Host "Starting ML Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; .\start-ml-service.bat"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
if (Test-Path "$projectRoot\frontend") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm run dev"
} else {
    Write-Host "Frontend directory not found. Skipping..." -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "All Services Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "  ML Service:  http://localhost:8000" -ForegroundColor White
Write-Host "  Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Each service is running in a separate window." -ForegroundColor Yellow
Write-Host "Close the windows to stop the services." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this script (services will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

