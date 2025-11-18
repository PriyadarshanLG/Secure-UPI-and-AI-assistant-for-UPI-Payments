# Testing Guide: Link Scanner After Fix 🧪

## Step 1: Restart Backend Server

```bash
cd backend
npm start
```

Wait for: `✓ Server running on port 5000`

---

## Step 2: Test via Frontend (Easiest)

1. **Open your Secure UPI app** in browser
2. **Login** with your credentials
3. **Navigate to "Link Safety Checker"** page
4. **Test the URLs below** one by one

---

## Test Cases

### ✅ Group 1: Legitimate URLs (Should Show as SAFE)

| URL | Expected Result | Score Range |
|-----|----------------|-------------|
| `https://www.google.com` | **SAFE** ✅ | 100 |
| `https://www.github.com` | **SAFE** ✅ | 100 |
| `https://www.paytm.com` | **SAFE** ✅ | 100 |
| `https://www.phonepe.com` | **SAFE** ✅ | 100 |
| `https://pay.google.com` | **SAFE** ✅ | 100 |
| `https://api.example.com/v1/users` | **SAFE** ✅ | 100 |
| `https://cdn.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js` | **SAFE** ✅ | 100 |
| `https://example.com?token=abc123def456` | **SAFE** ✅ | 92-100 |
| `https://subdomain.example.com/file.pdf` | **SAFE** ✅ | 100 |
| `https://www.example.com/path/to/page.html?id=123&user=test` | **SAFE** ✅ | 100 |

**Expected Behavior:**
- Status: "safe" or "Link appears safe to open"
- Safety Score: 85-100
- Few or no warnings
- Green indicator ✅

---

### ⚠️ Group 2: Suspicious URLs (Should Show as SUSPICIOUS)

| URL | Expected Result | Score Range | Reason |
|-----|----------------|-------------|---------|
| `https://bit.ly/abc123` | **SUSPICIOUS** ⚠️ | 92 | URL shortener |
| `https://tinyurl.com/test123` | **SUSPICIOUS** ⚠️ | 92 | URL shortener |
| `https://t.co/abc` | **SUSPICIOUS** ⚠️ | 92 | URL shortener |
| `https://example.tk` | **SUSPICIOUS** ⚠️ | 92 | Suspicious TLD (.tk) |
| `https://test.xyz/promo` | **SUSPICIOUS** ⚠️ | 92 | Suspicious TLD (.xyz) |
| `https://goo.gl/maps/test` | **SUSPICIOUS** ⚠️ | 92 | URL shortener |

**Expected Behavior:**
- Status: "suspicious"
- Safety Score: 60-92
- 1-2 warnings
- Yellow indicator ⚠️
- Recommendation: "Proceed with caution"

---

### ❌ Group 3: Malicious/Unsafe URLs (Should Show as UNSAFE)

| URL | Expected Result | Score Range | Reason |
|-----|----------------|-------------|---------|
| `https://paytm-secure.xyz/verify` | **UNSAFE** ❌ | 0-16 | Fake bank domain + suspicious TLD |
| `https://phonepe-update.tk/login` | **UNSAFE** ❌ | 0-16 | Fake payment app + suspicious TLD |
| `https://googlepay-verify.com/claim-prize` | **UNSAFE** ❌ | 8-24 | Typosquatting + scam pattern |
| `http://192.168.1.1/phishing.html` | **UNSAFE** ❌ | 0 | Private IP + phishing keyword |
| `https://sbi-update.online/verify-account` | **UNSAFE** ❌ | 8-16 | Fake bank + scam patterns |
| `https://winner.click/lottery-claim` | **UNSAFE** ❌ | 8-16 | Lottery scam + suspicious TLD |
| `https://urgent-action.site/update-details` | **UNSAFE** ❌ | 16 | Urgency scam pattern |

**Expected Behavior:**
- Status: "unsafe"
- Safety Score: 0-40
- Multiple warnings (3+)
- Red indicator ❌
- Recommendation: "DO NOT OPEN this link"

---

## Step 3: Test via API (Advanced)

### Using curl (Windows PowerShell):

```powershell
# First, login to get token
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body (@{email="test@example.com"; password="password123"} | ConvertTo-Json) -ContentType "application/json"
$token = $response.token

# Test a safe URL
Invoke-RestMethod -Uri "http://localhost:5000/api/links/check" -Method POST -Headers @{Authorization="Bearer $token"} -Body (@{url="https://www.google.com"} | ConvertTo-Json) -ContentType "application/json"

# Test a suspicious URL
Invoke-RestMethod -Uri "http://localhost:5000/api/links/check" -Method POST -Headers @{Authorization="Bearer $token"} -Body (@{url="https://bit.ly/test"} | ConvertTo-Json) -ContentType "application/json"

# Test a malicious URL
Invoke-RestMethod -Uri "http://localhost:5000/api/links/check" -Method POST -Headers @{Authorization="Bearer $token"} -Body (@{url="https://paytm-secure.xyz/verify"} | ConvertTo-Json) -ContentType "application/json"
```

