import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { existsSync } from 'fs';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import { upload, calculateFileHash } from '../utils/fileUpload.js';
import Evidence from '../models/Evidence.js';
import { analyzeImage } from '../utils/mlService.js';
import { createAuditLog } from '../utils/auditLogger.js';
import logger from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload evidence with improved error handling
router.post(
  '/upload',
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File is too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        logger.error('Upload error:', err);
        return res.status(400).json({ error: err.message || 'File upload failed' });
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      const { transactionId, manualData, manualOnly } = req.body;
      
      logger.info('Upload request received:', {
        hasFile: !!req.file,
        fileInfo: req.file ? { name: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype } : null,
        transactionId: transactionId,
        manualData: manualData ? (typeof manualData === 'string' ? manualData.substring(0, 100) : manualData) : null,
        manualOnly: manualOnly,
        bodyKeys: Object.keys(req.body || {})
      });
      
      // Check if this is manual-only mode (no file upload)
      // manualData comes as a string from FormData, need to check if it's valid
      let hasValidManualData = false;
      if (manualData) {
        if (typeof manualData === 'string') {
          hasValidManualData = manualData !== 'undefined' && 
                              manualData !== 'null' && 
                              manualData.trim() !== '' &&
                              manualData.trim() !== '{}';
        } else {
          hasValidManualData = true; // Already parsed object
        }
      }
      
      const isManualOnly = manualOnly === 'true' || (!req.file && hasValidManualData);
      
      if (isManualOnly) {
        // Manual-only mode: validate transaction data without image
        if (!hasValidManualData) {
          logger.warn('Manual-only mode but no manual data provided');
          return res.status(400).json({ 
            error: 'Please provide transaction details (UPI ID, Amount, or Reference ID)' 
          });
        }
        
        logger.info('Manual-only mode: Validating transaction data without image');
        
        let parsedManualData = null;
        try {
          parsedManualData = JSON.parse(manualData);
          
          // Validate that at least one field is provided
          if (!parsedManualData || typeof parsedManualData !== 'object') {
            return res.status(400).json({ error: 'Invalid transaction data format' });
          }
          
          const hasAnyData = parsedManualData.upiId || parsedManualData.amount || 
                            parsedManualData.referenceId || parsedManualData.merchantName;
          
          if (!hasAnyData) {
            return res.status(400).json({ 
              error: 'Please provide at least one transaction detail (UPI ID, Amount, or Reference ID)' 
            });
          }
        } catch (e) {
          logger.error('Failed to parse manual data:', e);
          return res.status(400).json({ 
            error: 'Invalid transaction data format. Please check your input.' 
          });
        }
        
        // Validate transaction data using ML service
        const analysis = await analyzeImage({
          filePath: null,
          manualData: parsedManualData,
          manualOnly: true
        });
        
        // Map ML service verdict to Evidence model enum values
        let manualVerdict = 'unknown';
        if (analysis.verdict) {
          const verdictLower = analysis.verdict.toLowerCase();
          if (verdictLower === 'clean') {
            manualVerdict = 'clean';
          } else if (verdictLower === 'tampered' || verdictLower === 'suspicious') {
            manualVerdict = 'tampered';
          } else {
            manualVerdict = 'unknown';
          }
        }
        
        // Create a simple evidence record for manual validation
        const evidence = new Evidence({
          transactionId: transactionId || null,
          uploaderId: req.user._id,
          filePath: 'manual-only',
          hash: 'manual-' + Date.now(),
          ocrText: analysis.ocrText || 'Manual validation - no OCR',
          forgeryScore: analysis.forgeryScore || 0,
          forgeryVerdict: manualVerdict,
          confidence: analysis.confidence || 1.0,
          metadata: {
            fileName: 'Manual Validation',
            fileSize: 0,
            mimeType: 'manual/validation',
            transactionValidation: analysis.transactionValidation || {},
            extractedData: analysis.extractedData || {},
            fraudDetected: analysis.fraudDetected || false,
            fraudIndicators: analysis.fraudIndicators || [],
            manualOnly: true,
            analysisLimited: analysis.analysisLimited || false,
            mlServiceAvailable: analysis.mlServiceAvailable !== false,
            mlFallbackError: analysis.error || null,
          },
        });

        await evidence.save();
        
        // Audit log
        await createAuditLog(req.user._id, 'EVIDENCE_UPLOAD', 'Evidence', evidence._id, {
          action: 'Manual transaction validation',
          manualData: parsedManualData,
        });
        
        return res.status(201).json({
          message: 'Transaction validated successfully (manual mode)',
          evidence: {
            id: evidence._id,
            transactionId: evidence.transactionId,
            ocrText: evidence.ocrText,
            forgeryVerdict: evidence.forgeryVerdict,
            forgeryScore: evidence.forgeryScore,
            uploadedAt: evidence.uploadedAt,
            transactionValidation: analysis.transactionValidation || {},
            extractedData: analysis.extractedData || {},
            fraudDetected: analysis.fraudDetected || false,
            fraudIndicators: analysis.fraudIndicators || [],
            manualOnly: true,
            analysisLimited: analysis.analysisLimited || false,
            mlServiceAvailable: analysis.mlServiceAvailable !== false,
            mlFallbackError: analysis.error || null,
          },
        });
      }

      // File upload mode - file is required (only if not manual-only)
      if (!req.file && !isManualOnly) {
        logger.warn('File upload mode but no file provided and no valid manual data');
        return res.status(400).json({ 
          error: 'No file uploaded',
          details: ['Please select an image file to upload, or provide transaction details manually']
        });
      }

      // If we have a file, proceed with file upload mode
      if (req.file) {
        logger.info(`File uploaded successfully: ${req.file.filename}, mimetype: ${req.file.mimetype}, size: ${req.file.size} bytes`);
        
        // Validate file
        if (!req.file.path) {
          logger.error('File uploaded but path is missing');
          return res.status(400).json({ error: 'File upload failed - file path not available' });
        }
      }
      
      // Parse manual data if provided (optional for file uploads)
      let parsedManualData = null;
      if (manualData && manualData !== 'undefined' && manualData !== 'null') {
        try {
          parsedManualData = JSON.parse(manualData);
          logger.info('Manual transaction data provided:', parsedManualData);
        } catch (e) {
          logger.warn('Failed to parse manual data, continuing with OCR only:', e.message);
          parsedManualData = null;
        }
      }

      // Calculate file hash (only if file exists)
      if (!req.file || !req.file.path) {
        logger.error('File upload mode but no file available', { file: req.file });
        return res.status(400).json({ 
          error: 'File upload failed - no file received' 
        });
      }
      
      let hash;
      try {
        hash = await calculateFileHash(req.file.path);
        logger.info(`File hash calculated: ${hash.substring(0, 16)}...`);
      } catch (hashError) {
        logger.error('Failed to calculate file hash:', hashError);
        return res.status(400).json({ 
          error: 'File processing failed - could not calculate file hash' 
        });
      }

      // ALWAYS RE-ANALYZE - Don't use cached results (for accurate fraud detection)
      // This ensures every upload gets fresh analysis with latest detection algorithms
      const existingEvidence = await Evidence.findOne({ hash }).populate('uploaderId', 'name email');
      if (existingEvidence) {
        logger.info(`File hash seen before - re-analyzing with latest fraud detection: ${hash}`);
        // Delete old evidence to force fresh analysis
        try {
          await Evidence.deleteOne({ _id: existingEvidence._id });
          logger.info(`Deleted old evidence record to force re-analysis`);
        } catch (err) {
          logger.warn(`Could not delete old evidence: ${err.message}`);
        }
      }

      // Analyze image with ML service
      logger.info(`Analyzing image: ${req.file.path}`);
      
      // Pass manual data to ML service if provided
      let analysisData = req.file.path;
      if (parsedManualData && Object.keys(parsedManualData).length > 0) {
        analysisData = {
          filePath: req.file.path,
          manualData: parsedManualData
        };
        logger.info('Including manual data in analysis:', parsedManualData);
      }
      
      let analysis;
      try {
        analysis = await analyzeImage(analysisData);
        logger.info('Image analysis completed:', {
          verdict: analysis.verdict,
          forgeryScore: analysis.forgeryScore,
          fraudDetected: analysis.fraudDetected
        });
      } catch (analysisError) {
        logger.error('Image analysis failed:', analysisError);
        return res.status(500).json({ 
          error: 'Image analysis failed. Please try again or contact support.',
          details: analysisError.message 
        });
      }

      // Validate required fields before creating evidence
      if (!req.user || !req.user._id) {
        logger.error('User authentication missing');
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.file || !req.file.path) {
        logger.error('File path missing');
        return res.status(400).json({ error: 'File path is required' });
      }
      
      if (!hash) {
        logger.error('File hash missing');
        return res.status(400).json({ error: 'File hash calculation failed' });
      }
      
      // Map ML service verdict to Evidence model enum values
      // Evidence model only allows: 'clean', 'tampered', 'unknown'
      // ML service may return: 'clean', 'tampered', 'suspicious', 'unknown'
      let forgeryVerdict = 'unknown';
      if (analysis.verdict) {
        const verdictLower = analysis.verdict.toLowerCase();
        if (verdictLower === 'clean') {
          forgeryVerdict = 'clean';
        } else if (verdictLower === 'tampered' || verdictLower === 'suspicious') {
          // Map 'suspicious' to 'tampered' since it indicates potential manipulation
          forgeryVerdict = 'tampered';
        } else {
          forgeryVerdict = 'unknown';
        }
      }
      
      // Create evidence record with ALL fraud detection data
      // Ensure all required fields are present
      const evidenceData = {
        transactionId: transactionId || null,
        uploaderId: req.user._id,
        filePath: req.file.path,
        hash: hash,
        ocrText: analysis.ocrText || '',
        forgeryVerdict: forgeryVerdict,
        forgeryScore: analysis.forgeryScore || 0,
        metadata: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          confidence: analysis.confidence,
          // Store fraud detection results
          transactionValidation: analysis.transactionValidation || {},
          extractedData: analysis.extractedData || {},
          fraudDetected: analysis.fraudDetected || false,
          fraudIndicators: analysis.fraudIndicators || [],
          // Store edit detection results for 100% accurate analysis
          isEdited: analysis.isEdited !== undefined ? analysis.isEdited : false,
          editConfidence: analysis.editConfidence !== undefined ? analysis.editConfidence : 0.0,
          editIndicators: analysis.editIndicators || [],
          analysisLimited: analysis.analysisLimited || false,
          mlServiceAvailable: analysis.mlServiceAvailable !== false,
          mlFallbackError: analysis.error || null,
        },
      };
      
      // Validate required fields one more time
      if (!evidenceData.uploaderId) {
        return res.status(400).json({ error: 'Uploader ID is required' });
      }
      if (!evidenceData.filePath) {
        return res.status(400).json({ error: 'File path is required' });
      }
      if (!evidenceData.hash) {
        return res.status(400).json({ error: 'File hash is required' });
      }
      
      logger.info('Creating evidence record...');
      const evidence = new Evidence(evidenceData);

      // Save evidence with error handling
      try {
        await evidence.save();
        logger.info('Evidence saved successfully:', evidence._id);
      } catch (saveError) {
        logger.error('Failed to save evidence:', saveError);
        if (saveError.name === 'ValidationError') {
          const validationErrors = Object.values(saveError.errors || {}).map(e => e.message).join(', ');
          return res.status(400).json({ 
            error: `Failed to save evidence: ${validationErrors || saveError.message}`,
            details: saveError.message 
          });
        }
        throw saveError; // Re-throw to be caught by outer catch
      }

      // Audit log
      await createAuditLog({
        actorId: req.user._id,
        action: 'upload_evidence',
        targetId: evidence._id,
        targetType: 'Evidence',
        details: {
          transactionId,
          forgeryVerdict: analysis.verdict,
          forgeryScore: analysis.forgeryScore,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Return comprehensive results
      res.status(201).json({
        message: 'Evidence uploaded and analyzed successfully',
        evidence: {
          id: evidence._id,
          transactionId: evidence.transactionId,
          ocrText: evidence.ocrText,
          forgeryVerdict: evidence.forgeryVerdict,
          forgeryScore: evidence.forgeryScore,
          uploadedAt: evidence.uploadedAt,
          // Include all fraud detection data
          transactionValidation: analysis.transactionValidation || evidence.metadata?.transactionValidation || {},
          extractedData: analysis.extractedData || evidence.metadata?.extractedData || {},
          fraudDetected: analysis.fraudDetected || evidence.metadata?.fraudDetected || false,
          fraudIndicators: analysis.fraudIndicators || evidence.metadata?.fraudIndicators || [],
          confidence: analysis.confidence || evidence.metadata?.confidence || 0.5,
          // Include edit detection
          isEdited: analysis.isEdited !== undefined ? analysis.isEdited : (evidence.metadata?.isEdited || false),
          editConfidence: analysis.editConfidence !== undefined ? analysis.editConfidence : (evidence.metadata?.editConfidence || 0.0),
          editIndicators: analysis.editIndicators || evidence.metadata?.editIndicators || [],
          analysisLimited: analysis.analysisLimited || evidence.metadata?.analysisLimited || false,
          mlServiceAvailable: analysis.mlServiceAvailable !== false,
          mlFallbackError: analysis.error || evidence.metadata?.mlFallbackError || null,
        },
      });
    } catch (error) {
      logger.error('Evidence upload error:', {
        error: error.message,
        stack: error.stack,
        hasFile: !!req.file,
        body: req.body
      });
      
      // Return user-friendly error message
      if (error.name === 'ValidationError') {
        logger.error('Mongoose validation error:', error.errors);
        const validationErrors = Object.values(error.errors || {}).map(e => e.message).join(', ');
        return res.status(400).json({ 
          error: `Validation failed: ${validationErrors || error.message}`,
          details: error.message 
        });
      }
      
      // Handle Mongoose cast errors
      if (error.name === 'CastError') {
        logger.error('Mongoose cast error:', error);
        return res.status(400).json({ 
          error: `Invalid data format: ${error.message}`,
          details: error.path 
        });
      }
      
      // Pass to error handler middleware
      next(error);
    }
  }
);

