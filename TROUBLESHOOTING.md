# 🔧 Troubleshooting Guide - Secure UPI

## ❌ Common Issue: "Upload Failed"

### Problem
When uploading images, you get errors like:
- "Upload failed"
- "500 Internal Server Error"  
- "Network Error"

### ✅ Solution Steps:

#### 1. **Check ML Service is Running**
```bash
# In ml-service terminal, you should see:
INFO:     Uvicorn running on http://0.0.0.0:8000

# Test it:
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"ml-service"}
```

**If ML service is NOT running:**
```bash
cd ml-service
python main.py
```

#### 2. **Check Backend is Running**
```bash
# In backend terminal, you should see:
info: Server running on port 5000
```

**If backend is NOT running:**
```bash
cd backend
npm run dev
```

#### 3. **Check Frontend is Running**
```bash
# In frontend terminal, you should see:
VITE v5.x.x ready in XXXms
➜ Local: http://localhost:5173/
```

**If frontend is NOT running:**
```bash
cd frontend
npm run dev
```

---

## ⚠️ Issue: "OpenCV (cv2) not available" Warning

### Problem
You see this warning when starting the ML service:
```
WARNING:__main__:OpenCV (cv2) not available. Some image processing features will be disabled.
```

**This means deepfake detection will NOT work properly!**

### ✅ Quick Fix

#### Option 1: Use Installation Script (Easiest)
1. Double-click `install-opencv.bat` in the project root
2. Wait for installation to complete
3. Restart the ML service

#### Option 2: Manual Installation
```bash
cd ml-service
pip install opencv-python
```

Or install all dependencies:
```bash
cd ml-service
pip install -r requirements.txt
```

#### Option 3: Using Python Module
```bash
python -m pip install opencv-python
```

### Verify Installation
After installing, test it:
```bash
python -c "import cv2; print(f'OpenCV version: {cv2.__version__}')"
```

You should see: `OpenCV version: 4.8.0` (or similar)

### After Installation
1. **Stop** the ML service (Ctrl+C)
2. **Restart** it with `start-ml-service.bat`
3. The warning should be **gone**

### Why OpenCV is Required
OpenCV is used for:
- ✅ Face detection in images and videos
- ✅ Video frame extraction
- ✅ Image processing and analysis
- ✅ Edge detection
- ✅ Color space conversion

**Without OpenCV, deepfake detection will fail or have very limited functionality.**

### Troubleshooting Installation

**If `pip` is not recognized:**
- Use: `python -m pip install opencv-python`
- Or install Python from https://www.python.org/ and add to PATH

**If you get permission errors:**
- Use: `pip install --user opencv-python`
- Or run Command Prompt as Administrator

**If installation fails:**
- Try: `pip install --upgrade pip` first
- Then: `pip install opencv-python`
- On Windows, you may need Visual C++ Redistributable

See `INSTALL_OPENCV.md` for detailed instructions.

---

## 🎭 Issue: Deepfake Detection Not Working

### Problem
- Deepfake detection returns errors
- "ML service unavailable" message
- Detection always returns "unknown" or fails

### ✅ Solution Steps

#### 1. **Check OpenCV is Installed** (Most Common Issue!)
```bash
python -c "import cv2; print('OpenCV OK')"
```

If you get an error, install OpenCV:
```bash
# Use the installation script
install-opencv.bat

# Or manually:
cd ml-service
pip install opencv-python
```

#### 2. **Check ML Service is Running**
```bash
curl http://localhost:8000/health
```

Should return: `{"status":"healthy","service":"ml-service"}`

#### 3. **Check ML Service Logs**
Look at the ML service terminal for errors:
- Missing dependencies
- Import errors
- Processing errors

#### 4. **Verify File Upload**
- Make sure you're uploading a valid image (JPG, PNG) or video (MP4)
- File size should be under 100MB
- Check browser console for upload errors

#### 5. **Test with Simple Image**
Try uploading a simple test image first to verify the service is working.

### Common Errors

**"ML service unavailable":**
- ML service is not running
- Start it: `cd ml-service && python main.py`

**"OpenCV not available":**
- Install OpenCV: `pip install opencv-python`
- See section above for details

**"Invalid image data":**
- File format not supported
- File may be corrupted
- Try a different image/video

**"Timeout error":**
- Video file too large
- Processing taking too long
- Try a smaller video or image

---

## 🚨 Issue: "AI Not Detecting Fake Transactions"

### Current Behavior
ML service randomly generates transaction data for OCR simulation.

### How It Works

The system detects fraud through:

1. **Image Forensics** (8 algorithms):
   - EXIF metadata analysis
   - Compression artifacts
   - Noise inconsistency
   - Edge detection anomalies
   - Color histogram analysis
   - Resolution checks
   - Screenshot detection
   - Statistical analysis

2. **Transaction Validation**:
   - **UPI ID**: Checks format, blacklisted IDs, suspicious patterns
   - **Transaction ID**: Validates UTR format, detects fake patterns
   - **Amount**: Checks for suspicious amounts
   - **Date**: Validates date logic

### Why You Might See Random Results

The ML service **simulates** OCR extraction with **random** transaction data because:
- Real OCR (Tesseract) is not installed
- This is for demonstration purposes
- It randomly picks from valid/suspicious patterns

### To Get Consistent Fraud Detection:

