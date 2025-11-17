import express from 'express';
import { query, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Transaction from '../models/Transaction.js';
import Evidence from '../models/Evidence.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Get all users (paginated)
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['admin', 'merchant', 'customer']).withMessage('Invalid role'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { page = 1, limit = 20, role } = req.query;

      const query = {};
      if (role) query.role = role;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const users = await User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);

      res.json({
        users,
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

// Get audit logs
router.get(
  '/logs',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('action').optional().isString().withMessage('Action must be a string'),
    query('actorId').optional().isMongoId().withMessage('Invalid actor ID'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { page = 1, limit = 50, action, actorId } = req.query;

      const query = {};
      if (action) query.action = action;
      if (actorId) query.actorId = actorId;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const logs = await AuditLog.find(query)
        .populate('actorId', 'name email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await AuditLog.countDocuments(query);

      res.json({
        logs,
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

// Get dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalTransactions,
      totalEvidence,
      highRiskTransactions,
      pendingTransactions,
      tamperedEvidence,
    ] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Evidence.countDocuments(),
      Transaction.countDocuments({ riskScore: { $gt: 70 } }),
      Transaction.countDocuments({ status: 'pending' }),
      Evidence.countDocuments({ forgeryVerdict: 'tampered' }),
    ]);

    res.json({
      stats: {
        users: {
          total: totalUsers,
          byRole: {
            admin: await User.countDocuments({ role: 'admin' }),
            merchant: await User.countDocuments({ role: 'merchant' }),
            customer: await User.countDocuments({ role: 'customer' }),
          },
        },
        transactions: {
          total: totalTransactions,
          highRisk: highRiskTransactions,
          pending: pendingTransactions,
        },
        evidence: {
          total: totalEvidence,
          tampered: tamperedEvidence,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;






