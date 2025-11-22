# ML Service Startup Guide

## Quick Start

The ML service has been optimized for faster startup. Use one of these methods:

### Method 1: Background Startup (Recommended)
```batch
start-ml-service-background.bat
```
- Automatically frees port 8000 if in use
- Starts service in background window
- Waits for health check to confirm service is ready
- Provides clear status messages

### Method 2: PowerShell Script
```powershell
.\start-ml-service.ps1
```
- Same features as batch script
- Better error handling
- Shows process ID for stopping

### Method 3: Original Script (Interactive)
```batch
start-ml-service.bat
```
- Starts service in foreground
- Press Ctrl+C to stop

## Optimizations Made

1. **Lazy Loading**: TensorFlow now loads only when needed (not at startup)
2. **Fast Health Check**: Service responds immediately without loading heavy dependencies
3. **Port Management**: Automatically frees port 8000 if already in use
4. **Background Mode**: Service runs in background window for better UX

## Service Endpoints

- **Health Check**: http://localhost:8000/health
- **Forensics Analysis**: http://localhost:8000/api/forensics/analyze
- **Transaction Validation**: http://localhost:8000/api/forensics/validate

## Stopping the Service

### If running in background:
- Close the "Secure UPI ML Service" window, OR
- Run: `taskkill /FI "WINDOWTITLE eq Secure UPI ML Service*" /F`

### Using PowerShell:
```powershell
Get-Process | Where-Object {$_.MainWindowTitle -like "*ML Service*"} | Stop-Process
```

## Troubleshooting

### Port 8000 Already in Use
The startup scripts automatically handle this, but if you need to manually free it:
```batch
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### Service Not Starting
1. Check Python 3.11 is installed: `py -3.11 --version`
2. Verify dependencies: `pip install -r ml-service/requirements.txt`
3. Check the service window for error messages

### Service Starts But Health Check Fails
- Wait a few more seconds (service may still be initializing)
- Check firewall isn't blocking port 8000
- Verify no other service is using port 8000

## Performance Notes

- **Startup Time**: ~3-5 seconds (down from 15-30 seconds)
- **Core Features**: Available immediately (forensics, validation)
- **Advanced Features**: Load on-demand (TensorFlow CNN models)

