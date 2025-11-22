import { promises as fsPromises } from 'fs';
import { analyzeImage } from '../utils/mlService.js';
import { analyzeSocialAccount } from './socialAccountDetector.js';
import logger from '../utils/logger.js';

const suspiciousKeywords = [
  'giveaway',
  'crypto',
  'airdrops',
  'double your money',
  'investment',
  'promo code',
  'spam',
  'botnet',
];

const shortLinkRegex = /(bit\.ly|tinyurl|t\.co|cutt\.ly|is\.gd|rb\.gy|shorturl|lnkd\.in)/gi;

const extractCount = (text, labelRegex) => {
  if (!text || text.length === 0) {
    logger.warn(`Empty text provided for extraction with pattern: ${labelRegex.source}`);
    return 0;
  }
  
  // Log what we're searching for
  logger.info(`Extracting count for pattern: ${labelRegex.source}, text length: ${text.length}`);
  
  // Try multiple patterns for better extraction - STRICT for Instagram screenshots
  // Prioritize strict patterns first - numbers must be immediately adjacent to labels
  // Instagram format is typically: "937 followers", "868 following", "0 posts"
  const patterns = [
    // Pattern 1: "123 followers" or "123k followers" (NUMBER FIRST - Instagram's actual format)
    // Use word boundary to ensure we match the complete label
    new RegExp(`(\\d+[\\d.,\\s]*[kKmM]?)\\s+${labelRegex.source}\\b`, 'i'),
    // Pattern 2: "followers 123" or "followers: 123" (label first, number after)
    // Use word boundary before label to avoid partial matches
    new RegExp(`\\b${labelRegex.source}\\s+(\\d+[\\d.,\\s]*[kKmM]?)\\b`, 'i'),
    // Pattern 3: "followers:123" or "followers123" (no space, label first)
    new RegExp(`\\b${labelRegex.source}[\\s:]*(\\d+[\\d.,\\s]*[kKmM]?)\\b`, 'i'),
    // Pattern 4: Numbers on next line after label (common in UI) - but limit distance
    new RegExp(`\\b${labelRegex.source}[\\s\\n]{1,5}(\\d+[\\d.,\\s]*[kKmM]?)\\b`, 'i'),
    // Pattern 5: Numbers within 10 chars of label (very strict)
    new RegExp(`\\b${labelRegex.source}[^\\d]{0,10}(\\d+[\\d.,\\s]*[kKmM]?)\\b`, 'i'),
    // Pattern 6: Handle numbers with spaces (e.g., "1 234" or "12 345") - but close to label
    new RegExp(`\\b${labelRegex.source}[\\s:,\\-]{0,5}(\\d+[\\d\\s.,]{1,10}[kKmM]?)\\b`, 'i'),
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    try {
      const regex = patterns[i];
      const match = text.match(regex);
      if (match && match[1]) {
        const normalized = normalizeNumber(match[1]);
        if (normalized > 0) {
          logger.info(`✅ Extracted count using pattern ${i + 1}: ${regex.source} -> ${normalized}`);
          return normalized;
        }
      }
    } catch (e) {
      logger.warn(`Pattern ${i + 1} failed: ${e.message}`);
      // Continue to next pattern
    }
  }
  
  // Fallback: Look for numbers near the label (STRICT - very close proximity only)
  logger.warn(`All patterns failed, trying strict context-based fallback for: ${labelRegex.source}`);
  
  // Find the position of the label in the text
  const labelMatch = text.match(new RegExp(`\\b${labelRegex.source}\\b`, 'i'));
  if (labelMatch && labelMatch.index !== undefined) {
    const labelPos = labelMatch.index;
    // Use very tight context - only 15 characters before and after label
    const contextStart = Math.max(0, labelPos - 15);
    const contextEnd = Math.min(text.length, labelPos + labelMatch[0].length + 15);
    const context = text.substring(contextStart, contextEnd);
    
    logger.info(`Looking for numbers in tight context around label: "${context}"`);
    
    // Find all numbers in the tight context
    const contextNumbers = context.match(/(\d+[\d.,\s]*[kKmM]?)/gi);
    if (contextNumbers && contextNumbers.length > 0) {
      // Try numbers in order of proximity to label
      for (const numStr of contextNumbers) {
        const num = normalizeNumber(numStr);
        if (num > 0 && num < 1000000000) { // Reasonable range for followers
          logger.info(`Fallback: Found number ${num} in tight context near label, using as potential ${labelRegex.source}`);
          return num;
        }
      }
    }
  }
  
  // Last resort: look for any numbers in entire text (but log warning)
  const allNumbers = text.match(/([\d.,]+[kKmM]?)/gi);
  if (allNumbers && allNumbers.length > 0) {
    logger.warn(`⚠️ Using last resort fallback - extracting any number from text (may be inaccurate)`);
    logger.warn(`Found ${allNumbers.length} numbers in text: ${allNumbers.join(', ')}`);
    for (const numStr of allNumbers) {
      const num = normalizeNumber(numStr);
      if (num > 0 && num < 1000000000) {
        logger.warn(`⚠️ Using number ${num} as fallback for ${labelRegex.source} (may be wrong)`);
        return num;
      }
    }
  }
  
  // Last resort: Show what text we're working with
  logger.error(`❌ Could not extract count for ${labelRegex.source}`);
  logger.error(`Text preview (first 500 chars): ${text.slice(0, 500)}`);
  logger.error(`Text contains label: ${labelRegex.test(text)}`);
  return 0;
};

