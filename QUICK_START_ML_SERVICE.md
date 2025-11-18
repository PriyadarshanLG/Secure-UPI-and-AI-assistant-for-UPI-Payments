# Quick Start: ML Service

## The Problem
You're seeing a **503 Service Unavailable** error because the ML service is not running.

## Quick Fix (3 Steps)

### Step 1: Open a New Terminal/Command Prompt
- Press `Win + R`
- Type `cmd` or `powershell`
- Press Enter

### Step 2: Navigate to ML Service Directory
```bash
cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI\ml-service"
```

### Step 3: Start the ML Service
```bash
py main.py
```

**OR** use the batch script:
```bash
cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI"
start-ml-service.bat
```

## What You Should See

When the ML service starts successfully, you'll see:
```
INFO:__main__:============================================================
INFO:__main__:Starting Secure UPI ML Service
INFO:__main__:============================================================
INFO:__main__:Service will be available at: http://0.0.0.0:8000
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## Verify It's Working

1. **Check Health Endpoint:**
   - Open browser: http://localhost:8000/health
   - Should show: `{"status":"healthy",...}`

2. **Test Voice Detection:**
   - Go back to your app
   - Upload an audio file
   - Click "Detect AI Voice & Spam"
   - Should work now!

## Common Issues

### Issue 1: "Python was not found"
**Solution:** Use `py` instead of `python`:
```bash
py main.py
```

### Issue 2: "Module not found" errors
**Solution:** Install missing packages:
```bash
py -m pip install librosa soundfile opencv-python-headless
```

### Issue 3: "Port 8000 already in use"
**Solution:** 
- Find what's using port 8000: `netstat -ano | findstr :8000`
- Kill the process or change port in `main.py`

## Keep ML Service Running

**Important:** Keep the terminal window open while using the app!

- The ML service must be running for voice detection to work
- Don't close the terminal window
- Press `Ctrl+C` to stop the service when done

## All Services Should Be Running

For the app to work fully, you need:

1. ✅ **Backend** (Port 5000) - Usually running
2. ✅ **Frontend** (Port 5173) - Usually running  
3. ⚠️ **ML Service** (Port 8000) - **YOU NEED TO START THIS!**

## Quick Command Reference

```bash
# Start ML Service
cd ml-service
py main.py

# Or use batch script
start-ml-service.bat

# Check if running
curl http://localhost:8000/health
```

---

**Once the ML service is running, try voice detection again!** 🎤





