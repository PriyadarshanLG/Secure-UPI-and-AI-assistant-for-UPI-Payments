# Test URLs for Link Checker - Secure UPI

## 🔴 FAKE/MALICIOUS URLs (Should Be Detected as UNSAFE)

### Phishing URLs (Common Patterns):

```
# PayTM Phishing
https://paytm-verify.com/login
https://secure-paytm.net/verify
https://paytm-kyc-update.online
https://paytm.verification-required.com
https://paytm-refund.xyz
https://www.paytm-rewards.club

# PhonePe Phishing
https://phonepe-security.com/verify
https://secure-phonepe.net/kyc
https://phonepe-support.xyz
https://phonepe.update-required.com
https://phonepe-cashback.online

# Google Pay Phishing
https://googlepay-verify.com
https://gpay-security.net
https://google-pay-kyc.xyz
https://googlepay.verification-needed.com

# Bank Phishing
https://sbi-netbanking-secure.com
https://hdfc-bank-login.net
https://icici-verify.xyz
https://axis-bank-secure.online

# UPI Phishing
https://upi-verification.com
https://bhim-upi-kyc.net
https://upi-payment-verify.xyz
https://npci-verify-account.com

# Generic Suspicious Patterns
https://payment-verify123.com
https://secure-payment-portal.xyz
https://verify-your-account-now.com
https://urgent-kyc-update.online
https://claim-your-refund.net
https://free-cashback-offer.com
```

---

## ✅ LEGITIMATE URLs (Should Be Detected as SAFE)

### Official Payment Platforms:

```
# PayTM (Official)
https://paytm.com
https://www.paytm.com
https://business.paytm.com
https://m.paytm.com

# PhonePe (Official)
https://phonepe.com
https://www.phonepe.com
https://www.phonepe.com/business

# Google Pay (Official)
https://pay.google.com
https://pay.google.com/about
https://payments.google.com

# BHIM UPI (Official)
https://www.bhimupi.org.in
https://www.npci.org.in/what-we-do/upi

# Banks (Official)
https://www.onlinesbi.com
https://netbanking.hdfcbank.com
https://www.icicibank.com
https://www.axisbank.com
https://www.kotak.com

# Government
https://www.npci.org.in
https://www.rbi.org.in
https://india.gov.in

# E-commerce (Legitimate)
https://www.amazon.in
https://www.flipkart.com
https://www.myntra.com
https://www.swiggy.com
https://www.zomato.com

# General Safe URLs
https://www.google.com
https://www.youtube.com
https://www.wikipedia.org
https://github.com
https://stackoverflow.com
```

---

## 🎯 Test Cases for Your Link Checker

### Test Case 1: Obvious Phishing (High Confidence)

**URL**: `https://paytm-verify-kyc.xyz/login?user=123`

**Expected Result**:
```json
{
  "isSafe": false,
  "riskLevel": "HIGH",
  "confidence": 0.95,
  "reasons": [
    "Suspicious domain pattern: 'paytm-verify'",
    "Non-official TLD: .xyz",
    "Contains 'verify' in domain (common phishing pattern)",
    "Not in Google Safe Browsing whitelist"
  ]
}
```

---

### Test Case 2: Typosquatting

**URL**: `https://paytm.co.in` (fake) vs `https://paytm.com` (real)

**Expected Result**:
```json
{
  "isSafe": false,
  "riskLevel": "HIGH",
  "confidence": 0.90,
  "reasons": [
    "Typosquatting: Similar to legitimate domain 'paytm.com'",
    "Unofficial TLD for PayTM"
  ]
}
```

---

### Test Case 3: Legitimate URL

**URL**: `https://paytm.com/profile`

**Expected Result**:
```json
{
  "isSafe": true,
  "riskLevel": "LOW",
  "confidence": 0.98,
  "reasons": [
    "Official PayTM domain",
    "HTTPS secure connection",
    "Whitelisted domain"
  ]
}
```

---

## 🔍 Detection Patterns to Implement

### 1. Suspicious Domain Patterns