const normalizeNumber = (value = '') => {
  if (!value) return 0;
  
  // Clean the value - remove spaces, commas, and fix common OCR errors
  let cleaned = value.toString().trim();
  
  // Fix common OCR errors: O -> 0, I -> 1, l -> 1
  cleaned = cleaned.replace(/[Oo]/g, '0').replace(/[Il]/g, '1');
  
  // Remove spaces and commas (for numbers like "1 234" or "1,234")
  cleaned = cleaned.replace(/[, ]/g, '');
  
  // Extract multiplier suffix (k, K, m, M)
  cleaned = cleaned.toLowerCase();
  let multiplier = 1;
  if (cleaned.endsWith('k')) {
    multiplier = 1000;
    cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith('m')) {
    multiplier = 1_000_000;
    cleaned = cleaned.slice(0, -1);
  }
  
  // Parse the numeric value
  const numeric = parseFloat(cleaned);
  if (Number.isNaN(numeric) || numeric < 0) {
    return 0;
  }
  
  const result = Math.round(numeric * multiplier);
  logger.info(`Normalized "${value}" -> ${result} (multiplier: ${multiplier})`);
  return result;
};

const extractUsername = (text) => {
  // Try multiple Instagram username patterns
  // Pattern 1: @username (most common)
  let handle = text.match(/@([a-z0-9._]+)/i);
  if (handle) {
    const username = handle[1];
    // Validate Instagram username format (1-30 chars, alphanumeric, dots, underscores)
    if (username.length >= 1 && username.length <= 30 && /^[a-z0-9._]+$/i.test(username)) {
      return username;
    }
  }
  
  // Pattern 2: instagram.com/username
  handle = text.match(/instagram\.com\/([a-z0-9._]+)/i);
  if (handle) {
    const username = handle[1];
    if (username.length >= 1 && username.length <= 30 && /^[a-z0-9._]+$/i.test(username)) {
      return username;
    }
  }
  
  // Pattern 3: username on first line (if it looks like a valid Instagram handle)
  const firstLine = text.split('\n').map((line) => line.trim()).find(Boolean);
  if (firstLine) {
    // Remove @ if present
    const cleanLine = firstLine.replace(/^@/, '').split(/\s/)[0];
    if (cleanLine.length >= 1 && cleanLine.length <= 30 && /^[a-z0-9._]+$/i.test(cleanLine)) {
      return cleanLine;
    }
  }
  
  return 'unknown';
};

const extractDisplayName = (text) => {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return 'Unknown Profile';
  if (lines[0].startsWith('@') && lines.length > 1) {
    return lines[1];
  }
  return lines[0];
};

const detectShortLinks = (text) => {
  const matches = text.match(shortLinkRegex);
  return matches ? matches.length : 0;
};

