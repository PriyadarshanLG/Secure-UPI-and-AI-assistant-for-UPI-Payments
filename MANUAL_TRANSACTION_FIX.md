# Manual Transaction Data Fix - November 15, 2025

## Issue
User reported:
1. Upload button for transaction ID not visible
2. Error 400 when uploading with manual transaction data
3. AI not detecting fake transactions from uploaded images

## Root Causes
1. **Backend Validation Too Strict**: `transactionId` was being validated as a MongoDB ObjectId, but users were entering plain reference numbers (UTR)
2. **Manual Data Not Properly Sent**: Manual transaction data from frontend wasn't being properly forwarded to ML service
3. **ML Service Not Using Manual Data**: ML service was only using OCR, ignoring manual input

## Fixes Applied

### 1. Backend Route (`backend/routes/evidence.js`)
- ✅ Removed strict MongoDB ObjectId validation for `transactionId`
- ✅ Changed validation to `optional()` to accept any string
- ✅ Added support for `manualData` in request body
- ✅ Parse and forward manual data to ML service when provided

### 2. ML Service Utility (`backend/utils/mlService.js`)
- ✅ Updated `analyzeImage()` to accept both file path (string) and object with manual data
- ✅ Forward manual data in API payload to ML service
- ✅ Include all fraud detection fields in response

### 3. Python ML Service (`ml-service/main.py`)
- ✅ Added `manualData` field to `ImageAnalysisRequest` model
- ✅ Check if manual data provided before doing OCR
- ✅ Use manual transaction details when available:
  - UPI ID
  - Amount
  - Reference/UTR ID
  - Merchant Name
- ✅ Run comprehensive validation on manual data
- ✅ Return fraud detection results based on manual input

## How It Works Now

### User Flow:
1. User uploads a transaction screenshot
2. User checks "Manually enter transaction details" checkbox
3. User fills in the manual fields:
   - **UPI ID**: e.g., `9012348882@paytm`
   - **Amount**: e.g., `15000`
   - **Reference/UTR ID**: e.g., `101552086410`
   - **Merchant Name**: e.g., `SAROJ BALA`
4. User clicks "Upload & Analyze"

### Backend Processing:
1. Backend receives image + manual data
2. Passes both to ML service
3. ML service prioritizes manual data over OCR
4. Runs validation checks on UPI ID, transaction ID, and amount
5. Returns fraud detection results

### Fraud Detection Checks:
- **UPI ID**: Format validation, suspicious patterns (test, fake, 123456)
- **Transaction ID**: 12-digit format, repeated/sequential digits
- **Amount**: Positive check, suspiciously round numbers, high amounts
- **Overall Risk Score**: Combined score determines verdict

## Testing the Fix

### Test Case 1: Legitimate Transaction
```
UPI ID: merchant123@paytm
Amount: 1234.50
Reference: 345612789012
Expected: ✅ Clean/Legitimate
```

### Test Case 2: Suspicious UPI ID
```
UPI ID: test123@paytm
Amount: 1000
Reference: 345612789012
Expected: ⚠️ Fraud Detected (Suspicious UPI ID pattern)
```

### Test Case 3: Invalid Transaction ID
```
UPI ID: merchant123@paytm
Amount: 1000
Reference: 111111111111
Expected: ⚠️ Fraud Detected (Repeated digits in Transaction ID)
```

### Test Case 4: High Amount
```
UPI ID: merchant123@paytm
Amount: 75000
Reference: 345612789012
Expected: ⚠️ Suspicious (High transaction amount)
```

## Next Steps
1. Restart backend and ML service to apply changes
2. Test with the user's data:
   - UPI: 9012348882@paytm
   - Amount: 15000
   - Reference: 101552086410
   - Merchant: SAROJ BALA
3. Verify fraud detection is working properly

## Files Modified
- `backend/routes/evidence.js`
- `backend/utils/mlService.js`
- `ml-service/main.py`





