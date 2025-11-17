# Testing Guide - Manual Transaction Upload

## ✅ Fixes Applied

I've fixed the 400 error you were experiencing. The issues were:

1. **Backend was rejecting non-MongoDB transaction IDs** - Fixed by removing strict validation
2. **Manual data wasn't being sent to ML service** - Fixed by properly forwarding manual input
3. **ML service wasn't using manual data** - Fixed by prioritizing manual input over OCR

## 🚀 How to Test

### Step 1: Ensure Services Are Running

Open **3 separate terminal windows**:

**Terminal 1 - Backend:**
```powershell
cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI\backend"
npm run dev
```
Wait for: `✅ Server running on port 5000`

**Terminal 2 - ML Service:**
```powershell
cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI\ml-service"
python main.py
```
Wait for: `INFO:     Uvicorn running on http://0.0.0.0:8000`

**Terminal 3 - Frontend:**
```powershell
cd "C:\Users\Priyadarshan L G\OneDrive\Desktop\Secure UPI\frontend"
npm run dev
```
Wait for: `Local: http://localhost:5173/`

### Step 2: Test the Upload

1. **Open your browser**: http://localhost:5173
2. **Login** with your account
3. **Navigate to**: Evidence Upload page
4. **Upload any transaction screenshot** (even if it's fake/blurry)
5. **Check the checkbox**: "Manually enter transaction details (if OCR fails)"
6. **Fill in the manual fields**:

### Step 3: Test Cases

#### Test Case A: Legitimate Transaction ✅
```
UPI ID: merchant789@paytm
Amount: 1234.50
Reference/UTR ID: 345612789012
Merchant Name: ABC Store
```
**Expected Result**: Clean/Legitimate verdict

#### Test Case B: Suspicious UPI ID (Your Example) ⚠️
```
UPI ID: 9012348882@paytm
Amount: 15000
Reference/UTR ID: 101552086410
Merchant Name: SAROJ BALA
```
**Expected Result**: Should analyze without 400 error. May flag high amount.

#### Test Case C: Fake UPI ID ❌
```
UPI ID: test123@paytm
Amount: 1000
Reference/UTR ID: 345612789012
Merchant Name: Test Merchant
```
**Expected Result**: FRAUD DETECTED - Suspicious UPI ID pattern

#### Test Case D: Fake Transaction ID ❌
```
UPI ID: merchant789@paytm
Amount: 1000
Reference/UTR ID: 111111111111
Merchant Name: ABC Store
```
**Expected Result**: FRAUD DETECTED - Repeated digits in Transaction ID

#### Test Case E: Sequential Transaction ID ❌
```
UPI ID: merchant789@paytm
Amount: 1000
Reference/UTR ID: 123456789012
Merchant Name: ABC Store
```
**Expected Result**: FRAUD DETECTED - Sequential pattern in Transaction ID

## 📊 Understanding the Results

After uploading, you'll see:

### Clean Transaction
```
✅ Analysis Results
Verdict: CLEAN
Forgery Score: 20/100
OCR Text: [Extracted text]
Transaction Validation: LEGITIMATE
```

### Fraudulent Transaction
```
🚨 FRAUD DETECTED!
Verdict: FRAUD_DETECTED
Forgery Score: 85/100
Fraud Indicators:
  ❌ Invalid UPI ID: Suspicious UPI ID pattern detected
  ❌ Invalid Transaction ID: Transaction ID consists of repeated digits
```

## 🔍 Fraud Detection Rules

The ML service now checks:

### UPI ID Validation:
- ✅ Must follow format: `user@provider`
- ❌ Blacklisted keywords: test, demo, fake, 123456, 000000
- ❌ Suspicious patterns detected

### Transaction ID Validation:
- ✅ Must be 12 digits
- ❌ No repeated digits (e.g., 111111111111)
- ❌ No simple sequences (e.g., 123456789012)

### Amount Validation:
- ✅ Must be positive
- ⚠️ Round numbers >1000 flagged (e.g., 5000.00)
- ⚠️ High amounts >50000 require extra verification

## 🐛 If You Still Get Errors

### Error: "Request failed with status code 400"
- Make sure backend is running (port 5000)
- Check that you uploaded an image file
- Verify manual data fields are filled correctly

### Error: "Upload failed" or "ML service error"
- Make sure ML service is running (port 8000)
- Check terminal 2 for Python errors
- Verify Python dependencies are installed

### Error: "Network Error"
- Check all 3 services are running
- Verify ports: 5173 (frontend), 5000 (backend), 8000 (ML)
- Check firewall isn't blocking connections

## 📝 Notes

- The checkbox "Manually enter transaction details" must be **checked** for the manual fields to be used
- You can still upload an image even if using manual data (required for image forensics)
- The ML service will prioritize manual data over OCR when provided
- All manual fields are optional, but more data = better fraud detection

## 🎯 Success Indicators

You'll know it's working when:
1. ✅ No 400 error on upload
2. ✅ You see detailed fraud analysis results
3. ✅ Fraud indicators are shown for suspicious transactions
4. ✅ Transaction validation results are displayed

---

**Need Help?** Check the terminal windows for error messages. All errors will be logged there.