```javascript
const suspiciousPatterns = [
  // Verification/Security scams
  'verify', 'security', 'secure-', '-secure',
  'validation', 'confirm', 'update-kyc',
  
  // Urgency tactics
  'urgent', 'immediate', 'expire', 'suspend',
  'action-required', 'verify-now',
  
  // Reward/Refund scams
  'refund', 'cashback', 'reward', 'prize',
  'free-', 'offer', 'claim', 'bonus',
  
  // Support impersonation
  'support', 'help', 'care', 'service',
  '-help', 'customer-care',
  
  // Login/Account scams
  'login', 'signin', 'account', 'portal',
  'banking', 'netbanking'
];
```

---

### 2. Suspicious TLDs (Top-Level Domains)

```javascript
const suspiciousTLDs = [
  '.xyz', '.top', '.win', '.club', '.online',
  '.work', '.loan', '.click', '.link', '.download',
  '.bid', '.accountant', '.review', '.stream',
  '.gq', '.ml', '.cf', '.tk', '.ga'  // Free TLDs
];
```

---

### 3. Legitimate Domains Whitelist

```javascript
const legitimateDomains = [
  // Payment platforms
  'paytm.com', 'phonepe.com', 'pay.google.com',
  'payments.google.com', 'bhimupi.org.in',
  
  // Banks
  'onlinesbi.com', 'hdfcbank.com', 'icicibank.com',
  'axisbank.com', 'kotakbank.com', 'pnbindia.in',
  
  // Government
  'npci.org.in', 'rbi.org.in', 'india.gov.in',
  
  // E-commerce
  'amazon.in', 'flipkart.com', 'myntra.com',
  'swiggy.com', 'zomato.com'
];
```

---

## 🧪 Comprehensive Test Suite

### Test 1: Phishing URL with Suspicious Pattern

```javascript
testURL('https://paytm-verify-account.xyz/login')
// Expected: UNSAFE, High Risk
```

### Test 2: Legitimate Domain

```javascript
testURL('https://paytm.com')
// Expected: SAFE, Low Risk
```

### Test 3: IP Address (Suspicious)

```javascript
testURL('http://192.168.1.100/payment')
// Expected: UNSAFE, Medium-High Risk
```

### Test 4: Subdomain Spoofing

```javascript
testURL('https://paytm.com.phishing-site.com')
// Expected: UNSAFE, High Risk
// Note: Real domain is at the end, not the actual domain
```

### Test 5: HTTP (No SSL)

```javascript
testURL('http://paytm.com')
// Expected: UNSAFE/WARNING, Medium Risk (no HTTPS)
```

### Test 6: Long URL with Redirect

```javascript
testURL('https://bit.ly/paytm-kyc-update')
// Expected: WARNING, Medium Risk (URL shortener)
```

### Test 7: Punycode/IDN Attack

```javascript
testURL('https://pаytm.com')  // Note: 'а' is Cyrillic, not Latin 'a'
// Expected: UNSAFE, High Risk (homograph attack)
```

---

## 📊 Risk Scoring Logic

```javascript
function calculateRiskScore(url) {
  let riskScore = 0;
  const reasons = [];
  
  // Check HTTPS (+20 if missing)
  if (!url.startsWith('https://')) {
    riskScore += 20;
    reasons.push('No HTTPS encryption');
  }
  
  // Check for suspicious patterns (+30 each)
  suspiciousPatterns.forEach(pattern => {
    if (url.includes(pattern)) {
      riskScore += 30;
      reasons.push(`Suspicious pattern: ${pattern}`);
    }
  });
  
  // Check for suspicious TLD (+40)
  suspiciousTLDs.forEach(tld => {
    if (url.endsWith(tld)) {
      riskScore += 40;
      reasons.push(`Suspicious TLD: ${tld}`);
    }
  });
  
  // Check if IP address (+35)
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
    riskScore += 35;
    reasons.push('IP address instead of domain');
  }
  
  // Check whitelist (override if whitelisted)
  const domain = extractDomain(url);
  if (legitimateDomains.includes(domain)) {
    riskScore = 0;
    reasons.length = 0;
    reasons.push('Whitelisted legitimate domain');
  }
  
  // Determine risk level
  let riskLevel;
  if (riskScore >= 60) riskLevel = 'HIGH';
  else if (riskScore >= 30) riskLevel = 'MEDIUM';
  else riskLevel = 'LOW';
  
  return {
    isSafe: riskScore < 30,
    riskScore,
    riskLevel,
    confidence: Math.min(0.95, riskScore / 100),
    reasons
  };
}
```

