# ML Service Setup Guide

## Step 1: Install Python

**Option A - Microsoft Store (Recommended):**
1. Open Microsoft Store
2. Search for "Python 3.11" or "Python 3.12"
3. Click Install
4. Wait for installation to complete

**Option B - Download from python.org:**
1. Visit: https://www.python.org/downloads/
2. Download Python 3.11 or 3.12 for Windows
3. Run installer
4. ⚠️ **Important:** Check "Add Python to PATH"
5. Click "Install Now"

## Step 2: Verify Python Installation

Open a **NEW** PowerShell window and run:
```powershell
python --version
```
Should show: `Python 3.11.x` or `Python 3.12.x`

## Step 3: Install ML Service Dependencies

```powershell
cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI\ml-service"
pip install -r requirements.txt
```

## Step 4: Start ML Service

```powershell
python main.py
```

ML Service will run on: http://localhost:8000

## Step 5: Enable ML Service in Backend

Edit `backend\.env` and change:
```
ML_SERVICE_ENABLED=false
```
to:
```
ML_SERVICE_ENABLED=true
```

Then restart the backend server.

## Verify ML Service is Working

Open browser and visit: http://localhost:8000/health

Should see:
```json
{"status": "healthy", "service": "ml-service"}
```

---

## Note: ML Service is Optional

The app works fine **without** the ML service. Image analysis will use stub/mock data instead of real ML processing. Only install if you want to test/develop the ML features.






