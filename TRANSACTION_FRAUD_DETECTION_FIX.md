# Transaction Fraud Detection - Proper Implementation

## 🎯 Problem

Your AI is detecting **image editing** but not properly detecting **transaction fraud**. Two different things!

## Key Understanding

```
┌─────────────────────────────────────────────────────────────┐
│  IMAGE EDITING ≠ TRANSACTION FRAUD                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ GENUINE Screenshot + REAL Transaction = LEGITIMATE      │
│  ❌ GENUINE Screenshot + FAKE Transaction = FRAUD           │
│  ⚠️  EDITED Screenshot + REAL Transaction = SUSPICIOUS      │
│  ❌ EDITED Screenshot + FAKE Transaction = FRAUD            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Solution: Priority-Based Detection

### New Logic:

1. **PRIMARY (70% weight)**: Transaction Data Validation
   - UPI ID patterns
   - Transaction reference patterns
   - Amount patterns

2. **SECONDARY (30% weight)**: Image Forensics
   - Image editing detection
   - Compression artifacts

---

## 🚀 Implementation (Quick Fix)

### File Created:

**`ml-service/transaction_fraud_detector.py`** ✅

Contains smart fraud detection that focuses on TRANSACTION DATA first.

### How to Use:

**In your `ml-service/main.py`, update the analyze endpoint:**

```python
# Add at the top of main.py:
from transaction_fraud_detector import detect_fraud_comprehensive, TransactionFraudDetector

# In the /analyze endpoint (around line 1900-2000):
# After getting transaction data and image analysis, replace the decision logic with:

# Use comprehensive fraud detection
fraud_result = detect_fraud_comprehensive(
    transaction_data={
        'upiId': extracted_upi_id,
        'amount': extracted_amount,
        'referenceId': extracted_reference
    },
    image_analysis={
        'is_edited': is_edited,
        'edit_confidence': edit_confidence
    }
)

# Use the results:
fraud_detected = fraud_result['fraud_detected']
verdict = fraud_result['verdict']
confidence = fraud_result['confidence']
fraud_indicators = fraud_result['fraud_indicators']
```

---

## 📊 Detection Priority

### PRIMARY Indicators (Transaction Data):

| Pattern | Score | Action |
|---------|-------|--------|
| **Fake UPI ID** (test123@paytm, dummy@upi) | +70 | FRAUD |
| **Repeated Reference** (111111111111, 222222) | +80 | FRAUD |
| **Sequential Reference** (123456789012) | +80 | FRAUD |
| **Alternating Pattern** (121212121212) | +70 | FRAUD |
| **Invalid Format** (no @, wrong length) | +40-50 | SUSPICIOUS |
| **Suspicious Amount** (99999, round numbers) | +15-30 | FLAG |

### SECONDARY Indicators (Image):

| Pattern | Score | Action |
|---------|-------|--------|
| **Editing Software Metadata** | +40 | SUSPICIOUS |
| **High ELA Score** (>28) | +30 | SUSPICIOUS |
| **Extreme Artifacts** | +25 | SUSPICIOUS |

---

## 🎯 Examples

### Example 1: Genuine Transaction (Should PASS)

**Input:**
```json
{
  "upiId": "merchant789@paytm",
  "amount": "1234.50",
  "referenceId": "345612789032"
}
```

**Analysis:**
- ✅ UPI ID: Valid format, legitimate provider, no fake keywords
- ✅ Reference: 12 digits, no patterns, looks random
- ✅ Amount: Normal value, not round

**Result:**
```
VERDICT: LEGITIMATE ✅
Confidence: 92%
Fraud Score: 5
Primary Reason: Transaction data and image both appear legitimate
```

---

### Example 2: Fake Transaction (Should DETECT)

**Input:**
```json
{
  "upiId": "test123@paytm",
  "amount": "5000",
  "referenceId": "111111111111"
}
```

**Analysis:**
- ❌ UPI ID: Contains 'test' keyword → +70 points
- ❌ Reference: All repeated digits → +80 points
- ⚠️  Amount: Round number → +15 points
- **Total**: 165 points

**Result:**
```
VERDICT: FRAUD_DETECTED ❌
Confidence: 95%
Fraud Score: 100
Fraud Indicators:
  ► Fake UPI ID detected: Contains 'test'
  ► FAKE reference - Repeated digits: 111111111111
  ► Suspicious round amount: ₹5,000
Primary Reason: Transaction data indicates fraud
```

---

### Example 3: Real Transaction + Edited Image

**Input:**
```json
{
  "upiId": "merchant789@paytm",
  "amount": "2500.75",
  "referenceId": "847293561047"
}
```

**Image Analysis:**
- Image edited: Yes (confidence: 88%)

**Result:**
```
VERDICT: IMAGE_EDITED ⚠️
Confidence: 60%
Fraud Score: 26
Fraud Indicators:
  ► Image appears edited (confidence: 88%)
  ► Legitimate UPI provider detected: paytm
Primary Reason: Image appears edited but transaction data looks legitimate

NOT MARKED AS FRAUD - Transaction data is valid
```

---

## 🔧 Configuration

### Adjust Detection Sensitivity:

Edit `transaction_fraud_detector.py`:

```python
class TransactionFraudDetector:
    def __init__(self):
        # Add more fake keywords to catch
        self.fake_upi_keywords = [
            'test', 'demo', 'fake', 'dummy', 'sample',
            # Add your own keywords here
        ]
        
        # Known legitimate providers (reduces false positives)
        self.legitimate_providers = [
            'paytm', 'phonepe', 'googlepay', 'gpay',
            # Add more legitimate providers
        ]
