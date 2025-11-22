# 🚀 START HERE - Secure UPI Quick Start

## ⚠️ IMPORTANT: Start Backend Server First!

The **Network Error** you're seeing means the backend server is not running.

## Quick Fix (PowerShell)

```powershell
.\start-backend.bat
```

## What You Need Running

1. ✅ **Backend Server** (port 5000) - **REQUIRED**
2. ✅ **ML Service** (port 8000) - Already running
3. ✅ **Frontend** (port 5173) - Already running

## Step-by-Step

### 1. Start Backend Server

**In PowerShell:**
```powershell
.\start-backend.bat
```

**Or manually:**
```powershell
cd backend
npm start
```

### 2. Verify It's Running

You should see:
```
Server running on port 5000
```

### 3. Try Upload Again

Once the backend is running, go back to the upload page and try again.

## All Services at Once

To start everything:
```powershell
.\start-all-services.ps1
```

## Troubleshooting

### "Port 5000 already in use"
```powershell
# Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### "Cannot find module"
```powershell
cd backend
npm install
```

### Still Getting Network Error?
1. Check backend is running: `netstat -ano | findstr :5000`
2. Check backend logs for errors
3. Make sure MongoDB is running (if using local DB)

## Service Status Check

```powershell
# Check Backend (should show LISTENING)
netstat -ano | findstr :5000

# Check ML Service (should show LISTENING)  
netstat -ano | findstr :8000
```

---

**Once backend is running, the upload will work!** 🎉

