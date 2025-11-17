# Working Test Links for Link Safety Checker

This document provides working example links you can use to test the link safety checker feature.

## ✅ Safe URLs (Should Pass - High Safety Score)

These are legitimate, safe websites that should pass the safety check:

```
https://www.google.com
https://www.github.com
https://www.wikipedia.org
https://www.microsoft.com
https://www.apple.com
https://www.amazon.com
https://example.com
https://httpbin.org/get
```

**Expected Result**: 
- Status: Safe
- Safety Score: 80-100/100
- No warnings
- Check Method: Google Safe Browsing API (if configured) or Pattern Matching

---

## ⚠️ Suspicious Pattern URLs (Should Show Warnings)

These URLs demonstrate common suspicious patterns found in WhatsApp scams. They may not resolve to actual websites, but the checker will identify the patterns:

### URL Shorteners
```
https://bit.ly/3xYz9Ab
https://tinyurl.com/verify-account-now
https://t.co/example123
https://goo.gl/abc123
https://cutt.ly/test-link
```

**Expected Result**:
- Status: Suspicious
- Safety Score: 50-70/100
- Warning: "URL shortener detected - may hide actual destination"

### Fake Bank/UPI Links
```
https://paytm-secure-update.tk/verify
https://phonepe-verify-account.xyz
https://gpay-secure-verify.xyz
https://sbi-bank-update-secure.cf
https://hdfc-bank-urgent-update.online
https://icici-bank-update.click
https://axis-bank-secure.ga
```

**Expected Result**:
- Status: Suspicious or Unsafe
- Safety Score: 0-50/100
- Warnings: 
  - "Suspicious TLD detected: .tk/.xyz/.cf/.online/.click/.ga"
  - "Potential WhatsApp scam pattern detected"

### Lottery/Prize Scams
```
https://claim-your-prize-winner.tk
https://congratulations-you-won-prize.tk
https://lottery-winner-claim.tk
https://prize-reward-claim.xyz
```

**Expected Result**:
- Status: Suspicious
- Safety Score: 0-50/100
- Warnings:
  - "Suspicious TLD detected"
  - "Potential WhatsApp scam pattern detected" (lottery/prize keywords)

### Fake Government Links
```
https://aadhaar-update-gov.ga/verify
https://pan-card-update-gov.tk
https://government-update-secure.cf
```

**Expected Result**:
- Status: Suspicious
- Safety Score: 0-50/100
- Warnings:
  - "Suspicious TLD detected"
  - "Potential WhatsApp scam pattern detected" (government keywords)

### IP Address Phishing
```
http://192.168.1.100/update-details
http://10.0.0.1/verify-account
http://172.16.0.1/secure-update
```

**Expected Result**:
- Status: Suspicious
- Safety Score: 50-70/100
- Warning: "IP address in URL - may be suspicious"

### Urgent Action Scams
```
https://tinyurl.com/urgent-action-required
https://bit.ly/verify-account-now
https://update-details-urgent.tk
```

**Expected Result**:
- Status: Suspicious
- Safety Score: 50-70/100
- Warnings:
  - "URL shortener detected" (if using shortener)
  - "Potential WhatsApp scam pattern detected" (urgent keywords)

---

## 🔍 Real Working Test URLs (Safe to Actually Visit)

These are real websites you can safely visit to test the checker:

### Safe Test Sites
```
https://example.com
https://httpbin.org/get
https://jsonplaceholder.typicode.com
https://httpstat.us/200
```

### Popular Legitimate Sites
```
https://www.google.com
https://www.github.com
https://www.wikipedia.org
https://www.microsoft.com
https://www.apple.com
https://stackoverflow.com
https://www.reddit.com
```

---

## 📝 How to Test

### Method 1: Using the UI
1. Go to the Link Safety Checker page
2. Scroll to "Test with Common WhatsApp Scam Patterns"
3. Click any button to auto-fill the URL
4. Click "Check Safety"
5. Review the results

### Method 2: Manual Entry
1. Go to the Link Safety Checker page
2. Copy any URL from this document
3. Paste it into the input field
4. Click "Check Safety"
5. Review the results

### Method 3: Using Browser DevTools
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check a URL in the app
4. Find the `/api/links/check` request
5. View the response JSON

---

## 🎯 Test Scenarios

### Scenario 1: Safe URL
**Input**: `https://www.google.com`
**Expected**:
- ✅ Status: Safe
- ✅ Score: 100/100
- ✅ No warnings
- ✅ Recommendation: "Link appears safe to open"

### Scenario 2: URL Shortener
**Input**: `https://bit.ly/example123`
**Expected**:
- ⚠️ Status: Suspicious
- ⚠️ Score: 70-85/100
- ⚠️ Warning: "URL shortener detected"
- ⚠️ Recommendation: "Proceed with caution"

### Scenario 3: Fake Bank Link
**Input**: `https://paytm-secure-update.tk`
**Expected**:
- 🚨 Status: Unsafe or Suspicious
- 🚨 Score: 0-50/100
- 🚨 Warnings: Multiple (TLD, scam pattern)
- 🚨 Recommendation: "DO NOT OPEN this link"

### Scenario 4: IP Address
**Input**: `http://192.168.1.100/verify`
**Expected**:
- ⚠️ Status: Suspicious
- ⚠️ Score: 50-70/100
- ⚠️ Warning: "IP address in URL"
- ⚠️ Recommendation: "Proceed with caution"

---

## 🔐 Important Notes

1. **Suspicious Pattern URLs**: Many of the suspicious pattern examples may not resolve to actual websites. This is intentional - they're designed to test pattern detection, not to visit real malicious sites.

2. **Safe URLs**: The safe URLs listed are legitimate websites you can actually visit.

3. **Google Safe Browsing**: If you have the API key configured, the checker will also query Google's database for real-time threat information.

4. **Pattern Matching**: Even without Google Safe Browsing API, the checker uses pattern matching to identify suspicious URLs.

---

## 📊 Expected Results Summary

| URL Type | Status | Score Range | Warnings |
|----------|--------|-------------|----------|
| Legitimate Site | Safe | 80-100 | None |
| URL Shortener | Suspicious | 70-85 | URL shortener detected |
| Fake Bank Link | Unsafe | 0-50 | TLD + Scam pattern |
| Lottery Scam | Unsafe | 0-50 | TLD + Scam pattern |
| IP Address | Suspicious | 50-70 | IP address detected |
| Fake Govt | Unsafe | 0-50 | TLD + Scam pattern |

---

## 🧪 Quick Test Checklist

- [ ] Test a safe URL (google.com) - Should show Safe
- [ ] Test a URL shortener (bit.ly) - Should show Suspicious
- [ ] Test a fake bank link (paytm-*.tk) - Should show Unsafe
- [ ] Test an IP address (192.168.x.x) - Should show Suspicious
- [ ] Test a lottery scam link - Should show Unsafe
- [ ] Verify warnings are displayed correctly
- [ ] Verify safety score is calculated correctly
- [ ] Verify check method indicator shows

---

**Ready to test?** Start with a safe URL like `https://www.google.com` to verify everything works, then try the suspicious patterns!



