@echo off
REM Quick test script to check if ML service is running
echo Testing ML Service Health...
echo.

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing; Write-Host 'Status: OK' -ForegroundColor Green; Write-Host 'Response:'; $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3 } catch { Write-Host 'Status: FAILED' -ForegroundColor Red; Write-Host 'Error:' $_.Exception.Message }"

echo.
pause

