import express from 'express';
import multer from 'multer';
import { analyzeSocialAccount } from '../services/socialAccountDetector.js';
import { analyzeProfileScreenshot } from '../services/profileScreenshotAnalyzer.js';
import { upload } from '../utils/fileUpload.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/social-accounts/analyze
 * Accepts a payload of social account signals and returns a composite risk verdict.
 */
router.post('/analyze', async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Signal payload required' });
    }

    const analysis = analyzeSocialAccount(req.body);
    logger.info('Social account analyzed', { riskScore: analysis.riskScore, riskLevel: analysis.riskLevel });
    return res.status(200).json(analysis);
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/social-accounts/analyze-screenshot
 * Accepts a profile screenshot file and returns a synthesized risk verdict.
 */
router.post('/analyze-screenshot', (req, res, next) => {
  upload.single('screenshot')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message || 'Screenshot upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Screenshot file required' });
    }

    try {
      const analysis = await analyzeProfileScreenshot(req.file.path);
      logger.info('Social account screenshot analyzed', {
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
      });
      return res.status(200).json(analysis);
    } catch (error) {
      return next(error);
    }
  });
});

export default router;