const detectUrlPresence = (text) => /https?:\/\//i.test(text) || detectShortLinks(text) > 0;

const extractBio = (text) => {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 2) return '';
  // Skip username and display name lines, get bio
  return lines.slice(2).join(' ').slice(0, 300);
};

const extractAccountAge = (text) => {
  // Try to extract account age from OCR text
  const lowerText = text.toLowerCase();
  
  // Pattern 1: "Joined [date]" or "Member since [date]"
  const joinedMatch = text.match(/(?:joined|member since|created|since)\s+([a-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4})/i);
  if (joinedMatch) {
    try {
      const dateStr = joinedMatch[1];
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, daysSince);
      }
    } catch (e) {
      // Date parsing failed, continue
    }
  }
  
  // Pattern 2: "X years ago" or "X months ago" or "X days ago"
  const agoMatch = text.match(/(\d+)\s+(year|month|day|yr|mo|d)s?\s+ago/i);
  if (agoMatch) {
    const value = parseInt(agoMatch[1], 10);
    const unit = agoMatch[2].toLowerCase();
    if (unit.startsWith('year') || unit === 'yr') {
      return value * 365;
    } else if (unit.startsWith('month') || unit === 'mo') {
      return value * 30;
    } else if (unit.startsWith('day') || unit === 'd') {
      return value;
    }
  }
  
  // Pattern 3: Look for dates in common formats
  const datePatterns = [
    /\b(\d{4})\b/, // Year only (e.g., "2020")
    /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/, // MM/DD/YYYY
    /\b([a-z]+)\s+(\d{1,2}),?\s+(\d{4})\b/i, // Month DD, YYYY
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const date = new Date(match[0]);
        if (!isNaN(date.getTime()) && date.getFullYear() >= 2010 && date.getFullYear() <= new Date().getFullYear()) {
          const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSince >= 0 && daysSince <= 3650) { // Reasonable range: 0-10 years
            return daysSince;
          }
        }
      } catch (e) {
        // Continue to next pattern
      }
    }
  }
  
  // Default: return 0 if we can't determine (will trigger "new account" flag)
  return 0;
};

const hasDefaultAvatarIndicator = (analysis) => {
  const indicators = [
    ...(analysis.fraudIndicators || []),
    ...(analysis.editIndicators || []),
  ]
    .join(' ')
    .toLowerCase();
  return indicators.includes('default avatar') || indicators.includes('placeholder');
};

