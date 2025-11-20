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
  const regex = new RegExp(`${labelRegex.source}[^\\d]*([\\d.,]+\\s*[kKmM]?)`, 'i');
  const match = text.match(regex);
  if (!match) return 0;
  return normalizeNumber(match[1]);
};

const normalizeNumber = (value = '') => {
  if (!value) return 0;
  const cleaned = value.replace(/[, ]/g, '').toLowerCase();
  let multiplier = 1;
  if (cleaned.endsWith('k')) {
    multiplier = 1000;
  } else if (cleaned.endsWith('m')) {
    multiplier = 1_000_000;
  }
  const numeric = parseFloat(cleaned.replace(/[km]/g, ''));
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.round(numeric * multiplier);
};

const extractUsername = (text) => {
  const handle = text.match(/@([a-z0-9._]+)/i);
  if (handle) return handle[1];
  const firstLine = text.split('\n').map((line) => line.trim()).find(Boolean);
  return firstLine || 'unknown';
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
  return lines.slice(2).join(' ').slice(0, 300);
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

  const followers = extractCount(ocrText, /(followers?|subs)/i);
  const following = extractCount(ocrText, /(following|subscriptions)/i);
  const posts = extractCount(ocrText, /(posts?|tweets|updates)/i);

  const suspiciousHits = suspiciousKeywords.filter((keyword) => lowerText.includes(keyword));
  const shortLinkHits = detectShortLinks(lowerText);

  const profileMetadata = {
    accountAgeDays: 0,
    username: extractUsername(ocrText),
    displayName: extractDisplayName(ocrText),
    bio: extractBio(ocrText),
    hasDefaultAvatar: hasDefaultAvatarIndicator(analysis),
    urlPresent: detectUrlPresence(lowerText),
  };

  const contentFeatures = {
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
  };
};

export const analyzeProfileScreenshot = async (filePath) => {
  try {
    const mlResult = await analyzeImage(filePath);
    const synthesizedSignals = buildSignalsFromImage(mlResult);
    const verdict = analyzeSocialAccount(synthesizedSignals);

    return {
      ...verdict,
      metadata: {
        ...verdict.metadata,
        source: 'screenshot',
        ocrPreview: mlResult.ocrText?.slice(0, 600) || '',
        mlInsights: {
          fraudIndicators: mlResult.fraudIndicators || [],
          editIndicators: mlResult.editIndicators || [],
          isEdited: mlResult.isEdited,
          editConfidence: mlResult.editConfidence,
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



