# ⚠️ IMPORTANT: Restart ML Service

## Changes Made
The forgery detection has been significantly improved to better recognize real transaction screenshots:

1. **Frequency Domain Analysis**: Now uses 15x multiplier for screenshots (was 4.5x) - essentially ignores frequency patterns for screenshots
2. **Screenshot Detection**: More lenient - doesn't require divisible_by_10, lower resolution requirements
3. **Edit Score Thresholds**: 80% higher for screenshots (was 30%)
4. **Authentic Screenshot Boost**: 100% more reduction (was 50%)

## You MUST Restart the ML Service

The changes won't take effect until you restart the ML service:

### Option 1: Restart Script
```powershell
# Stop the current ML service (Ctrl+C in its window)
# Then run:
.\start-ml-service.bat
```

### Option 2: Manual Restart
```powershell
# Find and kill the process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Then start it again
cd ml-service
python main.py
```

### Option 3: Quick Restart (PowerShell)
```powershell
# Kill process on port 8000
Get-Process | Where-Object {$_.Id -eq (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue).OwningProcess} | Stop-Process -Force

# Start ML service
cd ml-service
Start-Process python -ArgumentList "main.py" -WindowStyle Minimized
```

## Verify It's Running
```powershell
# Check if ML service is responding
Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing
```

You should see:
```json
{
  "status": "healthy",
  "service": "ml-service",
  "ready": true
}
```

## After Restart
1. Try uploading a real transaction screenshot again
2. It should now show `CLEAN` or `LEGITIMATE` instead of `TAMPERED`
3. Edit detection should show `NOT EDITED` with low confidence (~10-15%)

---

**The ML service MUST be restarted for the fixes to work!**

