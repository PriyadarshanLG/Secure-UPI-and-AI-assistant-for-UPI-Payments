# Install Tesseract OCR for Real Text Extraction

## Problem
The ML service was generating fake transaction data instead of extracting real text from Instagram screenshots. This is why followers/following were always 0.

## Solution
Added real OCR using pytesseract (Tesseract OCR engine).

## Installation Steps

### 1. Install Tesseract OCR Engine

**Windows:**
1. Download Tesseract installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Run the installer
3. During installation, make sure to check "Add to PATH" option
4. Default installation path: `C:\Program Files\Tesseract-OCR`

**Alternative (if above doesn't work):**
- Download from: https://github.com/tesseract-ocr/tesseract/wiki
- Install to: `C:\Program Files\Tesseract-OCR`
- Add to PATH manually:
  - Right-click "This PC" → Properties → Advanced system settings
  - Environment Variables → System Variables → Path → Edit
  - Add: `C:\Program Files\Tesseract-OCR`

### 2. Install Python Package

```bash
cd ml-service
pip install pytesseract
```

### 3. Verify Installation

```bash
python -c "import pytesseract; print(pytesseract.get_tesseract_version())"
```

If this works, Tesseract is installed correctly.

### 4. Restart ML Service

After installation, restart the ML service:
```bash
.\start-ml-service.bat
```

## How It Works

1. **Real OCR**: Uses Tesseract to extract actual text from images
2. **Image Preprocessing**: Converts to grayscale and applies thresholding for better accuracy
3. **Smart Detection**: Detects if image is social media screenshot (looks for "followers", "following", "@")
4. **Fallback**: If Tesseract not available, falls back to simulated OCR

## Testing

After installation, upload an Instagram screenshot. The system should:
- Extract real text from the screenshot
- Find followers and following numbers
- Show correct REAL/FAKE verdict

## Troubleshooting

**Error: "TesseractNotFoundError"**
- Tesseract not installed or not in PATH
- Reinstall Tesseract and add to PATH

**Error: "pytesseract not available"**
- Run: `pip install pytesseract`

**OCR not extracting text:**
- Check image quality (should be clear, high resolution)
- Check if image contains text
- Check ML service logs for OCR errors

---

**Note:** Without Tesseract, the system will fall back to simulated OCR (fake data), which won't extract real followers/following from screenshots.

