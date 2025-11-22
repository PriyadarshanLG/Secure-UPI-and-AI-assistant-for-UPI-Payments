# Quick Start Guide - Secure UPI

## Starting All Services

### Option 1: PowerShell (Recommended)
```powershell
# Start Backend Server
.\start-backend.bat

# Start ML Service (in a new terminal)
.\start-ml-service.bat

# Start Frontend (in a new terminal)
cd frontend
npm run dev
```

### Option 2: Command Prompt (CMD)
```cmd
# Start Backend Server
start-backend.bat

# Start ML Service (in a new terminal)
start-ml-service.bat

# Start Frontend (in a new terminal)
cd frontend
npm run dev
```

## Service URLs

- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:8000
- **Frontend**: http://localhost:5173 (or check terminal output)

## Troubleshooting

### Network Error
If you see "Network Error" when uploading:
1. **Check Backend**: Make sure backend is running on port 5000
   ```powershell
   netstat -ano | findstr :5000
   ```

2. **Check ML Service**: Make sure ML service is running on port 8000
   ```powershell
   netstat -ano | findstr :8000
   ```

3. **Start Missing Services**: Use the startup scripts above

### Validation Error
- Make sure you either upload a file OR enter manual transaction details
- Check that all required fields are filled if using manual mode

### Port Already in Use
If a port is already in use, the startup scripts will automatically free it.
If that doesn't work, manually kill the process:
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## All-in-One Startup (PowerShell)

Create a new PowerShell script to start everything:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\start-backend.bat"

# Wait a moment
Start-Sleep -Seconds 2

# Start ML Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\start-ml-service.bat"

# Wait a moment
Start-Sleep -Seconds 2

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

Write-Host "All services starting in separate windows..."
Write-Host "Backend: http://localhost:5000"
Write-Host "ML Service: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"
```