const buildSignalsFromImage = (analysis) => {
  const ocrText = analysis.ocrText || '';
  const lowerText = ocrText.toLowerCase();

  // Log full OCR text for debugging
  logger.info('=== FULL OCR TEXT RECEIVED ===');
  logger.info(`OCR Text Length: ${ocrText.length}`);
  logger.info(`OCR Text Preview (first 1000 chars):\n${ocrText.slice(0, 1000)}`);
  logger.info(`Has "followers": ${/followers?/i.test(ocrText)}`);
  logger.info(`Has "following": ${/following|follows?/i.test(ocrText)}`);
  logger.info(`Has "posts": ${/posts?/i.test(ocrText)}`);
  logger.info(`All numbers found: ${(ocrText.match(/([\d.,]+[kKmM]?)/gi) || []).join(', ')}`);
  logger.info('=== END OCR TEXT ===');

  // Improved extraction with multiple patterns - try various label variations
  // Extract followers, following, and posts - prioritize Instagram format
  // Instagram format: "937 followers", "868 following", "0 posts"
  
  // ULTRA-STRICT extraction: Only match numbers that are DIRECTLY next to labels
  // Instagram format: "937 followers", "868 following", "0 posts"
  // NO FALLBACKS - only extract if we find exact pattern match
  
  // Extract followers - MUST be number immediately before "followers" (Instagram format)
  let followers = 0;
  const followersExact = ocrText.match(/(\d+)\s+followers?\b/i);
  if (followersExact && followersExact[1]) {
    followers = parseInt(followersExact[1], 10);
    logger.info(`✅ Extracted followers (exact): ${followers}`);
  } else {
    // Try with label first format
    const followersReverse = ocrText.match(/\bfollowers?\s+(\d+)\b/i);
    if (followersReverse && followersReverse[1]) {
      followers = parseInt(followersReverse[1], 10);
      logger.info(`✅ Extracted followers (reverse): ${followers}`);
    }
  }
  
  // Extract following - MUST be number immediately before "following" (Instagram format)
  let following = 0;
  const followingExact = ocrText.match(/(\d+)\s+following\b/i);
  if (followingExact && followingExact[1]) {
    following = parseInt(followingExact[1], 10);
    logger.info(`✅ Extracted following (exact): ${following}`);
  } else {
    // Try OCR-tolerant version
    const followingOCR = ocrText.match(/(\d+)\s+follow[i1l][nmg]+\b/i);
    if (followingOCR && followingOCR[1]) {
      following = parseInt(followingOCR[1], 10);
      logger.info(`✅ Extracted following (OCR-tolerant): ${following}`);
    } else {
      // Try reverse format
      const followingReverse = ocrText.match(/\bfollowing\s+(\d+)\b/i);
      if (followingReverse && followingReverse[1]) {
        following = parseInt(followingReverse[1], 10);
        logger.info(`✅ Extracted following (reverse): ${following}`);
      }
    }
  }
  
  // Extract posts - MUST be number immediately before "posts"
  let posts = 0;
  const postsExact = ocrText.match(/(\d+)\s+posts?\b/i);
  if (postsExact && postsExact[1]) {
    posts = parseInt(postsExact[1], 10);
    logger.info(`✅ Extracted posts (exact): ${posts}`);
  } else {
    const postsReverse = ocrText.match(/\bposts?\s+(\d+)\b/i);
    if (postsReverse && postsReverse[1]) {
      posts = parseInt(postsReverse[1], 10);
      logger.info(`✅ Extracted posts (reverse): ${posts}`);
    }
  }
  
  // NO FALLBACKS - if we didn't find exact matches, keep as 0
  // This prevents matching wrong numbers from other parts of the image
  
  // Log initial extraction results
  logger.info('Initial extraction results:', { followers, following, posts });
  
  // ALWAYS try to extract ALL numbers from OCR text as fallback
  // This helps even when labels aren't found
  const allNumbers = ocrText.match(/([\d.,]+[kKmM]?)/gi) || [];
  const normalizedNumbers = allNumbers
    .map(n => normalizeNumber(n))
    .filter(n => n > 0 && n < 1000000000) // Reasonable range for social media
    .sort((a, b) => b - a); // Sort descending (largest first)
  
  logger.info(`Found ${normalizedNumbers.length} numbers in OCR: ${normalizedNumbers.join(', ')}`);
  
  // If extraction failed, try ONE MORE TIME with slightly more flexible patterns
  // But still very strict - only if exact match completely failed
  if (followers === 0) {
    const followersFlexible = ocrText.match(/(\d{1,7})\s*[^\w]*followers?\b/i);
    if (followersFlexible && followersFlexible[1]) {
      followers = parseInt(followersFlexible[1], 10);
      logger.info(`✅ Extracted followers (flexible): ${followers}`);
    }
  }
  
  if (following === 0) {
    const followingFlexible = ocrText.match(/(\d{1,7})\s*[^\w]*follow[i1l][nmg]+\b/i) ||
                             ocrText.match(/(\d{1,7})\s*[^\w]*following\b/i);
    if (followingFlexible && followingFlexible[1]) {
      following = parseInt(followingFlexible[1], 10);
      logger.info(`✅ Extracted following (flexible): ${following}`);
    }
  }
  
  if (posts === 0) {
    const postsFlexible = ocrText.match(/(\d{1,7})\s*[^\w]*posts?\b/i);
    if (postsFlexible && postsFlexible[1]) {
      posts = parseInt(postsFlexible[1], 10);
      logger.info(`✅ Extracted posts (flexible): ${posts}`);
    }
  }
  
  // CRITICAL: Never assign the same number to multiple fields
  // If extraction still failed, DON'T use fallback numbers - keep as 0
  if (followers === 0 || following === 0 || posts === 0) {
    logger.warn('Some extraction failed, attempting improved extraction:', { 
      followers, 
      following, 
      posts,
      totalNumbersFound: normalizedNumbers.length,
      uniqueNumbers: [...new Set(normalizedNumbers)].join(', ')
    });
    
    // Try to re-extract with better context if primary extraction failed
    // Extract numbers that appear near their specific labels in the OCR text
    // Instagram format: "937 followers", "868 following", "0 posts"
    
    if (followers === 0 || (followers > 0 && followers === following && followers === posts)) {
      // Try multiple patterns for followers
      const followersPatterns = [
        /(\d+[\d.,\s]*[kKmM]?)\s+followers?/i,  // "937 followers"
        /followers?\s+(\d+[\d.,\s]*[kKmM]?)/i,  // "followers 937"
        /(\d+)\s*followers?/i,                  // "937 followers" (strict)
      ];
      
      for (const pattern of followersPatterns) {
        const match = ocrText.match(pattern);
        if (match && match[1]) {
          const extracted = normalizeNumber(match[1]);
          if (extracted > 0 && extracted !== following && extracted !== posts) {
            followers = extracted;
            logger.info(`✅ Re-extracted followers: ${followers}`);
            break;
          }
        }
      }
    }
    
    if (following === 0 || (following > 0 && following === followers && following === posts)) {
      // Try multiple patterns for following - handle OCR errors
      const followingPatterns = [
        /(\d+[\d.,\s]*[kKmM]?)\s+follow[i1l][nmg]+/i,   // "868 following" (OCR tolerant)
        /(\d+[\d.,\s]*[kKmM]?)\s+following/i,           // "868 following" (exact)
        /follow[i1l][nmg]+\s+(\d+[\d.,\s]*[kKmM]?)/i,   // "following 868" (OCR tolerant)
        /following\s+(\d+[\d.,\s]*[kKmM]?)/i,           // "following 868" (exact)
        /(\d+)\s*follow[i1l][nmg]+/i,                   // "868 following" (strict, OCR tolerant)
        /(\d+)\s*following/i,                           // "868 following" (strict)
      ];
      
      for (const pattern of followingPatterns) {
        const match = ocrText.match(pattern);
        if (match && match[1]) {
          const extracted = normalizeNumber(match[1]);
          if (extracted > 0 && extracted !== followers && extracted !== posts) {
            following = extracted;
            logger.info(`✅ Re-extracted following: ${following}`);
            break;
          }
        }
      }
      
      // If still 0, try to find "following" label and get number near it
      if (following === 0) {
        const followingLabelPos = ocrText.search(/follow[i1l][nmg]+|following/i);
        if (followingLabelPos !== -1) {
          // Look for numbers within 30 characters before or after "following"
          const contextStart = Math.max(0, followingLabelPos - 30);
          const contextEnd = Math.min(ocrText.length, followingLabelPos + 50);
          const context = ocrText.substring(contextStart, contextEnd);
          
          // Find all numbers in this context
          const contextNumbers = context.match(/(\d+[\d.,\s]*[kKmM]?)/gi);
          if (contextNumbers && contextNumbers.length > 0) {
            for (const numStr of contextNumbers) {
              const extracted = normalizeNumber(numStr);
              if (extracted > 0 && extracted !== followers && extracted !== posts && extracted < 100000000) {
                following = extracted;
                logger.info(`✅ Re-extracted following from context: ${following}`);
                break;
              }
            }
          }
        }
      }
    }
    
    // Posts extraction (for display only, not used in fake detection)
    if (posts === 0 || (posts > 0 && posts === followers && posts === following)) {
      const postsPatterns = [
        /(\d+[\d.,\s]*[kKmM]?)\s+posts?/i,       // "0 posts"
        /posts?\s+(\d+[\d.,\s]*[kKmM]?)/i,      // "posts 0"
        /(\d+)\s*posts?/i,                       // "0 posts" (strict)
      ];
      
      for (const pattern of postsPatterns) {
        const match = ocrText.match(pattern);
        if (match && match[1]) {
          const extracted = normalizeNumber(match[1]);
          if (extracted >= 0 && extracted !== followers && extracted !== following) {
            posts = extracted;
            logger.info(`✅ Re-extracted posts: ${posts}`);
            break;
          }
        }
      }
    }
    
    // DO NOT use fallback numbers - this causes wrong extraction
    // If we couldn't find numbers next to labels, they're probably not there
    logger.warn(`⚠️ Some fields still 0 after extraction. NOT using fallback numbers to avoid wrong values.`, {
      followers,
      following,
      posts,
      allNumbersInOCR: normalizedNumbers.join(', ')
    });
  } else {
    // Primary extraction worked for all fields
    logger.info(`✅ Primary extraction succeeded for all fields.`);
  }
  
  // Final validation: Ensure we never have the same number for all three
  if (followers > 0 && following > 0 && posts > 0 && followers === following && following === posts) {
    logger.error(`❌ ERROR: All three stats have the same value (${followers}). This indicates extraction failure.`);
    // Reset to 0 to trigger proper fake detection
    if (followers === following) {
      following = 0;
    }
    if (posts === followers) {
      posts = 0;
    }
  }
  
  // NO MORE FALLBACKS - if extraction failed, keep as 0
  // This ensures we only show numbers that are actually next to the labels
  
  // Final validation: Check if extracted values make sense
  // Instagram accounts typically have: followers >= following (usually)
  // But allow following > followers for some accounts
  if (followers > 0 && following > 0) {
    // If following is way larger than followers, might be wrong
    if (following > followers * 5 && followers > 100) {
      logger.warn(`⚠️ Suspicious: following (${following}) is much larger than followers (${followers}). May be extraction error.`);
    }
  }
  
  // Final log of extracted stats
  logger.info('=== FINAL EXTRACTED STATS ===');
  logger.info({
    followers,
    following,
    posts,
    ocrTextLength: ocrText.length,
    allNumbersInOCR: normalizedNumbers.join(', '),
    ocrPreview: ocrText.slice(0, 500),
  });
  logger.info('=== END FINAL STATS ===');

  const suspiciousHits = suspiciousKeywords.filter((keyword) => lowerText.includes(keyword));
  const shortLinkHits = detectShortLinks(lowerText);

  // Extract username and validate
  const username = extractUsername(ocrText);
  const isUsernameValid = username !== 'unknown' && username.length >= 1 && username.length <= 30;
  
  // Extract account age
  const accountAgeDays = extractAccountAge(ocrText);
  
  // Calculate data quality score for confidence calculation
  let dataQualityScore = 0;
  if (isUsernameValid) dataQualityScore += 0.2;
  if (followers > 0 || following > 0) dataQualityScore += 0.2;
  if (posts > 0) dataQualityScore += 0.15;
  if (accountAgeDays > 0) dataQualityScore += 0.15;
  const bio = extractBio(ocrText);
  if (bio.length > 0) dataQualityScore += 0.15;
  if (followers > 0 && following > 0) dataQualityScore += 0.15; // Both stats present

  const profileMetadata = {
    accountAgeDays,
    username,
    displayName: extractDisplayName(ocrText),
    bio,
    hasDefaultAvatar: hasDefaultAvatarIndicator(analysis),
    urlPresent: detectUrlPresence(lowerText),
    _dataQualityScore: dataQualityScore, // Internal metric for confidence
  };

  const contentFeatures = {
    posts: posts, // Add posts count to contentFeatures for easy access
    duplicateTextRatio: suspiciousHits.length > 2 ? 0.7 : 0.2,
    avgPostLength: posts > 0 ? 60 : 0,
    maliciousLinkRatio: Math.min(1, shortLinkHits / 3),
    languageDiversityScore: suspiciousHits.length > 0 ? 0.1 : 0.5,
    postingCadenceStdDev: suspiciousHits.length > 0 ? 0.2 : 0.8,
  };

  const automationIndicators = [];
  if (suspiciousHits.length) {
    automationIndicators.push(`keywords:${suspiciousHits.slice(0, 3).join(',')}`);
  }
  if (shortLinkHits > 0) {
    automationIndicators.push('short_links_detected');
  }

  const behaviorPatterns = {
    postsPerDay: posts > 0 ? Math.min(80, posts / 30) : 0,
    activeHoursMismatched: false,
    burstSessions: suspiciousHits.length,
    automationIndicators,
    engagementSkewScore: followers === 0 ? 0.8 : Math.min(1, following / Math.max(1, followers * 5)),
  };

  const networkSignals = {
    followers,
    following,
    clustersWithKnownBots: suspiciousHits.includes('botnet'),
    graphAnomalyScore: followers > 0 && following > 0
      ? Math.min(1, following / Math.max(followers, 1))
      : 0.3,
    reciprocityRatio: followers > 0 && following > 0 ? followers / following : 0,
  };

  const multimediaSignals = {
    reverseImageHit: analysis.fraudIndicators?.some((item) =>
      /reverse|stock/i.test(item)
    ) || false,
    exifMismatch: analysis.editIndicators?.some((item) =>
      /metadata/i.test(item)
    ) || false,
    deepfakeConfidence: analysis.editConfidence || 0,
    mediaReusedCount: analysis.fraudIndicators?.length || 0,
  };

  // Add Instagram-specific validation
  const instagramValidation = {
    usernameFormatValid: isUsernameValid,
    usernameLengthValid: username.length >= 1 && username.length <= 30,
    hasFollowers: followers > 0,
    hasFollowing: following > 0,
    hasPosts: posts > 0,
    hasBio: bio.length > 0,
    suspiciousPatterns: suspiciousHits.length,
  };

  return {
    profileMetadata,
    contentFeatures,
    behaviorPatterns,
    networkSignals,
    multimediaSignals,
    identitySignals: {
      phoneVerified: false,
      emailVerified: false,
      twoFactorEnabled: false,
      govIdVerified: false,
      paymentVerified: false,
    },
    deviceMetadata: {
      ipReputationScore: 0,
      vpnOrProxy: false,
      deviceFingerprintCount: 1,
      geoConsistencyScore: 0.5,
    },
    reportSignals: {
      userReports: suspiciousHits.length,
      confirmedAbuseCases: 0,
      manualReviewFlags: 0,
      enforcementHistory: 0,
    },
    externalIntel: {
      matchedFraudList: suspiciousHits.includes('spam'),
      leakedCredentialMatch: false,
      maliciousDomainMatch: shortLinkHits > 0,
    },
    _instagramValidation: instagramValidation, // Internal validation metrics
  };
};

