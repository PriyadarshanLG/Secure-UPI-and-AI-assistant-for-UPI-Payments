# Installing ML Service Dependencies

## Issue: Python 3.14 Compatibility

Some packages (like `scikit-image`) require a C compiler to build from source on Python 3.14, as pre-built wheels may not be available yet.

## Quick Fix: Install Essential Packages

Run these commands in order:

```bash
cd ml-service
py -m pip install opencv-python imageio librosa soundfile pydub --upgrade
```

## Optional Packages (Require C Compiler)

If you need `scikit-image` and `tensorflow`, you have two options:

### Option 1: Install Visual Studio Build Tools (Recommended)
1. Download Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
2. Install "C++ build tools" workload
3. Then run: `py -m pip install scikit-image tensorflow`

### Option 2: Use Pre-built Wheels (If Available)
```bash
py -m pip install scikit-image tensorflow --only-binary :all:
```

## Current Status

The ML service will work with these packages installed:
- ✅ opencv-python (for image/video processing)
- ✅ librosa + soundfile (for voice detection)
- ✅ pydub (for audio conversion)
- ✅ imageio (for image/video I/O)

Optional (for advanced features):
- ⚠️ scikit-image (requires C compiler)
- ⚠️ tensorflow (requires C compiler)

## Test Installation

After installing, verify:
```bash
py -c "import cv2, librosa, soundfile, imageio; print('All essential packages installed!')"
```

## Restart ML Service

After installation, restart the ML service:
```bash
start-ml-service.bat
```

The service will work with reduced functionality if scikit-image is missing, but core features (image forensics, voice detection) will work.




