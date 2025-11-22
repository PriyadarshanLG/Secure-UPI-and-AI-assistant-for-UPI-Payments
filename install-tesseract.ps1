# Install Tesseract OCR for Real Text Extraction
# This script helps install Tesseract OCR on Windows

Write-Host "`n🔍 TESSERACT OCR INSTALLATION HELPER`n" -ForegroundColor Cyan

# Check if Tesseract is already installed
Write-Host "Checking if Tesseract is already installed..." -ForegroundColor Yellow
try {
    $tesseractVersion = & tesseract --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tesseract is already installed!" -ForegroundColor Green
        Write-Host $tesseractVersion -ForegroundColor White
        $alreadyInstalled = $true
    } else {
        $alreadyInstalled = $false
    }
} catch {
    $alreadyInstalled = $false
}

if (-not $alreadyInstalled) {
    Write-Host "`n❌ Tesseract OCR is NOT installed.`n" -ForegroundColor Red
    Write-Host "📥 INSTALLATION OPTIONS:`n" -ForegroundColor Cyan
    
    Write-Host "Option 1: Download and Install Manually (Recommended)" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor White
    Write-Host "  2. Run the installer" -ForegroundColor White
    Write-Host "  3. Make sure to check 'Add to PATH' during installation`n" -ForegroundColor White
    
    Write-Host "Option 2: Use Chocolatey (if you have it installed)" -ForegroundColor Yellow
    Write-Host "  choco install tesseract`n" -ForegroundColor White
    
    Write-Host "Option 3: Use Winget (Windows 10/11)" -ForegroundColor Yellow
    Write-Host "  winget install --id UB-Mannheim.TesseractOCR`n" -ForegroundColor White
    
    # Try winget if available
    Write-Host "Attempting to install via Winget..." -ForegroundColor Cyan
    try {
        winget install --id UB-Mannheim.TesseractOCR --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Tesseract installed via Winget!" -ForegroundColor Green
            $alreadyInstalled = $true
        }
    } catch {
        Write-Host "⚠️  Winget not available or installation failed. Please install manually.`n" -ForegroundColor Yellow
    }
}

# Check Python and install pytesseract
Write-Host "`n📦 Installing Python package: pytesseract" -ForegroundColor Cyan
try {
    python --version | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Python found. Installing pytesseract..." -ForegroundColor Yellow
        cd ml-service
        pip install pytesseract
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ pytesseract installed successfully!`n" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install pytesseract. Try: pip install pytesseract`n" -ForegroundColor Red
        }
        cd ..
    } else {
        Write-Host "❌ Python not found. Please install Python first.`n" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Python not found. Please install Python first.`n" -ForegroundColor Red
}

# Verify installation
Write-Host "`n🔍 Verifying installation..." -ForegroundColor Cyan
try {
    python -c "import pytesseract; print('✅ pytesseract imported successfully')" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python package is ready!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ pytesseract import failed.`n" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Could not verify pytesseract.`n" -ForegroundColor Red
}

# Check Tesseract again
Write-Host "`n🔍 Final Tesseract check..." -ForegroundColor Cyan
try {
    $tesseractVersion = & tesseract --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tesseract OCR is ready!" -ForegroundColor Green
        Write-Host $tesseractVersion -ForegroundColor White
        Write-Host "`n✅ INSTALLATION COMPLETE!`n" -ForegroundColor Green
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Restart ML service: .\start-ml-service.bat" -ForegroundColor White
        Write-Host "  2. Restart backend server" -ForegroundColor White
        Write-Host "  3. Test with an Instagram screenshot`n" -ForegroundColor White
    } else {
        Write-Host "❌ Tesseract still not found in PATH." -ForegroundColor Red
        Write-Host "   Please restart your terminal or add Tesseract to PATH manually.`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Tesseract not found. Please install it manually.`n" -ForegroundColor Red
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")