// Get all evidence for the current user
router.get('/', async (req, res, next) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query - users can only see their own evidence unless admin
    const query = {};
    if (req.user.role !== 'admin') {
      query.uploaderId = req.user._id;
    }

    const evidence = await Evidence.find(query)
      .populate('uploaderId', 'name email')
      .populate('transactionId')
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('forgeryVerdict forgeryScore uploadedAt metadata transactionId');

    const total = await Evidence.countDocuments(query);

    res.json({
      evidence: evidence.map(e => ({
        id: e._id,
        forgeryVerdict: e.forgeryVerdict,
        forgeryScore: e.forgeryScore,
        uploadedAt: e.uploadedAt,
        metadata: e.metadata ? Object.fromEntries(e.metadata) : {},
        transactionId: e.transactionId,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get evidence by ID
router.get('/:id', async (req, res, next) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
      .populate('uploaderId', 'name email')
      .populate('transactionId');

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    // Check if user owns the evidence or is admin
    if (evidence.uploaderId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate presigned URL or file path for download
    const fileUrl = `/api/evidence/${evidence._id}/download`;

    res.json({
      evidence: {
        id: evidence._id,
        transactionId: evidence.transactionId,
        uploaderId: evidence.uploaderId,
        ocrText: evidence.ocrText,
        forgeryVerdict: evidence.forgeryVerdict,
        forgeryScore: evidence.forgeryScore,
        hash: evidence.hash,
        uploadedAt: evidence.uploadedAt,
        metadata: evidence.metadata,
        fileUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Download evidence file
router.get('/:id/download', async (req, res, next) => {
  try {
    const evidence = await Evidence.findById(req.params.id);

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    // Check if user owns the evidence or is admin
    if (evidence.uploaderId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!existsSync(evidence.filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(evidence.filePath);
  } catch (error) {
    next(error);
  }
});

export default router;