```

### Adjust Thresholds:

```python
# In analyze_transaction method:

if fraud_score >= 60:  # Change this threshold
    verdict = "FRAUD_DETECTED"
elif fraud_score >= 35:  # Change this threshold
    verdict = "HIGHLY_SUSPICIOUS"
elif fraud_score >= 20:  # Change this threshold
    verdict = "SUSPICIOUS"
```

---

## 📈 Testing

### Test Case 1: Real UPI with Genuine Screenshot
```python
result = detect_fraud_comprehensive(
    transaction_data={
        'upiId': 'john.doe@paytm',
        'amount': '1234.50',
        'referenceId': '847293561047'
    },
    image_analysis={
        'is_edited': False,
        'edit_confidence': 0.22
    }
)

# Expected: is_fraud=False, verdict="LEGITIMATE"
```

### Test Case 2: Fake UPI with Genuine Screenshot
```python
result = detect_fraud_comprehensive(
    transaction_data={
        'upiId': 'test123@paytm',
        'amount': '5000',
        'referenceId': '111111111111'
    },
    image_analysis={
        'is_edited': False,  # Screenshot is genuine!
        'edit_confidence': 0.20
    }
)

# Expected: is_fraud=True, verdict="FRAUD_DETECTED"
# Even though image is genuine, transaction data is fake!
```

### Test Case 3: Sequential Reference
```python
result = detect_fraud_comprehensive(
    transaction_data={
        'upiId': 'user@phonepe',
        'amount': '999',
        'referenceId': '123456789012'
    },
    image_analysis=None
)

# Expected: is_fraud=True, verdict="FRAUD_DETECTED"
# Sequential pattern detected
```

---

## 🎯 Integration Checklist

- [ ] Copy `transaction_fraud_detector.py` to `ml-service/` directory
- [ ] Import in `main.py`: `from transaction_fraud_detector import detect_fraud_comprehensive`
- [ ] Update `/analyze` endpoint to use new function
- [ ] Test with genuine transaction
- [ ] Test with fake UPI ID
- [ ] Test with repeated reference
- [ ] Verify fraud still detected for fakes
- [ ] Verify real transactions pass

---

## 📊 Expected Results

### Before (Current Problem):

| Scenario | Current Verdict | Problem |
|----------|----------------|---------|
| Real transaction + Real image | EDITED (98%) | ❌ False positive |
| Fake transaction + Real image | EDITED (98%) | ⚠️  Detects image, not fraud |
| Real transaction + Edited image | EDITED (95%) | ⚠️  Flags image, not fraud data |

### After (Fixed):

| Scenario | New Verdict | Result |
|----------|-------------|---------|
| Real transaction + Real image | LEGITIMATE (92%) | ✅ Correct |
| Fake transaction + Real image | FRAUD (95%) | ✅ Detects fraud from data |
| Real transaction + Edited image | IMAGE_EDITED (60%) | ✅ Suspicious but not fraud |

---

## 🔑 Key Points

1. **Transaction Data is PRIMARY** (70% weight)
   - Fake UPI IDs are definitive fraud
   - Pattern references are definitive fraud
   - Suspicious amounts are flags

2. **Image Editing is SECONDARY** (30% weight)
   - Edited image ≠ Fraud
   - Edited image + Real data = Suspicious
   - Edited image + Fake data = Fraud

3. **Clear Verdicts**:
   - `FRAUD_DETECTED` - Transaction data is fake
   - `SUSPICIOUS` - Some indicators but not definitive
   - `IMAGE_EDITED` - Image edited but transaction okay
   - `LEGITIMATE` - Everything looks good

---

## 🚀 Quick Start

```bash
# 1. Copy the file (already done)
# ml-service/transaction_fraud_detector.py exists

# 2. Update main.py (add import)
# from transaction_fraud_detector import detect_fraud_comprehensive

# 3. Replace fraud detection logic in /analyze endpoint
# fraud_result = detect_fraud_comprehensive(transaction_data, image_analysis)

# 4. Restart ML service
cd ml-service
python main.py

# 5. Test!
```

---

## 📞 Support

**Common Issues:**

**Q: Real transactions still flagged as fraud?**
A: Check the fraud_score in logs. Adjust thresholds in `analyze_transaction` method.

**Q: Fake transactions not detected?**
A: Add more fake keywords to `fake_upi_keywords` list.

**Q: Image editing still triggers fraud?**
A: This is correct behavior only if transaction data is also suspicious. Check the final verdict logic.

---

## ✅ Success Criteria

After implementing:

- ✅ Genuine screenshot + Real transaction → LEGITIMATE
- ✅ Genuine screenshot + Fake UPI (test123@paytm) → FRAUD_DETECTED
- ✅ Genuine screenshot + Repeated reference (111111) → FRAUD_DETECTED
- ✅ Edited screenshot + Real transaction → IMAGE_EDITED (not fraud)
- ✅ Confidence based on transaction data, not image

---

**Created**: November 17, 2025  
**Priority**: Transaction Data (70%) > Image Editing (30%)  
**Status**: ✅ Ready to Implement



