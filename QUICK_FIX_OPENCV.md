# Quick Fix: pip Not Recognized Error

## Problem
You see this error:
```
pip : The term 'pip' is not recognized
```

## ✅ Solution: Use `python -m pip` Instead

Instead of:
```bash
pip install opencv-python
```

Use:
```bash
python -m pip install opencv-python
```

## Quick Installation Steps

### Step 1: Open Command Prompt
Press `Win + R`, type `cmd`, press Enter

### Step 2: Navigate to ml-service
```bash
cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI\ml-service"
```

### Step 3: Install OpenCV
```bash
python -m pip install opencv-python
```

### Step 4: Install All Dependencies
```bash
python -m pip install -r requirements.txt
```

## Alternative: Use the Fixed Script

I've updated `install-opencv.bat` to use `python -m pip` automatically.

Just double-click `install-opencv.bat` - it will work even if `pip` is not in PATH.

## Why This Works

- `python -m pip` uses Python's built-in module system
- Works even if `pip` is not in your PATH
- More reliable on Windows

## Verify Installation

After installing, test:
```bash
python -c "import cv2; print('OpenCV installed! Version:', cv2.__version__)"
```

## If Python is Not Found

If you get "Python is not recognized":
1. Install Python from https://www.python.org/
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Restart Command Prompt after installation
4. Try again







