# Testing the Link Safety Checker

Quick guide to test the new link safety checking feature.

## 🚀 Quick Test

### Step 1: Start Your Services

Make sure your backend is running:
```bash
cd backend
npm run dev
```

You should see: `Server running on port 5000`

### Step 2: Access the Link Checker

1. **Open your browser**: http://localhost:5173
2. **Login** (if required)
3. **Click "Check Link Safety"** button in the navigation bar
   - OR go directly to: http://localhost:5173/links/check

### Step 3: Test URLs

Try these test cases:

#### ✅ Safe URLs (Should pass)
- `https://www.google.com`
- `https://www.github.com`
- `https://www.microsoft.com`
- `https://www.wikipedia.org`

#### ⚠️ Suspicious URLs (Should show warnings)
- `https://bit.ly/example` (URL shortener)
- `https://example.tk` (Suspicious TLD)
- `http://192.168.1.1` (IP address)

#### 🚨 Unsafe URLs (If you have Safe Browsing API)
- Test with known malicious URLs (if available)
- URLs with suspicious patterns

## 📊 What to Look For

### Without Google Safe Browsing API Key:
- ✅ Page loads correctly
- ✅ Can enter and check URLs
- ✅ Shows "Check Method: Pattern Matching"
- ✅ Displays safety score (0-100)
- ✅ Shows warnings for suspicious patterns
- ✅ Shows status: safe/suspicious/unsafe

### With Google Safe Browsing API Key:
- ✅ Shows "Check Method: Google Safe Browsing API" (green checkmark)
- ✅ More accurate threat detection
- ✅ Real-time threat information from Google's database

## 🧪 Test Scenarios

### Test 1: Basic URL Check
1. Enter: `https://www.google.com`
2. Click "Check Safety"
3. **Expected**: 
   - Status: Safe
   - Score: 100/100 (or close)
   - No warnings

### Test 2: URL Shortener
1. Enter: `https://bit.ly/example`
2. Click "Check Safety"
3. **Expected**:
   - Status: Suspicious
   - Warning: "URL shortener detected"
   - Lower safety score

### Test 3: Invalid URL
1. Enter: `not-a-url`
2. Click "Check Safety"
3. **Expected**:
   - Error message
   - "Invalid URL format"

### Test 4: URL Without Protocol
1. Enter: `www.google.com`
2. Click "Check Safety"
3. **Expected**:
   - Automatically adds `https://`
   - Checks successfully

## 🔍 Verify API Integration

### Check Backend Logs

When checking a URL, look for these log messages:

**Without API Key:**
```
Google Safe Browsing API key not configured, using pattern matching only
```

**With API Key (working):**
```
Checking URL with Google Safe Browsing API: https://www.google.com
Google Safe Browsing: URL appears safe - https://www.google.com
```

**With API Key (error):**
```
Google Safe Browsing API: Invalid API key or quota exceeded
```

### Check Frontend Response

Open browser DevTools (F12) → Network tab:
1. Check a URL
2. Find the `/api/links/check` request
3. View the response

**Response should include:**
```json
{
  "url": "https://www.google.com",
  "hostname": "www.google.com",
  "isSafe": true,
  "status": "safe",
  "safetyScore": 100,
  "warnings": [],
  "threats": [],
  "checkMethod": "google_safe_browsing",  // or "pattern_matching"
  "safeBrowsingEnabled": true,  // or false
  "checkedAt": "2024-01-15T10:30:00.000Z",
  "recommendations": ["Link appears safe to open."]
}
```

## ✅ Success Indicators

- [ ] Page loads without errors
- [ ] Can enter URLs and click "Check Safety"
- [ ] Results display correctly with color coding
- [ ] Safety score shows (0-100)
- [ ] Status badge shows (Safe/Suspicious/Unsafe)
- [ ] Check method indicator shows
- [ ] No console errors in browser
- [ ] Backend logs show link check requests

## 🐛 Troubleshooting

### Issue: "Failed to check link safety"
- **Check**: Is backend running?
- **Check**: Are you logged in? (API requires authentication)
- **Check**: Backend logs for errors

### Issue: Always shows "Pattern Matching"
- **Check**: Is `GOOGLE_SAFE_BROWSING_API_KEY` set in `.env`?
- **Check**: Did you restart backend after adding API key?
- **Check**: Backend logs for API errors

### Issue: "Network Error"
- **Check**: Backend is running on port 5000
- **Check**: Frontend can reach backend (CORS configured)
- **Check**: Browser console for CORS errors

## 📝 Test Checklist

- [ ] Can access `/links/check` page
- [ ] Can enter a URL
- [ ] Can click "Check Safety" button
- [ ] Results display after checking
- [ ] Safety score is shown (0-100)
- [ ] Status badge is color-coded correctly
- [ ] Warnings display for suspicious URLs
- [ ] Check method indicator shows
- [ ] "Check Another Link" button works
- [ ] No JavaScript errors in console
- [ ] Backend logs show successful checks

## 🎯 Expected Behavior

1. **Safe URL** → Green badge, high score, "Safe" status
2. **Suspicious URL** → Yellow badge, medium score, warnings shown
3. **Unsafe URL** → Red badge, low score, threats listed
4. **Invalid URL** → Error message, no results

---

**Ready to test?** Start with a simple URL like `https://www.google.com` and verify everything works!