### Using curl (Git Bash / Linux / Mac):

```bash
# First, login to get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r '.token')

# Test a safe URL
curl -X POST http://localhost:5000/api/links/check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.google.com"}'

# Test a suspicious URL
curl -X POST http://localhost:5000/api/links/check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://bit.ly/test"}'

# Test a malicious URL
curl -X POST http://localhost:5000/api/links/check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://paytm-secure.xyz/verify"}'
```

---

## Expected API Response Format

### For Safe URL:
```json
{
  "url": "https://www.google.com",
  "hostname": "www.google.com",
  "isSafe": true,
  "status": "safe",
  "safetyScore": 100,
  "warnings": [],
  "threats": [],
  "checkedAt": "2025-11-17T10:30:00.000Z",
  "checkMethod": "pattern_matching",
  "safeBrowsingEnabled": false,
  "recommendations": [
    "Link appears safe to open."
  ]
}
```

### For Suspicious URL:
```json
{
  "url": "https://bit.ly/test",
  "hostname": "bit.ly",
  "isSafe": true,
  "status": "suspicious",
  "safetyScore": 92,
  "warnings": [
    "URL shortener detected - may hide actual destination"
  ],
  "threats": [],
  "recommendations": [
    "Proceed with caution. Review warnings before opening."
  ]
}
```

### For Unsafe URL:
```json
{
  "url": "https://paytm-secure.xyz/verify",
  "hostname": "paytm-secure.xyz",
  "isSafe": false,
  "status": "unsafe",
  "safetyScore": 8,
  "warnings": [
    "Potential WhatsApp scam pattern detected",
    "Suspicious TLD detected: .xyz"
  ],
  "threats": [],
  "recommendations": [
    "DO NOT OPEN this link. It may contain malware or phishing content."
  ]
}
```

---

## What to Look For

### ✅ Success Indicators:
1. **Legitimate URLs show as SAFE** with scores 85-100
2. **URL shorteners show as SUSPICIOUS** (not unsafe)
3. **Scam patterns show as UNSAFE** with scores < 40
4. **No false positives** on common CDN/API URLs
5. **Query parameters don't trigger warnings**

### ❌ Failure Indicators:
1. Legitimate URLs showing as "suspicious" or "unsafe"
2. Scores below 70 for known-safe domains
3. CDN URLs being flagged
4. URLs with tokens/IDs marked as suspicious
5. File extensions triggering subdomain warnings

---

## Troubleshooting

### Issue: All URLs show as "unsafe"
**Solution:** Check backend logs for errors. Ensure server restarted properly.

### Issue: "Google Safe Browsing check unavailable"
**Solution:** This is normal if API key not configured. Pattern matching still works.

### Issue: API returns 401 Unauthorized
**Solution:** Ensure you're logged in and token is valid. Re-login if needed.

### Issue: Frontend not reflecting changes
**Solution:** Clear browser cache (Ctrl+Shift+Delete) or hard refresh (Ctrl+F5)

---

## Rollback Instructions

If results are worse after the fix, rollback by reverting these lines in `backend/routes/links.js`:

```javascript
// Line 297: Change back to
safetyScore -= patternIssues.length * 15; // Was: * 8

// Line 318: Change back to
if (safetyScore < 70) { // Was: < 50

// Line 340-349: Change back to
if (!isSafe || safetyScore < 50) {
  status = 'unsafe';
} else if (safetyScore < 80 || warnings.length > 0) {
  status = 'suspicious';
}
```

Then restart backend:
```bash
cd backend
npm start
```

---

## Report Issues

If you find:
- False positives (safe URLs marked as suspicious/unsafe)
- False negatives (malicious URLs marked as safe)
- Unexpected behavior

**Document:**
1. The URL tested
2. Expected result
3. Actual result (status, score, warnings)
4. Screenshot if possible

---

**Last Updated:** November 17, 2025  
**Related Docs:** 
- `LINK_SCANNER_FALSE_POSITIVE_FIX.md` (detailed changes)
- `QUICK_FIX_LINK_SCANNER.md` (quick reference)
- `TEST_URLS_FOR_LINK_CHECKER.md` (more test URLs)



