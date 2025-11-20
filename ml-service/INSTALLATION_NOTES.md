# ML Service Installation & Setup Guide

## Overview

The ML Service is a FastAPI-based Python service that provides:
- **Image Forensics**: 8 algorithms for detecting edited/fake transaction screenshots
- **Deepfake Detection**: AI-powered detection for manipulated images and videos
- **Voice Analysis**: Synthetic/manipulated audio detection and transcription
- **UPI Validation**: Transaction ID, UPI ID, and amount validation

## Prerequisites

- **Python 3.11 or 3.12** (Recommended)
- **pip** package manager
- **Visual Studio Build Tools** (Windows only, for compiling C extensions)

## Python Version Compatibility

**IMPORTANT:** Python 3.14 is very new and many packages don't have pre-built wheels yet. This requires building from source, which needs a C compiler.

### Recommended Approach:

**✅ Option 1: Use Python 3.11 or 3.12 (Strongly Recommended)**
- Download Python 3.11.x or 3.12.x from https://www.python.org/downloads/
- All required packages have stable, pre-built wheels for these versions
- Full support for OpenCV, TensorFlow, Librosa, and all dependencies
- No compilation required

**⚠️ Option 2: Use Python 3.14 (Not Recommended)**
- Requires Microsoft Visual Studio Build Tools (C++ compiler)
- Some packages may not be available or may fail to build
- Limited support for TensorFlow and other ML libraries
- OpenCV may require manual compilation

**🛠️ Option 3: Install Visual Studio Build Tools (Windows)**
- Download "Build Tools for Visual Studio" from Microsoft
- Install the "Desktop development with C++" workload
- Restart your system after installation
- This allows building packages from source

## Installation Methods

### Method 1: Using Windows Batch Script (Easiest)

For Windows users, use the provided setup script:

```bash
# From the project root directory
setup-ml-service.bat
```

This will:
1. Check that Python **3.11.x** is available (falls back to python/python3 only if they point to 3.11)
2. Create a virtual environment (optional)
3. Install all dependencies
4. Verify installation

### Method 2: Manual Installation (Python 3.11/3.12)

**Step 1: Navigate to ml-service directory**
```bash
cd ml-service
```

**Step 2: (Optional) Create virtual environment**
```bash
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on Linux/Mac
source venv/bin/activate
```

**Step 3: Install dependencies**
```bash
pip install -r requirements.txt
```

This will install:
- FastAPI & Uvicorn (API server)
- OpenCV (image processing)
- NumPy, SciPy (numerical computing)
- Pillow (image handling)
- Librosa, SoundFile (audio processing)
- MediaPipe (deepfake detection)
- scikit-image (image forensics)
- And more...

### Method 3: Minimal Installation (Python 3.14 or Limited Environment)

If you must use Python 3.14 or have limited resources, install core packages only:

```bash
cd ml-service

# Core API dependencies
pip install fastapi uvicorn[standard] pydantic python-multipart

# Image processing (choose one)
pip install opencv-python-headless  # Recommended for servers
# OR
pip install opencv-python  # If you need GUI support

# Basic dependencies
pip install pillow numpy scipy imageio matplotlib

# Audio processing
pip install librosa soundfile pydub

# Optional AI libraries (may not work on Python 3.14)
pip install scikit-image  # For advanced image forensics
pip install tensorflow    # For deepfake detection (requires Python ≤3.11)
pip install mediapipe     # For face detection
```

**Note**: With minimal installation, some features may be disabled:
- Deepfake detection (requires TensorFlow/MediaPipe)
- Advanced image forensics (requires scikit-image)
- The service will still work but with reduced functionality

## Verification & Testing

### Step 1: Start the ML Service

```bash
cd ml-service

# Windows (forces the Python launcher to use 3.11.x)
py -3.11 main.py

# macOS/Linux or if a 3.11 virtualenv is activated
python main.py
```

> **Tip:** If `py -3.11` fails, reinstall Python 3.11.x and ensure it is registered with the Windows Python Launcher (`py -0p` should list it). For non-Windows environments, activate the virtual environment that was created with Python 3.11 before running `python main.py`.

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Check Health Endpoint

