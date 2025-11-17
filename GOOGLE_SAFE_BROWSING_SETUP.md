# Google Safe Browsing API Setup Guide

This guide explains how to set up Google Safe Browsing API for enhanced link safety checking in Secure UPI.

## Overview

Google Safe Browsing API provides real-time threat detection for URLs, checking against Google's database of known malicious sites. This significantly improves the accuracy of our link safety checker.

## Benefits

- **Real-time threat detection**: Checks URLs against Google's constantly updated threat database
- **Multiple threat types**: Detects malware, phishing, unwanted software, and potentially harmful applications
- **High accuracy**: Industry-standard threat detection used by Chrome and other browsers
- **Free tier available**: 10,000 requests per day (free tier)

## Getting Your API Key

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click on the project dropdown at the top
4. Click **"New Project"**
5. Enter a project name (e.g., "Secure UPI")
6. Click **"Create"**

### Step 2: Enable Safe Browsing API

1. In the Google Cloud Console, go to **"APIs & Services"** > **"Library"**
2. Search for **"Safe Browsing API"**
3. Click on **"Safe Browsing API"**
4. Click **"Enable"**

### Step 3: Create API Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"API Key"**
3. Your API key will be generated
4. **Important**: Click **"Restrict Key"** to secure it:
   - Under **"API restrictions"**, select **"Restrict key"**
   - Choose **"Safe Browsing API"** from the list
   - Click **"Save"**

### Step 4: Set Up Billing (Optional for Free Tier)

- The Safe Browsing API has a free tier: **10,000 requests per day**
- For production use, you may want to set up billing to avoid quota limits
- Go to **"Billing"** in the Google Cloud Console to set up billing account

## Configuration

### Option 1: Environment Variable (Recommended)

Add the API key to your `.env` file in the `backend` directory:

```env
GOOGLE_SAFE_BROWSING_API_KEY=your_api_key_here
```

### Option 2: Docker Environment

If using Docker, add to your `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - GOOGLE_SAFE_BROWSING_API_KEY=your_api_key_here
```

Or use an `.env` file that Docker Compose will automatically load.

### Option 3: Production Deployment

For production deployments (Heroku, Render, Railway, etc.):

1. Go to your platform's environment variables settings
2. Add: `GOOGLE_SAFE_BROWSING_API_KEY` = `your_api_key_here`
3. Restart your application

## Verification

After adding the API key, restart your backend server and check the logs. You should see:

- When checking a link: `Checking URL with Google Safe Browsing API: ...`
- If the API key is invalid: `Google Safe Browsing API: Invalid API key or quota exceeded`

## Testing

1. Start your backend server
2. Navigate to the Link Safety Checker page
3. Enter a test URL (try a known safe URL like `https://www.google.com`)
4. Check the response - it should include:
   - `checkMethod: "google_safe_browsing"` (if API key is working)
   - `safeBrowsingEnabled: true`

## API Quotas and Limits

### Free Tier
- **10,000 requests per day**
- **1,000 requests per 100 seconds**

### Paid Tier
- Contact Google Cloud for custom quotas
- Pricing: Check [Google Cloud Pricing](https://cloud.google.com/safebrowsing/pricing)

## Troubleshooting

### API Key Not Working

1. **Verify the key is correct**: Copy-paste the key again from Google Cloud Console
2. **Check API restrictions**: Ensure the key is restricted to Safe Browsing API only
3. **Check billing**: Free tier should work without billing, but verify your project status
4. **Check logs**: Look for specific error messages in backend logs

### Rate Limit Exceeded

- You've exceeded the free tier quota (10,000 requests/day)
- The system will automatically fall back to pattern matching
- Consider upgrading to paid tier or implementing request caching

### API Errors

- **400 Bad Request**: Invalid request format (check backend code)
- **403 Forbidden**: Invalid API key or quota exceeded
- **429 Too Many Requests**: Rate limit exceeded
- **Timeout**: Network issues (system falls back to pattern matching)

## Security Best Practices

1. **Never commit API keys to Git**: Always use environment variables
2. **Restrict API keys**: Only allow Safe Browsing API access
3. **Rotate keys regularly**: Change API keys periodically
4. **Monitor usage**: Check Google Cloud Console for unusual activity
5. **Use different keys**: Use separate keys for development and production

## Fallback Behavior

If the Google Safe Browsing API is unavailable (no API key, errors, rate limits), the system automatically falls back to:

- Pattern-based detection (URL shorteners, suspicious TLDs, etc.)
- Heuristic analysis (IP addresses, subdomain count, etc.)
- Domain reputation checks

The system will still provide safety assessments, but with reduced accuracy.

## Additional Resources

- [Google Safe Browsing API Documentation](https://developers.google.com/safe-browsing/v4)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Safe Browsing API Reference](https://developers.google.com/safe-browsing/v4/reference/rest/v4/threatMatches/find)

## Support

If you encounter issues:

1. Check backend logs for detailed error messages
2. Verify API key in Google Cloud Console
3. Test API key directly using curl or Postman
4. Check Google Cloud status page for service outages

---

**Note**: The link safety checker works without the Google Safe Browsing API, but adding it significantly improves threat detection accuracy.



