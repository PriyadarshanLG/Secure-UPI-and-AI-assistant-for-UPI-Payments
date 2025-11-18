import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import axios from 'axios';
import logger from '../utils/logger.js';
import { createAuditLog } from '../utils/auditLogger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ML Service Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_TIMEOUT = 120000; // 2 minutes for video processing

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  },
});

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
 * POST /api/deepfake/detect
 * Detect deepfake in uploaded image or video
 */
router.post('/detect', upload.single('file'), async (req, res, next) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        details: ['Please select an image or video file to analyze']
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    logger.info(`Deepfake detection request: ${originalname}, type: ${mimetype}, size: ${size} bytes`);

    // Determine file type
    const isVideo = mimetype.startsWith('video/');
    const fileType = isVideo ? 'video' : 'image';

    // Check ML service availability
    const healthCheck = await checkMLServiceHealth();
    if (!healthCheck.available) {
      logger.error('ML service unavailable:', healthCheck.error);
      return res.status(503).json({
        error: 'ML service unavailable',
        details: [
          `Cannot connect to ML service at ${ML_SERVICE_URL}`,
          'The ML service is not running. Please start it:',
          '1. Open a new terminal/command prompt',
          '2. Navigate to: cd ml-service',
          '3. Run: python main.py',
          'Or use: start-ml-service.bat (Windows)',
          '',
          `Service URL: ${ML_SERVICE_URL}`,
          '',
          'Troubleshooting:',
          '- Make sure Python 3.8+ is installed',
          '- Install dependencies: python -m pip install -r requirements.txt',
          '- Check if port 8000 is already in use',
          '- Check ml-service logs for errors'
        ],
        mlServiceUrl: ML_SERVICE_URL,
      });
    }

    // Convert file to base64
    const base64File = buffer.toString('base64');

    // Call ML service for deepfake detection
    try {
      logger.info(`Calling ML service at ${ML_SERVICE_URL}/api/deepfake/detect`);
      
      const response = await axios.post(
        `${ML_SERVICE_URL}/api/deepfake/detect`,
        {
          file: base64File,
          format: 'base64',
          fileType: fileType,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: ML_SERVICE_TIMEOUT,
        }
      );

      const result = response.data;
      logger.info(`ML service response: verdict=${result.verdict}, score=${result.deepfakeScore}, confidence=${result.confidence}`);

      // Validate and sanitize result
      const safeResult = {
        isDeepfake: result.isDeepfake ?? false,
        deepfakeScore: result.deepfakeScore ?? 0.0,
        confidence: result.confidence ?? 0.0,
        verdict: result.verdict ?? 'unknown',
        detectionMethods: Array.isArray(result.detectionMethods) ? result.detectionMethods : [],
        indicators: Array.isArray(result.indicators) ? result.indicators : [],
        frameAnalysis: result.frameAnalysis || null,
        technicalDetails: result.technicalDetails || {},
        explainability: result.explainability || {},
        faceMaskDetected: result.faceMaskDetected ?? false,
        faceMaskScore: result.faceMaskScore ?? 0.0,
        fileName: originalname,
        fileType: fileType,
        fileSize: size,
      };

      // Create audit log (non-blocking)
      createAuditLog({
        actorId: req.user._id,
        action: 'deepfake_detection',
        targetType: 'DeepfakeDetection',
        details: {
          fileName: originalname,
          fileType: fileType,
          verdict: safeResult.verdict,
          deepfakeScore: safeResult.deepfakeScore,
          isDeepfake: safeResult.isDeepfake,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }).catch(err => logger.warn('Failed to create audit log:', err.message));

      // Return successful result
      return res.json({
        message: 'Deepfake detection completed successfully',
        result: safeResult,
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
            `Service URL: ${ML_SERVICE_URL}`
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
          error: 'Deepfake detection failed',
          details: errorMessage,
          ...(process.env.NODE_ENV === 'development' && {
            mlServiceUrl: ML_SERVICE_URL,
            fullError: mlError.response.data,
          }),
        });
      }

      // Generic error
      return res.status(500).json({
        error: 'Deepfake detection failed',
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
});

export default router;







