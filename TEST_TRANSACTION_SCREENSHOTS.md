# Testing Guide: Transaction Screenshot Detection 🧪

## Overview
This guide helps you test the fixed transaction screenshot detection to verify that:
- ✅ **Real transaction screenshots** are marked as **ORIGINAL** (not edited)
- ✅ **Edited screenshots** are still detected as **EDITED**
- ✅ **Fake transaction data** is still flagged as **FRAUD**

---

## Step 1: Restart ML Service

### **Option A: Using Batch File (Easiest)**
```bash
.\RESTART_ML_SERVICE.bat
```

### **Option B: Manual Restart**
```bash
# Stop current ML service (Ctrl+C if running)

# Start ML service
cd ml-service
python main.py
```

**Wait for:** `✓ Application startup complete`

---

## Step 2: Prepare Test Images

### **Test Case 1: Real Transaction Screenshot** ✅
- Take a **genuine screenshot** from PhonePe/Paytm/GPay on your phone
- Transfer to your computer
- **DO NOT EDIT** the image

### **Test Case 2: Edited Screenshot** ❌
- Take the same real screenshot
- Open in **Paint** or **Photoshop**
- **Change the amount** (e.g., ₹500 → ₹5000)
- **Save** the edited version

### **Test Case 3: Fake Transaction Data** ❌
- Take a real screenshot
- Or create a fake one with:
  - UPI ID: `test@paytm` or `fake@phonepe`
  - Reference ID: `123456789012` (sequential/repeated digits)
  - Amount: ₹99,999 (suspiciously high)

---

## Step 3: Test via Frontend

### **Upload Test Case 1 (Real Screenshot)**

1. **Open Secure UPI frontend** in browser
2. **Go to:** Evidence Upload or Transaction Analysis page
3. **Upload** the real screenshot
4. **Fill transaction details** (if required):
   - UPI ID: Real ID (e.g., `john.doe@paytm`)
   - Amount: Actual amount (e.g., ₹500)
   - Reference ID: 12 digit number (not sequential)

**Expected Result:**
```
✅ [ANALYSIS_COMPLETE]

[IMAGE_IS_ORIGINAL]
Confidence: 85% or higher
Edit Detection: None

Indicators:
- Transaction screenshot detected - No manipulation indicators
- No editing indicators detected

Verdict: CLEAN or ORIGINAL
Fraud Detected: FALSE
```

**Key Checks:**
- [ ] `is_edited` = `false`
- [ ] `edit_confidence` < 30%
- [ ] `edit_indicators` mentions "screenshot" or "original"
- [ ] No "unnatural frequency patterns" error
- [ ] No "missing EXIF metadata" error
- [ ] No "inconsistent noise levels" error

---

### **Upload Test Case 2 (Edited Screenshot)**

1. **Upload** the edited screenshot (with changed amount)
2. **Fill transaction details** with the **ORIGINAL** values (not the edited ones)

**Expected Result:**
```
⚠️ [ANALYSIS_COMPLETE]

[IMAGE_IS_EDITED] or [IMAGE_SUSPICIOUS]
Confidence: 60-95%
Edit Detection: Possible or Detected

Indicators:
- High compression artifacts detected
- Unusual patterns detected
- Possible manipulation

Verdict: SUSPICIOUS or TAMPERED
Fraud Detected: TRUE (if data mismatch detected)
```

**Key Checks:**
- [ ] `is_edited` = `true` (if heavily edited)
- [ ] `edit_confidence` > 50%
- [ ] Edit indicators mention specific artifacts
- [ ] OR `fraud_detected` = `true` (if OCR mismatches transaction data)

---

### **Upload Test Case 3 (Fake Transaction Data)**

1. **Upload** screenshot with fake transaction data
2. **Fill transaction details:**
   - UPI ID: `test@paytm`
   - Amount: ₹99,999
   - Reference ID: `123456789012`

**Expected Result:**
```
❌ [FRAUD_DETECTED]

Transaction Validation:
- Fake UPI ID detected: Contains 'test' keyword
- FAKE reference - Pattern detected: 123456789012
- Suspiciously high amount: 99999

Verdict: TAMPERED or FRAUD
Fraud Detected: TRUE
Confidence: 85%+
```

**Key Checks:**
- [ ] `fraud_detected` = `true`
- [ ] `fraud_indicators` lists specific issues (fake UPI, fake ref ID, high amount)
- [ ] `verdict` = "tampered" or "fraud"
- [ ] Image edit detection is secondary (may or may not flag image as edited)

---

## Step 4: Check ML Service Logs

### **For Real Screenshot (Test Case 1):**
```
INFO: 📱 Screenshot detected: No camera metadata + non-camera aspect ratio, HD resolution - Using lenient edit detection
INFO: ELA score: 28.5 (below screenshot threshold of 50)
INFO: Sharp edge ratio: 0.12 (below screenshot threshold of 0.25)
INFO: Frequency variance: 10x mean (below screenshot threshold of 15x)
INFO: Edit score: 45 (below screenshot threshold of 100)
INFO: 📱 Screenshot with low edit score (45.0) - Treating as ORIGINAL
INFO: ✅ ORIGINAL IMAGE - confidence: 0.85, no editing detected
```

