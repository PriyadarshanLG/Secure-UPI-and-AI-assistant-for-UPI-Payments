# PowerShell script to start ML Service with health check
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting ML Service (Optimized)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to ml-service directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptPath "ml-service")

# Find Python 3.11
$pythonCmd = $null
if (Get-Command py -ErrorAction SilentlyContinue) {
    try {
        $version = py -3.11 --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $pythonCmd = "py -3.11"
        }
    } catch {}
}

if (-not $pythonCmd) {
    if (Get-Command python -ErrorAction SilentlyContinue) {
        try {
            $version = python --version 2>&1
            if ($version -match "3\.11") {
                $pythonCmd = "python"
            }
        } catch {}
    }
}

if (-not $pythonCmd) {
    Write-Host "ERROR: Python 3.11 not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Using: $pythonCmd" -ForegroundColor Green
Write-Host ""

# Kill any process on port 8000
Write-Host "Checking port 8000..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $processes) {
    Write-Host "Freeing port 8000 from PID $pid..." -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

# Start service in background
Write-Host "Starting ML Service..." -ForegroundColor Green
$process = Start-Process -FilePath $pythonCmd -ArgumentList "main.py" -WindowStyle Minimized -PassThru

Write-Host "Waiting for service to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Wait for health check
$maxWait = 20
$waitCount = 0
$serviceReady = $false

while ($waitCount -lt $maxWait) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $serviceReady = $true
            break
        }
    } catch {
        # Service not ready yet
    }
    
    $waitCount++
    Write-Host "Waiting... ($waitCount/$maxWait)" -ForegroundColor Yellow
    Start-Sleep -Seconds 1
}

if ($serviceReady) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "ML Service is READY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Service running at: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "Health check: http://localhost:8000/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Service is running in background (PID: $($process.Id))" -ForegroundColor Green
    Write-Host "To stop: Stop-Process -Id $($process.Id)" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Service did not start in time" -ForegroundColor Red
    Write-Host "Check the service window for errors" -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to exit"

