# Python Installation Guide for Windows

## 🔴 Problem

```
Python was not found; run without arguments to install from the Microsoft Store
```

This means Python is either:
1. Not installed on your system
2. Installed but not in your PATH

---

## ✅ Solution Options

### **Option 1: Install Python from Microsoft Store (Easiest)**

1. **Press Windows Key**
2. **Type**: `Microsoft Store`
3. **Search for**: `Python 3.11` or `Python 3.12`
4. **Click**: Install
5. **Wait** for installation to complete
6. **Restart** your terminal (close and reopen PowerShell)

**Test:**
```powershell
python --version
```

Should show: `Python 3.11.x` or `Python 3.12.x`

---

### **Option 2: Install from Python.org (Recommended)**

1. **Visit**: https://www.python.org/downloads/
2. **Download**: Python 3.11.9 or 3.12.x (latest stable)
3. **Run** the installer
4. ⚠️ **IMPORTANT**: Check "Add Python to PATH" during installation!
5. Click "Install Now"
6. **Restart** your computer (to apply PATH changes)

**Verify Installation:**
```powershell
python --version
pip --version
```

---

### **Option 3: Check if Python is Already Installed**

Python might be installed but not in PATH. Try these commands:

```powershell
# Try py launcher (Windows-specific)
py --version

# Try python3
python3 --version

# Check if Python is installed anywhere
where python
```

If `py` works, use `py` instead of `python`:

```powershell
# Instead of: python main.py
# Use:
py main.py
```

---

## 🚀 After Installing Python

### Step 1: Verify Installation

```powershell
python --version
pip --version
```

Should show:
```
Python 3.11.9 (or 3.12.x)
pip 24.0 (or similar)
```

---

### Step 2: Install ML Service Dependencies

```powershell
cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI\ml-service"

# Install dependencies
pip install -r requirements.txt
```

This will install:
- FastAPI
- Uvicorn
- Pillow
- NumPy
- And other dependencies

---

### Step 3: Start ML Service

```powershell
cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI\ml-service"
python main.py
```

Should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🔧 Alternative: Use the Setup Script

If Python is installed, use the provided setup script:

```powershell
cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI"

# Double-click or run:
.\setup-ml-service.bat
```

---

## 🆘 Troubleshooting

### Issue 1: "Python was not found" after installation

**Cause**: PATH not updated

**Solution**:
1. Close ALL PowerShell/Terminal windows
2. Open a NEW PowerShell window
3. Try again

If still not working:
1. Restart your computer
2. Try again

---

### Issue 2: "pip is not recognized"

**Solution**:
```powershell
# Try using python -m pip instead
python -m pip install -r requirements.txt
```

---

### Issue 3: Permission denied during installation

**Solution**:
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Try installation again

---

### Issue 4: Multiple Python versions installed

**Check what's installed:**
```powershell
py -0
```

**Use specific version:**
```powershell
# Use Python 3.11
py -3.11 main.py

# Use Python 3.12
py -3.12 main.py
```

---

## 📋 Quick Start Checklist

- [ ] Python installed (3.11 or 3.12 recommended)
- [ ] Python added to PATH
- [ ] Terminal restarted (or computer restarted)
- [ ] `python --version` works
- [ ] `pip --version` works
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] ML service starts: `python main.py`

---

## 🎯 Recommended: Python 3.11 or 3.12

**Don't use:**
- ❌ Python 3.14 (too new, limited package support)
- ❌ Python 3.7 or older (outdated)

**Best choices:**
- ✅ Python 3.11.9 (stable, well-supported)
- ✅ Python 3.12.x (newer, also well-supported)

---

## 💡 Pro Tips

### Use Virtual Environment (Optional but Recommended)

```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run ML service
python main.py
```

### Check Installation Paths

```powershell
# Where is Python installed?
where python

# Check Python path
python -c "import sys; print(sys.executable)"
```

---

## 📞 Next Steps After Python Install

1. ✅ **Install Python** (Option 1 or 2 above)
2. ✅ **Restart terminal** (close and reopen PowerShell)
3. ✅ **Verify**: `python --version`
4. ✅ **Install dependencies**: `pip install -r requirements.txt`
5. ✅ **Start ML service**: `python main.py`
6. ✅ **Test with your screenshot** - should now show correct results!

---

**Once Python is installed and ML service is running, your threshold fixes will take effect and genuine screenshots will pass!** ✅