### **For Edited Screenshot (Test Case 2):**
```
INFO: 📱 Screenshot detected: No camera metadata + non-camera aspect ratio - Using lenient edit detection
INFO: ELA score: 65.2 (ABOVE screenshot threshold of 50)
INFO: Edit score: 115 (ABOVE screenshot threshold of 100)
INFO: ✅ EDIT DETECTED - confidence: 0.88, score: 115.0, indicators: 3
INFO: Edit indicators: High compression artifacts detected (ELA: 65.20)
```

### **For Fake Transaction Data (Test Case 3):**
```
INFO: Transaction validation: Fake UPI ID detected
INFO: Transaction validation: Suspicious reference ID pattern
INFO: FRAUD DETECTED - transaction data indicates fraud
INFO: Fraud indicators: ['Fake UPI ID detected', 'FAKE reference - Pattern detected']
```

---

## Step 5: API Testing (Advanced)

### **Test via curl/Postman:**

```bash
# Login first to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Save the token
TOKEN="<your_token_here>"

# Test real screenshot (base64 encoded)
curl -X POST http://localhost:8000/api/forensics/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,<BASE64_STRING>",
    "format": "base64",
    "manualData": {
      "upiId": "john.doe@paytm",
      "amount": "500",
      "referenceId": "431289765043"
    }
  }'
```

### **Expected API Response for Real Screenshot:**

```json
{
  "ocrText": "PhonePe\nPaid to John Doe\n₹500\nRef: 431289765043",
  "forgeryScore": 15.5,
  "verdict": "clean",
  "confidence": 0.88,
  "transactionValidation": {
    "fraud_detected": false,
    "overall_risk_score": 10
  },
  "extractedData": {
    "upi_id": "john.doe@paytm",
    "amount": "500",
    "reference_id": "431289765043"
  },
  "fraudDetected": false,
  "fraudIndicators": ["No fraud indicators detected"],
  "isEdited": false,
  "editConfidence": 0.15,
  "editIndicators": [
    "Transaction screenshot detected - No manipulation indicators"
  ]
}
```

---

## Expected Results Summary

| Test Case | `isEdited` | `editConfidence` | `fraudDetected` | `verdict` |
|-----------|-----------|------------------|-----------------|-----------|
| **Real Screenshot** | `false` | < 30% | `false` | `clean` |
| **Edited Screenshot** | `true` | > 60% | `false`* | `suspicious` |
| **Fake Transaction** | `false`** | < 40% | `true` | `tampered` |

*May be `true` if OCR detects data mismatch  
**Image may be genuine, but transaction data is fake

---

## Troubleshooting

### ❌ **Issue: Real screenshot still marked as "EDITED"**

**Check:**
1. ML service restarted after fix?
2. Logs show "📱 Screenshot detected"?
3. Edit score below 80?

**Solution:**
- Restart ML service: `.\RESTART_ML_SERVICE.bat`
- Check `ml-service/main.py` has the latest changes
- Verify screenshot resolution is HD (1080p+)

---

### ❌ **Issue: Edited screenshot NOT detected**

**Check:**
1. How heavily edited? (Minor edits may not trigger detection)
2. Was editing done in a photo editor? (Paint.NET, Photoshop)
3. Check edit score in logs

**Expected Behavior:**
- **Heavy edits** (changing amounts, names) → Edit score 100+, detected
- **Minor edits** (small color tweaks) → Edit score 50-80, may not be detected
- **Transaction data validation** → Should catch discrepancies even if image not flagged

---

### ❌ **Issue: API returns 500 error**

**Check:**
1. ML service running? (`http://localhost:8000/health`)
2. Base64 image encoded correctly?
3. Check ML service logs for Python errors

**Solution:**
```bash
# Check ML service health
curl http://localhost:8000/health

# If not running, restart
cd ml-service
python main.py
```

---

### ❌ **Issue: Frontend shows "ML Service unavailable"**

**Check:**
1. Backend connected to ML service? (Check `backend/.env`)
2. ML service port correct? (Default: 8000)
3. Firewall blocking connection?

**Solution:**
```env
# In backend/.env
ML_SERVICE_URL=http://localhost:8000
```

---

## Success Criteria

**Your fix is working correctly if:**

✅ **Real screenshots:**
- Marked as "ORIGINAL" with 80%+ confidence
- No "unnatural frequency" errors
- No "missing EXIF" errors
- Edit score < 50 in logs

✅ **Edited screenshots:**
- Marked as "EDITED" or "SUSPICIOUS" with 60%+ confidence
- Specific edit indicators listed
- Edit score > 80 in logs

✅ **Fake transactions:**
- Marked as "FRAUD" regardless of image quality
- Transaction validation catches fake UPI IDs, reference IDs, amounts
- Fraud indicators listed

---

## Report Issues

If any test case fails, document:

1. **Test Case:** Real/Edited/Fake screenshot
2. **Expected Result:** What should happen
3. **Actual Result:** What actually happened
4. **Screenshot:** Of the result
5. **Logs:** From ML service console

---

**Last Updated:** November 17, 2025  
**Related Files:**
- `TRANSACTION_SCREENSHOT_FIX.md` (detailed explanation)
- `QUICK_FIX_SCREENSHOT_DETECTION.md` (quick reference)
- `RESTART_ML_SERVICE.bat` (restart script)


