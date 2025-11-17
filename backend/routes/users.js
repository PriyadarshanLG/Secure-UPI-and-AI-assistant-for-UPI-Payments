import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import { createAuditLog } from '../utils/auditLogger.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update current user profile
router.put(
  '/me',
  authenticate,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, phone } = req.body;
      const updates = {};

      if (name) updates.name = name;
      if (phone) updates.phone = phone;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-passwordHash');

      // Audit log
      await createAuditLog({
        actorId: req.user._id,
        action: 'update_profile',
        targetId: req.user._id,
        targetType: 'User',
        details: { updatedFields: Object.keys(updates) },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      next(error);
    }
  }
);

export default router;