export const analyzeProfileScreenshot = async (filePath) => {
  try {
    const mlResult = await analyzeImage(filePath);
    const synthesizedSignals = buildSignalsFromImage(mlResult);
    
    // Calculate actual confidence based on data quality
    const dataQualityScore = synthesizedSignals.profileMetadata?._dataQualityScore || 0;
    const actualConfidence = Math.min(1.0, Math.max(0.3, dataQualityScore)); // Between 30% and 100%
    
    const verdict = analyzeSocialAccount(synthesizedSignals);
    
    // Override confidence with actual data quality-based confidence
    const finalConfidence = actualConfidence;
    
    // Get Instagram validation info
    const instagramValidation = synthesizedSignals._instagramValidation || {};

    return {
      ...verdict,
      metadata: {
        ...verdict.metadata,
        source: 'screenshot',
        confidence: finalConfidence, // Use calculated confidence instead of default
        ocrPreview: mlResult.ocrText?.slice(0, 600) || '',
        mlInsights: {
          fraudIndicators: mlResult.fraudIndicators || [],
          editIndicators: mlResult.editIndicators || [],
          isEdited: mlResult.isEdited,
          editConfidence: mlResult.editConfidence,
        },
        instagramValidation: {
          usernameDetected: instagramValidation.usernameFormatValid,
          username: synthesizedSignals.profileMetadata?.username || 'unknown',
          dataQuality: Math.round(dataQualityScore * 100),
        },
      },
      synthesizedSignals,
    };
  } catch (error) {
    logger.error('Profile screenshot analysis failed:', error);
    throw error;
  } finally {
    try {
      await fsPromises.unlink(filePath);
    } catch (cleanupError) {
      logger.warn('Failed to remove temp screenshot:', cleanupError.message);
    }
  }
};

export default {
  analyzeProfileScreenshot,
};





