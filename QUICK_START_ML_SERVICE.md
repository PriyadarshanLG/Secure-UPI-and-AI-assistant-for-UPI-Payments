# Quick Start: ML Service

## The Problem
You're seeing "ML service unavailable" errors because the ML service isn't running. This service is required for:
- Image authenticity detection
- Edit detection
- OCR text extraction
- Full forensics analysis

## Quick Fix (3 Steps)

### Step 1: Open a New Terminal/Command Prompt
- Press `Win + R`, type `cmd`, press Enter
- OR open PowerShell

### Step 2: Navigate to Project Directory
```bash
cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI"
```

### Step 3: Start ML Service
**Option A - Background (Recommended):**
```bash
start-ml-service-background.bat
```

**Option B - Manual:**
```bash
cd ml-service
python main.py
```

## Verify It's Running

After starting, wait 5-10 seconds, then check:
```bash
curl http://localhost:8000/health
```

Or open in browser: http://localhost:8000/health

You should see:
```json
{
  "status": "healthy",
  "service": "ml-service",
  "ready": true
}
```

## After Starting

1. **Refresh your browser** (if the web app is open)
2. **Re-upload your image** - The analysis should now work fully
3. You should see proper verdicts, scores, and confidence values

## Troubleshooting

### "Python not found"
- Install Python 3.11 from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

### "Port 8000 already in use"
- The startup script should handle this automatically
- If not, manually kill the process:
```bash
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### "Module not found" errors
- Install dependencies:
```bash
cd ml-service
pip install -r requirements.txt
```

### Service starts but health check fails
- Wait 10-15 seconds (service may still be initializing)
- Check the service window for error messages
- Verify firewall isn't blocking port 8000

## Keep Service Running

- **Don't close the terminal window** where the service is running
- The service must stay running while you use the app
- To stop: Close the terminal window or press `Ctrl+C`

## Background Mode

If you used `start-ml-service-background.bat`:
- Service runs in a minimized window titled "Secure UPI ML Service"
- To stop: Close that window or run:
```bash
taskkill /FI "WINDOWTITLE eq Secure UPI ML Service*" /F
```



