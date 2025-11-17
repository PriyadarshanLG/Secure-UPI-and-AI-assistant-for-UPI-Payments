import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { createAuditLog } from '../utils/auditLogger.js';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Suspicious URL patterns (URL shorteners)
const SUSPICIOUS_PATTERNS = [
  /bit\.ly/i,
  /tinyurl\.com/i,
  /t\.co/i,
  /goo\.gl/i,
  /ow\.ly/i,
  /is\.gd/i,
  /short\.link/i,
  /shorte\.st/i,
  /adf\.ly/i,
  /bc\.vc/i,
  /tiny\.cc/i,
  /rebrand\.ly/i,
  /cutt\.ly/i,
];

// Known malicious TLDs (Top Level Domains)
const SUSPICIOUS_TLDS = [
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.download', '.stream', '.online', '.site', '.website'
];

// Common WhatsApp scam patterns
const WHATSAPP_SCAM_PATTERNS = [
  // Fake bank/UPI links
  /paytm[^a-z]|paytm-secure|paytm-update|paytm-verify/i,
  /phonepe[^a-z]|phonepe-secure|phonepe-update/i,
  /gpay[^a-z]|googlepay-secure|googlepay-update/i,
  /sbi[^a-z]|sbi-update|sbi-secure|sbi-verify/i,
  /hdfc[^a-z]|hdfc-update|hdfc-secure/i,
  /icici[^a-z]|icici-update|icici-secure/i,
  /axis[^a-z]|axis-update|axis-secure/i,
  // Lottery/Prize scams
  /lottery|prize|winner|claim.*reward|congratulations.*won/i,
  // Fake government links
  /gov[^a-z]|government-update|aadhaar-update|pan-update/i,
  // Suspicious keywords
  /verify.*account|update.*details|urgent.*action|limited.*time|click.*now/i,
];

