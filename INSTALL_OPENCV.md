# Installing OpenCV for Deepfake Detection

## Problem
You're seeing this warning:
```
WARNING:__main__:OpenCV (cv2) not available. Some image processing features will be disabled.
```

This means OpenCV is not installed, which is **required** for deepfake detection to work properly.

## Quick Fix

### Option 1: Use the Installation Script (Recommended)
1. Double-click `install-opencv.bat` in the project root
2. It will automatically install OpenCV and all dependencies

### Option 2: Manual Installation
1. Open Command Prompt or PowerShell
2. Navigate to the ml-service directory:
   ```bash
   cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI\ml-service"
   ```
3. Install OpenCV (use `python -m pip` if `pip` is not recognized):
   ```bash
   python -m pip install opencv-python
   ```
4. Install all dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```

**Note:** If you get "pip is not recognized", always use `python -m pip` instead of just `pip`.

### Option 3: Install All Dependencies at Once
```bash
cd ml-service
pip install -r requirements.txt
```

This will install:
- opencv-python (required for image/video processing)
- fastapi, uvicorn (web server)
- numpy, scipy (math operations)
- scikit-image (image analysis)
- imageio (video processing)
- And other dependencies

## Verify Installation

After installing, verify OpenCV is working:
```bash
python -c "import cv2; print(f'OpenCV version: {cv2.__version__}')"
```

You should see something like: `OpenCV version: 4.8.0`

## Restart ML Service

After installing OpenCV:
1. Stop the ML service (Ctrl+C if running)
2. Restart it with `start-ml-service.bat`
3. The warning should be gone

## Troubleshooting

### If pip is not recognized (COMMON ON WINDOWS):
**Always use `python -m pip` instead of just `pip`:**
```bash
python -m pip install opencv-python
```

This works even if `pip` is not in your PATH.

**If Python is not recognized:**
- Install Python from https://www.python.org/
- **IMPORTANT**: Check "Add Python to PATH" during installation
- Restart Command Prompt after installation

### If installation fails:
- Try: `pip install --upgrade pip`
- Then: `pip install opencv-python`
- For Windows, you might need Visual C++ Redistributable

### If you get permission errors:
- Use: `pip install --user opencv-python`
- Or run Command Prompt as Administrator

## What OpenCV Does

OpenCV (cv2) is used for:
- Face detection in images and videos
- Image processing and analysis
- Video frame extraction
- Edge detection
- Color space conversion

Without it, deepfake detection will have **limited functionality** or may not work at all.

