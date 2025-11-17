import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import DeviceTelemetry from '../models/DeviceTelemetry.js';
import { createAuditLog } from '../utils/auditLogger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Risk assessment scoring algorithm
const calculateRiskScore = (transaction, telemetry) => {
  let riskScore = 0;

  // Transaction-based factors
  if (transaction.amount > 10000) riskScore += 20; // Large amount
  if (transaction.amount > 50000) riskScore += 30; // Very large amount

  // Device telemetry factors
  if (telemetry) {
    if (telemetry.isRooted) riskScore += 30; // Rooted device
    if (telemetry.suspicionScore > 50) riskScore += telemetry.suspicionScore * 0.3;
    if (telemetry.installedApps && telemetry.installedApps.length > 100) riskScore += 10; // Too many apps
  }

  // Merchant trust score
  if (transaction.merchantId && transaction.merchantId.trustScore) {
    const merchantRisk = 100 - transaction.merchantId.trustScore;
    riskScore += merchantRisk * 0.2;
  }

  // Cap at 100
  return Math.min(100, Math.max(0, riskScore));
};

// Assess risk for transaction
router.post(
  '/assess',
  [
    body('transactionId').isMongoId().withMessage('Valid transaction ID is required'),
    body('deviceId').optional().isString().withMessage('Device ID must be a string'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { transactionId, deviceId } = req.body;

      // Get transaction
      const transaction = await Transaction.findById(transactionId)
        .populate('merchantId');

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check ownership
      if (transaction.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get device telemetry if deviceId provided
      let telemetry = null;
      if (deviceId) {
        telemetry = await DeviceTelemetry.findOne({
          userId: req.user._id,
          deviceId,
        }).sort({ lastSeen: -1 });
      }

      // Calculate risk score
      const riskScore = calculateRiskScore(transaction, telemetry);

      // Update transaction with risk score
      transaction.riskScore = riskScore;
      if (riskScore > 70) {
        transaction.status = 'pending'; // Flag for review
      }
      await transaction.save();

      // Audit log
      await createAuditLog({
        actorId: req.user._id,
        action: 'risk_assessment',
        targetId: transactionId,
        targetType: 'Transaction',
        details: { riskScore, deviceId },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({
        message: 'Risk assessment completed',
        riskScore,
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          status: transaction.status,
          riskScore: transaction.riskScore,
        },
        recommendations: riskScore > 70 ? ['Transaction flagged for manual review'] : [],
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get risk assessment history
router.get(
  '/history',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { page = 1, limit = 20 } = req.query;

      // Build query
      const query = {};
      if (req.user.role !== 'admin') {
        query.userId = req.user._id;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const transactions = await Transaction.find(query)
        .populate('merchantId', 'name upiId')
        .sort({ riskScore: -1, timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('amount currency status riskScore timestamp merchantId');

      const total = await Transaction.countDocuments(query);

      res.json({
        assessments: transactions,
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
  }
);

export default router;






