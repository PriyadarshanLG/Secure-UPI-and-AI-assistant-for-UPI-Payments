# Quick Setup: Google Safe Browsing API

Follow these simple steps to enable Google Safe Browsing API for link safety checking.

## Step 1: Get Your API Key (5 minutes)

### 1.1 Go to Google Cloud Console
👉 Open: https://console.cloud.google.com/

### 1.2 Create a Project
- Click the project dropdown at the top
- Click **"New Project"**
- Name it: `Secure UPI` (or any name)
- Click **"Create"**
- Wait a few seconds, then select your new project

### 1.3 Enable Safe Browsing API
- Click **"APIs & Services"** in the left menu
- Click **"Library"**
- Search for: `Safe Browsing API`
- Click on **"Safe Browsing API"**
- Click the blue **"Enable"** button

### 1.4 Create API Key
- Go to **"APIs & Services"** > **"Credentials"**
- Click **"+ CREATE CREDENTIALS"** at the top
- Select **"API key"**
- Your API key will appear! **Copy it now** (you'll need it in Step 2)

### 1.5 Secure Your API Key (Important!)
- Click **"Restrict Key"** (or click on the key name to edit)
- Under **"API restrictions"**:
  - Select **"Restrict key"**
  - Check **"Safe Browsing API"**
- Click **"Save"**

✅ **You now have your API key!** It looks like: `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567`

---

## Step 2: Add API Key to Your Project

### Option A: Local Development (Without Docker)

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create or edit `.env` file:**
   ```bash
   # If file doesn't exist, create it
   # If it exists, open it in a text editor
   ```

3. **Add this line to `.env`:**
   ```env
   GOOGLE_SAFE_BROWSING_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
   ```
   ⚠️ **Replace** `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567` with your actual API key!

4. **Save the file**

5. **Restart your backend server:**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

### Option B: Docker Setup

1. **Edit `docker-compose.yml`** in the project root

2. **Find the `backend` service section** (around line 36)

3. **Add the environment variable:**
   ```yaml
   backend:
     environment:
       NODE_ENV: production
       PORT: 5000
       MONGO_URI: mongodb://mongodb:27017/secure-upi
       JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
       JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:-change-me-in-production}
       CORS_ORIGIN: http://localhost:5173
       ML_SERVICE_URL: http://ml-service:8000
       REDIS_HOST: redis
       REDIS_PORT: 6379
       GOOGLE_SAFE_BROWSING_API_KEY: ${GOOGLE_SAFE_BROWSING_API_KEY}  # Add this line
   ```

4. **Create `.env` file in project root** (if it doesn't exist):
   ```env
   GOOGLE_SAFE_BROWSING_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
   ```
   ⚠️ Replace with your actual API key!

5. **Restart Docker containers:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## Step 3: Verify It's Working

1. **Start your backend server** (if not already running)

2. **Check the logs** - You should see:
   ```
   Server running on port 5000
   ```

3. **Test the link checker:**
   - Go to: http://localhost:5173/links/check
   - Enter a URL: `https://www.google.com`
   - Click "Check Safety"

4. **Look for these indicators:**
   - ✅ **"Check Method: Google Safe Browsing API"** (green checkmark)
   - ✅ No warning messages about API being unavailable

5. **If you see errors:**
   - Check that the API key is correct (no extra spaces)
   - Verify the API is enabled in Google Cloud Console
   - Check backend logs for specific error messages

---

## Troubleshooting

### ❌ "Invalid API key" error
- Double-check you copied the entire API key
- Make sure there are no spaces before/after the key
- Verify the API key is restricted to "Safe Browsing API" only

### ❌ "API not enabled" error
- Go back to Google Cloud Console
- Check that "Safe Browsing API" shows as "Enabled"
- If not, click "Enable" again

### ❌ "Rate limit exceeded"
- Free tier: 10,000 requests/day
- You've hit the limit - wait 24 hours or upgrade to paid tier

### ❌ Still using "Pattern Matching"?
- Check your `.env` file has the correct variable name
- Restart your backend server after adding the key
- Check backend logs for error messages

---

## Need More Help?

See the detailed guide: [GOOGLE_SAFE_BROWSING_SETUP.md](GOOGLE_SAFE_BROWSING_SETUP.md)

---

## Quick Reference

**API Key Location:**
- Google Cloud Console → APIs & Services → Credentials

**Environment Variable:**
```env
GOOGLE_SAFE_BROWSING_API_KEY=your_key_here
```

**Free Tier Limits:**
- 10,000 requests per day
- 1,000 requests per 100 seconds

**Test URL:**
- Safe: `https://www.google.com`
- Test your setup with this URL first!