Open in browser or use curl:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "dependencies": {
    "opencv": "available",
    "tensorflow": "available",
    "librosa": "available",
    "scikit-image": "available"
  }
}
```

### Step 3: Test API Documentation

Visit: http://localhost:8000/docs

You should see the interactive Swagger UI with all available endpoints.

## Available Endpoints

Once running, the ML service provides:

- `GET /health` - Service health check
- `POST /analyze` - Analyze transaction screenshot (image forensics + UPI validation)
- `POST /deepfake/analyze` - Detect deepfake in images/videos
- `POST /voice/analyze` - Analyze audio for synthetic voice detection
- `POST /voice/transcribe` - Transcribe audio and detect fraud patterns
- `GET /docs` - API documentation (Swagger UI)

## Troubleshooting

### OpenCV Installation Issues

If OpenCV fails to install:

```bash
# Try headless version first
pip install opencv-python-headless

# If that fails, try building from conda
conda install -c conda-forge opencv

# Or use pre-built wheel
pip install opencv-contrib-python
```

See [../INSTALL_OPENCV.md](../INSTALL_OPENCV.md) for detailed OpenCV troubleshooting.

### TensorFlow Installation Issues

TensorFlow requires Python ≤ 3.11:

```bash
# Check your Python version
python --version

# If using Python 3.12+, TensorFlow may not be available
# Use Python 3.11 instead or disable deepfake detection
```

### Librosa/Audio Processing Issues

For audio processing dependencies:

```bash
# Install audio libraries separately
pip install librosa==0.10.1
pip install soundfile
pip install pydub

# On Windows, may need ffmpeg
# Download from: https://ffmpeg.org/download.html
```

### Port Already in Use

If port 8000 is in use:

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID [PID_NUMBER] /F

# Linux/Mac
lsof -i :8000
kill -9 [PID]

# Or change port in main.py
uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Import Errors

If you get import errors:

```bash
# Verify installation
pip list | grep opencv
pip list | grep tensorflow
pip list | grep librosa

# Reinstall problematic package
pip uninstall [package-name]
pip install [package-name]

# Check Python path
python -c "import sys; print(sys.path)"
```

## Configuration

### Environment Variables

Create a `.env` file in the `ml-service/` directory:

```env
# Server Configuration
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=info

# Feature Flags
ENABLE_DEEPFAKE_DETECTION=true
ENABLE_VOICE_ANALYSIS=true
ENABLE_IMAGE_FORENSICS=true

# Model Paths (optional)
MODEL_PATH=./models
DEEPFAKE_MODEL_PATH=./models/deepfake
VOICE_MODEL_PATH=./models/voice

# Processing Limits
MAX_FILE_SIZE=104857600  # 100MB
MAX_VIDEO_DURATION=300   # 5 minutes
MAX_AUDIO_DURATION=600   # 10 minutes
```

## Docker Installation

For containerized deployment:

```bash
# Build Docker image
docker build -t secure-upi-ml:latest .

# Run container
docker run -p 8000:8000 secure-upi-ml:latest

# With environment variables
docker run -p 8000:8000 -e ENABLE_DEEPFAKE_DETECTION=true secure-upi-ml:latest
```

## Performance Optimization

### For Production:

1. **Use Gunicorn with Uvicorn workers**:
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

2. **Enable GPU acceleration** (if available):
```bash
# Install CUDA-enabled TensorFlow
pip install tensorflow-gpu
```

3. **Optimize OpenCV**:
```bash
# Use headless version for servers
pip uninstall opencv-python
pip install opencv-python-headless
```

## Additional Resources

- Main README: [../README.md](../README.md)
- Setup Guide: [../SETUP_ML_SERVICE.md](../SETUP_ML_SERVICE.md)
- Quick Start: [../QUICK_START_ML_SERVICE.md](../QUICK_START_ML_SERVICE.md)
- OpenCV Guide: [../INSTALL_OPENCV.md](../INSTALL_OPENCV.md)
- Python Compatibility: [../PYTHON_3.14_COMPATIBILITY.md](../PYTHON_3.14_COMPATIBILITY.md)

## Support

For issues specific to ML service installation:
1. Check the [Troubleshooting Guide](../TROUBLESHOOTING.md)
2. Review error logs in the console
3. Verify Python version compatibility
4. Ensure all dependencies are installed
5. Open an issue on GitHub with detailed error messages






