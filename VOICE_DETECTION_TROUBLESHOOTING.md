# Voice Detection Troubleshooting Guide

## Current Status ✅
- ✅ ML Service is running on port 8000
- ✅ librosa is installed (version 0.11.0)
- ✅ Backend should be able to connect

## Common Issues & Solutions

### Issue 1: "Voice deepfake detection failed" Error

**Possible Causes:**
1. Audio file format not supported
2. Audio file corrupted
3. Audio file too large
4. ML service processing timeout
5. Backend can't connect to ML service

**Solutions:**

#### Check Backend Connection
```powershell
# Test if backend can reach ML service
Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing
```

#### Check Audio File
- **Format**: MP3, WAV, M4A, FLAC, OGG, AAC
- **Size**: Should be < 50MB
- **Duration**: Should be < 60 seconds (longer files are truncated)
- **Quality**: Should not be corrupted

#### Check Backend Logs
Look for errors in the backend console when uploading audio:
- Connection errors
- Timeout errors
- Audio processing errors

#### Restart Services
```powershell
# Stop both services (Ctrl+C in their windows)
# Then restart:
.\start-backend.bat
.\start-ml-service.bat
```

### Issue 2: "ML service unavailable" Error

**Solution:**
1. Check ML service is running: `http://localhost:8000/health`
2. If not running, start it: `.\start-ml-service.bat`
3. Wait for it to fully start (check health endpoint)

### Issue 3: "librosa not available" Error

**Solution:**
```powershell
cd ml-service
pip install librosa soundfile
# Restart ML service
```

### Issue 4: Audio Processing Timeout

**Solution:**
- Reduce audio file size
- Use shorter audio clips (< 30 seconds)
- Check ML service logs for processing errors

## Testing Voice Detection

### Test with Sample Audio
1. Use a valid audio file (MP3 or WAV)
2. File size should be < 10MB
3. Duration should be < 60 seconds
4. Upload and click "DETECT_AI_VOICE_&_SPAM"

### Expected Behavior
- **Real Voice**: Should show `REAL` verdict with low deepfake score
- **AI Voice**: Should show `DEEPFAKE` or `SUSPICIOUS` with higher score
- **Spam Call**: Should show `SPAM` verdict

## Debug Steps

1. **Check ML Service Health**
   ```powershell
   Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing
   ```
   Should return: `{"status":"healthy","dependencies":{"librosa":true}}`

2. **Check Backend is Running**
   ```powershell
   netstat -ano | findstr ":5000" | findstr LISTENING
   ```

3. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

4. **Check Backend Logs**
   - Look for error messages when uploading audio
   - Check for connection errors to ML service

5. **Test Audio File**
   - Try a different audio file
   - Try a smaller file
   - Try a WAV file (most compatible)

## Error Messages Explained

- **"Network Error"**: Backend server not running
- **"ML service unavailable"**: ML service not running or can't connect
- **"librosa not available"**: librosa not installed in ML service
- **"Invalid audio file"**: File format not supported or corrupted
- **"Request timeout"**: Audio file too large or ML service too slow

## Quick Fix Checklist

- [ ] Backend server running on port 5000
- [ ] ML service running on port 8000
- [ ] librosa installed: `pip install librosa soundfile`
- [ ] Audio file is valid format (MP3, WAV, etc.)
- [ ] Audio file size < 50MB
- [ ] Audio file duration < 60 seconds
- [ ] No firewall blocking connections
- [ ] Check browser console for errors
- [ ] Check backend logs for errors

## Still Not Working?

1. **Restart Everything**
   ```powershell
   # Stop all services
   # Then start in order:
   .\start-backend.bat
   .\start-ml-service.bat
   ```

2. **Check Logs**
   - Backend console output
   - ML service console output
   - Browser console (F12)

3. **Test with Simple Audio**
   - Use a short WAV file (< 5 seconds)
   - Test if basic detection works

4. **Reinstall Dependencies**
   ```powershell
   cd ml-service
   pip uninstall librosa soundfile
   pip install librosa soundfile
   ```

---

**If you're still getting errors, check the browser console (F12) and backend logs for specific error messages.**

