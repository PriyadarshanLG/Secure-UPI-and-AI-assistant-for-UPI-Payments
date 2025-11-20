import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import axios from 'axios';
import logger from '../utils/logger.js';
import { createAuditLog } from '../utils/auditLogger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    const allowedMimes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav',
      'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/aac',
      'audio/flac', 'audio/amr', 'audio/3gpp'
    ];
    
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  },
});

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Check ML service health with retry
 */
async function checkMLServiceHealth(maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 5000 });
      if (response.data.status === 'healthy') {
        return { available: true, dependencies: response.data.dependencies || {} };
      }
    } catch (error) {
      if (attempt < maxRetries - 1) {
        logger.warn(`ML service health check failed (attempt ${attempt + 1}/${maxRetries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        return { 
          available: false, 
          error: error.message,
          code: error.code 
        };
      }
    }
  }
  return { available: false, error: 'Health check failed after retries' };
}

/**
 * Basic voice analysis without ML service
 * Performs simple file-based checks and pattern detection
 */
function basicVoiceAnalysis(file) {
  // Collect qualitative reasoning so the frontend can explain why a score was chosen
  const indicators = [];
  const spamIndicators = [];
  const positiveSignals = [];
  let deepfakeScore = 0.0;
  const detectionMethods = ['Basic File Analysis', 'Metadata Check', 'Pattern Detection'];

  // Helper to add risk with a consistent structure
  const addRisk = (score, message, bucket = indicators) => {
    bucket.push(message);
    deepfakeScore += score;
  };

  // File size analysis
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB < 0.005) {
    addRisk(25, 'Tiny audio file - often associated with test or synthetic clips');
  } else if (fileSizeMB < 0.02) {
    addRisk(8, 'Very small audio payload - limited speech evidence');
  } else if (fileSizeMB > 20) {
    addRisk(10, 'Very large audio - may contain stitched content');
  } else {
    positiveSignals.push('File size looks typical for short voice samples');
  }

  // File type / name analysis
  const mimeType = file.mimetype;
  const fileName = file.originalname.toLowerCase();
  const fileExt = fileName.split('.').pop();

  const suspiciousPatterns = ['ai_voice', 'deepfake', 'synthetic', 'generated', 'fake', 'test_voice'];
  for (const pattern of suspiciousPatterns) {
    if (fileName.includes(pattern)) {
      addRisk(30, `Suspicious filename pattern detected: "${pattern}"`);
    }
  }

  const spamPatterns = ['spam', 'robocall', 'automated', 'telemarketer', 'scam'];
  for (const pattern of spamPatterns) {
    if (fileName.includes(pattern)) {
      addRisk(35, `Filename suggests spam: "${pattern}"`, spamIndicators);
    }
  }

  const compressedFormats = ['mp3', 'aac', 'm4a', 'ogg'];
  const uncompressedFormats = ['wav', 'flac'];
  if (compressedFormats.includes(fileExt)) {
    // Compressed audio is common, so apply only a mild penalty
    addRisk(3, 'Compressed audio format - may hide artifacts but is common');
  } else if (uncompressedFormats.includes(fileExt)) {
    positiveSignals.push('Uncompressed format - usually recorded directly from source');
  }

  // Duration estimation (rough based on format heuristics)
  let estimatedDuration = 0;
  if (fileExt === 'mp3' || mimeType.includes('mpeg')) {
    estimatedDuration = fileSizeMB; // minutes
  } else if (fileExt === 'wav' || mimeType.includes('wav')) {
    estimatedDuration = fileSizeMB / 10; // minutes
  }

  if (estimatedDuration > 0) {
    if (estimatedDuration < 0.03) {
      addRisk(8, 'Extremely short audio (<2s) - risky if no other metadata');
    } else if (estimatedDuration < 0.15) {
      addRisk(4, 'Very short audio clip - limited speech for analysis');
    } else if (estimatedDuration > 5) {
      addRisk(15, 'Long audio duration - could be robocall style content', spamIndicators);
    } else {
      positiveSignals.push('Natural duration for the given file type');
    }
  }

  // Reward presence of positive indicators so everything is not marked suspicious
  if (positiveSignals.length > 0) {
    deepfakeScore = Math.max(deepfakeScore - 10, 0);
  }

  // Determine verdict using tiered thresholds to avoid every file being suspicious
  let verdict = 'real';
  let confidence = 0.25; // still low because we are not using ML features
  const isSpam = deepfakeScore >= 70 && spamIndicators.length > 0;
  const isDeepfake = deepfakeScore >= 80;

  if (isSpam) {
    verdict = 'spam';
    confidence = 0.45;
  } else if (isDeepfake) {
    verdict = 'suspicious';
    confidence = 0.4;
  } else if (deepfakeScore >= 45) {
    verdict = 'suspicious';
    confidence = 0.32;
  } else if (deepfakeScore >= 25) {
    verdict = 'real';
    indicators.push('Low-risk signals only — treat as genuine but continue monitoring');
  } else {
    indicators.push('No high-risk signals detected; file looks normal for basic checks');
  }

  return {
    isDeepfake: isDeepfake || isSpam,
    deepfakeScore: Math.min(deepfakeScore, 100),
    confidence,
    verdict,
    detectionMethods,
    indicators,
    spamIndicators,
    technicalDetails: {
      fileSize: file.size,
      fileSizeMB: fileSizeMB.toFixed(2),
      mimeType,
      fileName: file.originalname,
      estimatedDuration: estimatedDuration > 0 ? `${estimatedDuration.toFixed(2)} minutes` : 'unknown',
      positiveSignals,
      analysisType: 'basic',
      note: 'Full analysis requires ML service with librosa for spectral, MFCC, and pitch analysis'
    }
  };
}

/**
 * Detect AI-generated deepfake voice and spam calls
 */
router.post(
  '/detect',
  upload.single('audio'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No audio file uploaded',
          details: ['Please select an audio file to analyze']
        });
      }

      logger.info(`Voice deepfake detection request: ${req.file.originalname}, type: ${req.file.mimetype}, size: ${req.file.size} bytes`);

      // Check ML service availability
      const healthCheck = await checkMLServiceHealth();
      const useBasicAnalysis = !healthCheck.available;
      
      if (useBasicAnalysis) {
        logger.warn('ML service unavailable, using basic voice analysis fallback');
        
        // Perform basic analysis without ML service
        const basicResult = basicVoiceAnalysis(req.file);
        
        // Audit log
        await createAuditLog({
          actorId: req.user._id,
          action: 'voice_deepfake_detection',
          targetType: 'VoiceDeepfakeDetection',
          details: {
            fileName: req.file.originalname,
            verdict: basicResult.verdict,
            deepfakeScore: basicResult.deepfakeScore,
            isDeepfake: basicResult.isDeepfake,
            isSpam: basicResult.verdict === 'spam',
            analysisType: 'basic',
            mlServiceAvailable: false,
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });

        // Return basic analysis results
        return res.json({
          message: 'Basic voice analysis completed (ML service unavailable)',
          result: {
            ...basicResult,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            isSpam: basicResult.verdict === 'spam',
            warning: 'Using basic analysis. For full detection (spectral, MFCC, pitch analysis), start the ML service.',
            mlServiceUrl: ML_SERVICE_URL,
          },
        });
      }

      // Check if librosa is available (for voice detection)
      if (healthCheck.dependencies && healthCheck.dependencies.librosa === false) {
        logger.warn('librosa not available in ML service');
        return res.status(503).json({
          error: 'Voice detection not available',
          details: [
            'librosa is not installed in the ML service',
            'Voice deepfake detection requires librosa',
            '',
            'To install librosa:',
            '1. Stop the ML service (Ctrl+C)',
            '2. Run: py -m pip install librosa soundfile',
            '3. Restart the ML service',
            '',
            'Note: On Python 3.14, some dependencies may not be available',
            'Consider using Python 3.11 or 3.12 for full compatibility'
          ],
          mlServiceUrl: ML_SERVICE_URL,
        });
      }

      // Convert file to base64
      const base64Audio = req.file.buffer.toString('base64');

      // Call ML service
      try {
        logger.info(`Calling ML service at ${ML_SERVICE_URL}/api/voice/deepfake/detect`);
        logger.info(`Audio data size: ${base64Audio.length} characters (${(base64Audio.length * 3 / 4 / 1024).toFixed(2)} KB)`);
        
        const response = await axios.post(
          `${ML_SERVICE_URL}/api/voice/deepfake/detect`,
          {
            audio: base64Audio,
            format: 'base64',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 120000, // 2 minutes for audio processing
          }
        );

        logger.info(`ML service response received: status=${response.status}`);
        const result = response.data;
        
        // Validate response structure
        if (!result || typeof result !== 'object') {
          logger.error('Invalid ML service response: not an object');
          throw new Error('Invalid response from ML service');
        }
        
        logger.info(`Voice detection result: verdict=${result.verdict}, score=${result.deepfakeScore}, confidence=${result.confidence}`);

        // Audit log
        await createAuditLog({
          actorId: req.user._id,
          action: 'voice_deepfake_detection',
          targetType: 'VoiceDeepfakeDetection',
          details: {
            fileName: req.file.originalname,
            verdict: result.verdict,
            deepfakeScore: result.deepfakeScore,
            isDeepfake: result.isDeepfake,
            isSpam: result.verdict === 'spam',
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });

        // Return results
        res.json({
          message: 'Voice deepfake detection completed',
          result: {
            isDeepfake: result.isDeepfake,
            deepfakeScore: result.deepfakeScore,
            confidence: result.confidence,
            verdict: result.verdict,
            detectionMethods: result.detectionMethods || [],
            indicators: result.indicators || [],
            spamIndicators: result.spamIndicators || [],
            technicalDetails: result.technicalDetails || {},
            fileName: req.file.originalname,
            fileSize: req.file.size,
            isSpam: result.verdict === 'spam',
          },
        });
      } catch (mlError) {
        logger.error('ML service error:', {
          message: mlError.message,
          code: mlError.code,
          status: mlError.response?.status,
          data: mlError.response?.data,
        });
        
        // Handle connection errors
        if (mlError.code === 'ECONNREFUSED' || mlError.code === 'ETIMEDOUT' || mlError.code === 'ENOTFOUND') {
          return res.status(503).json({
            error: 'ML service unavailable',
            details: [
              `Cannot connect to ML service at ${ML_SERVICE_URL}`,
              'The ML service may have stopped. Please start it:',
              '1. Open a new terminal/command prompt',
              '2. Navigate to: cd ml-service',
              '3. Run: python main.py',
              'Or use: start-ml-service.bat (Windows)',
              '',
              `Service URL: ${ML_SERVICE_URL}`,
              '',
              'For voice detection, also ensure librosa is installed:',
              '  python -m pip install librosa soundfile'
            ],
            mlServiceUrl: ML_SERVICE_URL,
          });
        }

        // Handle ML service error responses
        if (mlError.response) {
          const errorMessage = mlError.response.data?.detail || 
                              mlError.response.data?.error || 
                              mlError.response.data?.message ||
                              `ML service returned status ${mlError.response.status}`;
          
          return res.status(mlError.response.status || 500).json({
            error: 'Voice deepfake detection failed',
            details: errorMessage,
            ...(process.env.NODE_ENV === 'development' && {
              mlServiceUrl: ML_SERVICE_URL,
              fullError: mlError.response.data,
            }),
          });
        }

        // Generic error
        return res.status(500).json({
          error: 'Voice deepfake detection failed',
          details: mlError.message || 'Unknown error occurred',
          ...(process.env.NODE_ENV === 'development' && {
            mlServiceUrl: ML_SERVICE_URL,
            errorCode: mlError.code,
          }),
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;