#### Option A: Use Manual Input (NEW FEATURE!)
1. Upload your image
2. Check the "Manually enter transaction details" checkbox
3. Enter the exact data from the screenshot:
   - UPI ID (e.g., `123456@paytm` for fake, `merchant5432@paytm` for valid)
   - Amount
   - Reference ID
   - Merchant Name
4. Click "Upload & Analyze"

#### Option B: Test with Known Fake Patterns

Upload any image and the system will randomly detect if it contains:

**FAKE UPI IDs** (will be flagged):
- `123456@paytm`
- `test@upi`
- `fake@paytm`
- Any numeric-only UPI ID

**FAKE Transaction IDs** (will be flagged):
- Less than 10 digits
- Sequential numbers (123456, 111111)
- Repeated patterns

**VALID Patterns** (will pass):
- `merchant5432@paytm`
- `vendor1234@phonepe`
- 12+ digit transaction IDs

---

## 🎯 Complete Working Example

### Step 1: Make Sure All Services Are Running

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Should show: `info: Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Should show: `Local: http://localhost:5173/`

**Terminal 3 - ML Service:**
```bash
cd ml-service
python main.py
```
✅ Should show: `Uvicorn running on http://0.0.0.0:8000`

### Step 2: Test the System

1. Open: http://localhost:5173
2. Login with: `admin@secureupi.com` / `admin123`
3. Go to "Upload Evidence"
4. Upload any transaction screenshot
5. Check "Manually enter transaction details"
6. Enter:
   - UPI ID: `123456@paytm` (this is blacklisted)
   - Amount: `5000`
   - Reference ID: `111111111` (too short)
7. Click "Upload & Analyze"

### Expected Result:

```
🚨 FRAUD DETECTED!

Fraud Indicators:
✗ Invalid UPI ID: 123456@paytm (blacklisted - known fraud)
✗ Transaction ID too short (typical: 12+ digits)
✗ Suspicious round amount

Overall Status: FRAUD_DETECTED
Recommendation: BLOCK TRANSACTION - Multiple fraud indicators detected
```

---

## 🐛 Other Common Issues

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill it
taskkill /F /PID <process-id>

# Or change port in backend/.env
PORT=5001
```

### Issue: MongoDB Connection Error

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solution**:
```bash
# Check if MongoDB is running
# Start it if not:
net start MongoDB

# Or use MongoDB Atlas and update MONGO_URI in backend/.env
```

### Issue: Python/pip Not Found

**Error**: `pip: command not found`

**Solution**:
```bash
# Use python -m pip instead
python -m pip install -r requirements.txt

# Or add Python to PATH and restart terminal
```

### Issue: Frontend Shows "Network Error"

**Check**:
1. Is backend running on port 5000?
2. Is CORS configured correctly?
3. Check browser console for errors

**Solution**:
```bash
# Verify backend is accessible
curl http://localhost:5000/healthz

# Check frontend .env
cat frontend/.env
# Should have: VITE_API_URL=http://localhost:5000/api
```

---

## 📊 How to Verify Everything Works

### Test 1: Health Checks
```bash
# Backend
curl http://localhost:5000/healthz
# Expected: {"status":"ok","timestamp":"..."}

# ML Service
curl http://localhost:8000/health
# Expected: {"status":"healthy","service":"ml-service"}
```

### Test 2: Upload Test
1. Go to http://localhost:5173/evidence/upload
2. Upload any image
3. Should see analysis results (even if random data)

### Test 3: Manual Entry Test
1. Upload any image
2. Enable "Manual entry"
3. Enter fake UPI: `test@fake`
4. Should detect as fraud

---

## 🏆 For Hackathon Demo

### Best Demo Strategy:

1. **Prepare 2-3 Screenshots**:
   - One obviously fake (edited in Paint)
   - One legitimate-looking
   - One with suspicious data

2. **Use Manual Input**:
   - For demo control, use manual input
   - Enter known fake patterns
   - Show the fraud detection live

3. **Highlight Features**:
   - Image forensics (8 algorithms)
   - Transaction validation
   - UPI ID verification
   - Real-time analysis
   - Clear fraud alerts

4. **Explain Limitations**:
   - OCR is simulated (would use Tesseract in production)
   - Demo uses pattern matching
   - Production would use trained ML models

---

## 🆘 Still Having Issues?

### Debug Mode:

**Check Backend Logs**:
```bash
# Look for errors in backend terminal
# Should show analysis results:
info: Analyzing image: /path/to/image
info: Analysis complete: verdict=tampered, forgery_score=...
```

**Check ML Service Logs**:
```bash
# Look for:
INFO: Forgery detection reasons: ...
INFO: Analysis complete: ...
```

**Check Browser Console**:
1. Press F12
2. Go to Console tab
3. Look for errors (red text)
4. Check Network tab for failed requests

---

## ✅ Checklist Before Demo

- [ ] All 3 services running (backend, frontend, ML)
- [ ] Can access http://localhost:5173
- [ ] Can login with admin credentials
- [ ] Upload works (even with random data)
- [ ] Manual input checkbox appears
- [ ] Test upload shows results
- [ ] Fraud detection shows red alert for fake data
- [ ] Valid data shows green/clean result

---

## 💡 Pro Tips

1. **Keep all terminals visible** during demo
2. **Use manual input** for consistent results
3. **Prepare screenshots** beforehand
4. **Test the full flow** multiple times
5. **Have backup data** ready to type in

---

Need more help? Check:
- README.md - Full documentation
- STATUS.md - Current setup status
- HACKATHON_FEATURES.md - All features list