---

## 🎯 Quick Test Commands

### Test with curl:

```bash
# Test phishing URL
curl -X POST http://localhost:5000/api/links/check \
  -H "Content-Type: application/json" \
  -d '{"url": "https://paytm-verify.xyz/login"}'

# Expected: {"isSafe": false, "riskLevel": "HIGH"}

# Test legitimate URL
curl -X POST http://localhost:5000/api/links/check \
  -H "Content-Type: application/json" \
  -d '{"url": "https://paytm.com"}'

# Expected: {"isSafe": true, "riskLevel": "LOW"}
```

---

## 📝 Test Data for Bulk Testing

### CSV Format:

```csv
URL,Expected_Result,Risk_Level,Notes
https://paytm.com,SAFE,LOW,Official PayTM
https://paytm-verify.xyz,UNSAFE,HIGH,Phishing pattern
https://phonepe.com,SAFE,LOW,Official PhonePe
https://phonepe-kyc.net,UNSAFE,HIGH,Fake PhonePe
https://pay.google.com,SAFE,LOW,Official Google Pay
https://googlepay-reward.xyz,UNSAFE,HIGH,Reward scam
http://192.168.1.1,UNSAFE,MEDIUM,IP address
https://bit.ly/paytm,UNSAFE,MEDIUM,URL shortener
```

---

## 🔧 Google Safe Browsing Integration

### Test with Google Safe Browsing API:

```javascript
// Known malicious URL (for testing)
testURL('http://malware.testing.google.test/testing/malware/')
// Expected: UNSAFE (flagged by Google Safe Browsing)

// Clean URL
testURL('https://google.com')
// Expected: SAFE
```

**Note**: See `GOOGLE_SAFE_BROWSING_SETUP.md` for API setup.

---

## ✅ Expected Behavior Summary

| URL Type | Should Detect As | Risk Level | Confidence |
|----------|-----------------|------------|------------|
| Official PayTM/PhonePe | SAFE | LOW | 95-98% |
| Phishing with patterns | UNSAFE | HIGH | 90-95% |
| Suspicious TLD | UNSAFE | HIGH | 85-90% |
| IP Address | UNSAFE | MEDIUM-HIGH | 80-85% |
| No HTTPS | WARNING | MEDIUM | 70-75% |
| URL Shortener | WARNING | MEDIUM | 65-70% |
| Whitelisted domain | SAFE | LOW | 98% |

---

## 📞 Integration with Your App

Your link checker endpoint should be at:
```
POST /api/links/check
Body: { "url": "https://example.com" }
```

Test it's working:
```bash
curl -X POST http://localhost:5000/api/links/check \
  -H "Content-Type: application/json" \
  -d '{"url": "https://paytm-verify.xyz"}'
```

---

## 🎉 Quick Test Script

Save as `test-link-checker.js`:

```javascript
const axios = require('axios');

const testURLs = [
  { url: 'https://paytm.com', expected: 'SAFE' },
  { url: 'https://paytm-verify.xyz', expected: 'UNSAFE' },
  { url: 'https://phonepe.com', expected: 'SAFE' },
  { url: 'https://phonepe-kyc.net', expected: 'UNSAFE' },
  { url: 'http://192.168.1.1', expected: 'UNSAFE' }
];

async function testAll() {
  for (const test of testURLs) {
    const result = await axios.post('http://localhost:5000/api/links/check', {
      url: test.url
    });
    
    console.log(`URL: ${test.url}`);
    console.log(`Expected: ${test.expected}, Got: ${result.data.isSafe ? 'SAFE' : 'UNSAFE'}`);
    console.log(`Risk Level: ${result.data.riskLevel}`);
    console.log('---');
  }
}

testAll();
```

---

**Use these URLs to thoroughly test your link checker feature!** ✅

**See also**: `TEST_LINK_CHECKER.md` and `TEST_LINKS_EXAMPLES.md` for more examples.


