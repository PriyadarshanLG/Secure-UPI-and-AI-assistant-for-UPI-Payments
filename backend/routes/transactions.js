import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import Merchant from '../models/Merchant.js';
import { createAuditLog } from '../utils/auditLogger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create transaction
router.post(
  '/',
  [
    body('merchantId').isMongoId().withMessage('Valid merchant ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').optional().isIn(['INR', 'USD', 'EUR']).withMessage('Invalid currency'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { merchantId, amount, currency = 'INR', metadata } = req.body;

      // Verify merchant exists
      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        return res.status(404).json({ error: 'Merchant not found' });
      }

      // Create transaction
      const transaction = new Transaction({
        userId: req.user._id,
        merchantId,
        amount,
        currency,
        status: 'pending',
        metadata: metadata || {},
      });

      await transaction.save();

      // Audit log
      await createAuditLog({
        actorId: req.user._id,
        action: 'create_transaction',
        targetId: transaction._id,
        targetType: 'Transaction',
        details: { amount, currency, merchantId },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get transaction by ID
router.get('/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('merchantId', 'name upiId');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user owns the transaction or is admin
    if (transaction.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
});

// List transactions with filters
router.get(
  '/',
  [
    query('userId').optional().isMongoId().withMessage('Invalid user ID'),
    query('merchantId').optional().isMongoId().withMessage('Invalid merchant ID'),
    query('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, merchantId, status, page = 1, limit = 20 } = req.query;

      // Build query
      const query = {};
      
      // Non-admin users can only see their own transactions
      if (req.user.role !== 'admin') {
        query.userId = req.user._id;
      } else if (userId) {
        query.userId = userId;
      }

      if (merchantId) query.merchantId = merchantId;
      if (status) query.status = status;

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const transactions = await Transaction.find(query)
        .populate('userId', 'name email')
        .populate('merchantId', 'name upiId')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Transaction.countDocuments(query);

      res.json({
        transactions,
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