// Check if URL is suspicious based on patterns
const checkSuspiciousPatterns = (url) => {
  const issues = [];
  const lowerUrl = url.toLowerCase();
  
  // Check for suspicious URL shorteners
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      issues.push('URL shortener detected - may hide actual destination');
      break;
    }
  }
  
  // Check for suspicious TLDs
  for (const tld of SUSPICIOUS_TLDS) {
    if (lowerUrl.includes(tld)) {
      issues.push(`Suspicious TLD detected: ${tld}`);
      break;
    }
  }
  
  // Check for WhatsApp scam patterns
  for (const pattern of WHATSAPP_SCAM_PATTERNS) {
    if (pattern.test(lowerUrl)) {
      issues.push('Potential WhatsApp scam pattern detected');
      break;
    }
  }
  
  // Check for private/suspicious IP addresses (more lenient)
  const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
  const ipMatch = url.match(ipPattern);
  if (ipMatch) {
    const ip = ipMatch[0];
    const parts = ip.split('.').map(Number);
    // Only flag private IPs or unusual patterns
    if ((parts[0] === 10) || 
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        (parts[0] === 127) ||
        (parts[0] === 0) ||
        (parts.some(p => p > 255))) {
      issues.push('Private or invalid IP address detected');
    }
  }
  
  // Check for excessive subdomains (count actual subdomain levels, not dots in paths)
  try {
    const urlObj = new URL(url);
    const hostnameParts = urlObj.hostname.split('.');
    // Normal is 2-3 parts (domain.com or subdomain.domain.com)
    // Flag if more than 5 parts (e.g., a.b.c.d.e.domain.com)
    if (hostnameParts.length > 5) {
      issues.push('Excessive subdomains detected');
    }
  } catch (e) {
    // If URL parsing fails, skip this check
  }
  
  // Check for suspicious characters (more lenient - allow common URL chars)
  // Only flag truly unusual characters that shouldn't be in URLs
  if (/[<>{}|\\^`\[\]]/.test(url)) {
    issues.push('Unusual characters detected in URL');
  }
  
  // Check for typosquatting (common brand names with variations)
  const brandTypos = [
    /payt[m1]n|payt[m1]m|pay[t1]m/i, // paytm variations
    /phonep[e3]|phonepe[^a-z]/i, // phonepe variations
    /googl[e3]pay|googlepay[^a-z]/i, // gpay variations
  ];
  for (const typo of brandTypos) {
    if (typo.test(lowerUrl) && !lowerUrl.includes('paytm.com') && !lowerUrl.includes('phonepe.com') && !lowerUrl.includes('googlepay.com')) {
      issues.push('Possible typosquatting detected (fake brand domain)');
      break;
    }
  }
  
  // Check for random character strings (common in scam URLs)
  // More lenient: only flag if there are multiple very long strings (30+ chars) without structure
  const longStrings = url.match(/[a-z0-9]{30,}/gi);
  if (longStrings && longStrings.length >= 3) {
    // Additional check: ensure they're not legitimate tokens (e.g., base64, UUIDs)
    const hasStructure = longStrings.some(str => 
      /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i.test(str) || // UUID
      /^[A-Za-z0-9+/]+=*$/.test(str) // Base64
    );
    if (!hasStructure) {
      issues.push('Multiple random character strings detected');
    }
  }
  
  return issues;
};

// Validate URL format
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Check URL with Google Safe Browsing API (if API key is available)
const checkGoogleSafeBrowsing = async (url) => {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  
  if (!apiKey) {
    logger.debug('Google Safe Browsing API key not configured, using pattern matching only');
    return null; // API key not configured
  }
  
  try {
    logger.debug(`Checking URL with Google Safe Browsing API: ${url}`);
    
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        client: {
          clientId: 'secure-upi',
          clientVersion: '1.0.0',
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      },
      {
        timeout: 10000, // Increased timeout for better reliability
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.data && response.data.matches && response.data.matches.length > 0) {
      logger.warn(`Google Safe Browsing detected threats for URL: ${url}`, {
        threats: response.data.matches,
      });
      return {
        isSafe: false,
        threats: response.data.matches.map(match => ({
          type: match.threatType,
          platform: match.platformType,
          metadata: match.threatEntryMetadata || null,
        })),
        source: 'google_safe_browsing',
      };
    }
    
    logger.debug(`Google Safe Browsing: URL appears safe - ${url}`);
    return { 
      isSafe: true,
      source: 'google_safe_browsing',
    };
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      // API returned an error response
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 400) {
        logger.error('Google Safe Browsing API: Invalid request', { error: errorData });
      } else if (status === 403) {
        logger.error('Google Safe Browsing API: Invalid API key or quota exceeded', { error: errorData });
      } else if (status === 429) {
        logger.warn('Google Safe Browsing API: Rate limit exceeded, falling back to pattern matching');
      } else {
        logger.error(`Google Safe Browsing API error (${status}):`, errorData);
      }
    } else if (error.request) {
      // Request was made but no response received
      logger.warn('Google Safe Browsing API: No response received, falling back to pattern matching');
    } else {
      // Error setting up the request
      logger.error('Google Safe Browsing API: Request setup error', { error: error.message });
    }
    
    return null; // API error, fall back to pattern matching
  }
};

// Check URL safety endpoint
router.post(
  '/check',
  [
    body('url')
      .notEmpty()
      .withMessage('URL is required')
      .isURL({ require_protocol: true })
      .withMessage('Valid URL with protocol (http:// or https://) is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { url } = req.body;
      
      // Validate URL format
      if (!isValidUrl(url)) {
        return res.status(400).json({ 
          error: 'Invalid URL format. Please include http:// or https://' 
        });
      }

      // Parse URL for analysis
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      // Check suspicious patterns
      const patternIssues = checkSuspiciousPatterns(url);
      
      // Check with Google Safe Browsing API (if available)
      let safeBrowsingResult = null;
      let safeBrowsingEnabled = !!process.env.GOOGLE_SAFE_BROWSING_API_KEY;
      
      try {
        safeBrowsingResult = await checkGoogleSafeBrowsing(url);
      } catch (error) {
        logger.warn('Safe Browsing check failed, using pattern matching only');
      }

      // Determine overall safety
      let isSafe = true;
      let safetyScore = 100;
      const warnings = [];
      const threats = [];
      let checkMethod = 'pattern_matching'; // Track which method was used

      // Reduce safety score based on pattern issues (reduced penalty)
      if (patternIssues.length > 0) {
        // Reduced from 15 to 8 points per issue to prevent false positives
        safetyScore -= patternIssues.length * 8;
        warnings.push(...patternIssues);
      }

      // Check Safe Browsing results
      if (safeBrowsingResult) {
        checkMethod = 'google_safe_browsing';
        if (!safeBrowsingResult.isSafe) {
          isSafe = false;
          safetyScore = 0;
          threats.push(...safeBrowsingResult.threats);
        } else {
          // If Safe Browsing says it's safe, boost the score
          // (pattern issues are still warnings, but not critical)
          if (safetyScore < 100) {
            safetyScore = Math.min(100, safetyScore + 20); // Boost but don't exceed 100
          }
        }
      } else {
        // If Safe Browsing not available, use pattern-based scoring
        // More lenient threshold: only mark unsafe if score is very low (< 50)
        if (safetyScore < 50) {
          isSafe = false;
        }
        if (safeBrowsingEnabled) {
          warnings.push('Google Safe Browsing check unavailable (API error), using pattern matching only');
        }
      }

      // Additional heuristics
      if (parsedUrl.hostname.includes('phishing') || 
          parsedUrl.hostname.includes('malware') ||
          parsedUrl.hostname.includes('virus')) {
        isSafe = false;
        safetyScore = 0;
        threats.push({ type: 'SUSPICIOUS_DOMAIN', platform: 'ANY_PLATFORM' });
      }

      // Ensure safety score is between 0 and 100
      safetyScore = Math.max(0, Math.min(100, safetyScore));

      // Determine status (more lenient thresholds)
      let status = 'safe';
      if (!isSafe || safetyScore < 40) {
        status = 'unsafe';
      } else if (safetyScore < 65) {
        // Only mark as suspicious if score is genuinely low
        status = 'suspicious';
      } else if (warnings.length >= 3 && safetyScore < 80) {
        // Multiple warnings with moderate score = suspicious
        status = 'suspicious';
      }
      // If score >= 65 and less than 3 warnings, status remains 'safe'

      // Audit log
      await createAuditLog({
        actorId: req.user._id,
        action: 'link_safety_check',
        targetType: 'URL',
        details: { 
          url: parsedUrl.hostname, // Log only hostname for privacy
          status,
          safetyScore,
          hasThreats: threats.length > 0,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({
        url: parsedUrl.href,
        hostname: parsedUrl.hostname,
        isSafe,
        status,
        safetyScore,
        warnings,
        threats,
        checkedAt: new Date().toISOString(),
        checkMethod, // Indicate which method was used
        safeBrowsingEnabled, // Indicate if Safe Browsing API is configured
        recommendations: isSafe 
          ? (warnings.length > 0 
              ? ['Proceed with caution. Review warnings before opening.']
              : ['Link appears safe to open.'])
          : ['DO NOT OPEN this link. It may contain malware or phishing content.'],
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get link check history (optional feature)
router.get(
  '/history',
  async (req, res, next) => {
    try {
      // This would require a LinkCheck model to store history
      // For now, return empty array
      res.json({
        checks: [],
        message: 'History feature coming soon',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

