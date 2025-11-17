# Python 3.14 Compatibility Notes

## Issue
Python 3.14 is very new and some packages don't have pre-built wheels yet, requiring a C compiler to build from source.

## Installed Packages ✅
- ✅ **opencv-python-headless** (4.12.0) - Image/video processing
- ✅ **librosa** (0.11.0) - Voice analysis
- ✅ **soundfile** (0.13.1) - Audio I/O
- ✅ **lazy-loader** - Required by librosa
- ✅ **imageio** - Image/video I/O
- ✅ **pydub** - Audio conversion

## Packages That Need C Compiler ⚠️
These packages don't support Python 3.14 yet or require building from source:
- ⚠️ **numba** - Required by librosa for some features (but librosa can work without it)
- ⚠️ **scikit-image** - Advanced image processing
- ⚠️ **tensorflow** - Deep learning models

## Current Status
The ML service will work with **reduced functionality**:
- ✅ Image forensics (basic) - Works
- ✅ Voice detection - Works (may be slower without numba)
- ✅ Deepfake detection (basic) - Works
- ⚠️ Advanced image analysis - Limited (scikit-image missing)
- ⚠️ CNN models - Disabled (tensorflow missing)

## Solution Options

### Option 1: Use Python 3.11 or 3.12 (Recommended)
Install Python 3.11 or 3.12 for full package compatibility:
1. Download from https://www.python.org/downloads/
2. Install alongside Python 3.14
3. Use: `py -3.11 -m pip install -r requirements.txt`

### Option 2: Install Visual Studio Build Tools
For building packages from source:
1. Download: https://visualstudio.microsoft.com/downloads/
2. Install "C++ build tools" workload
3. Then: `py -m pip install numba scikit-image tensorflow`

### Option 3: Continue with Current Setup
The service works with current packages, just with reduced functionality.

## Test Current Installation
```bash
py -c "import cv2, librosa, soundfile; print('Core packages work!')"
```

## Restart ML Service
After installation, restart:
```bash
start-ml-service.bat
```

The service should now start without warnings for OpenCV and librosa!




