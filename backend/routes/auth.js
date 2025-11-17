import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { createAuditLog } from '../utils/auditLogger.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

// Register
router.post(
  '/register',
  authRateLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, phone, role } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

      // Create user (prevent role escalation)
      const userRole = role === 'admin' ? 'customer' : (role || 'customer');

      const user = new User({
        name,
        email,
        passwordHash,
        phone,
        role: userRole,
      });

      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAME_SITE || 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Audit log
      await createAuditLog({
        actorId: user._id,
        action: 'register',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last active
      await user.updateLastActive();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAME_SITE || 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Audit log
      await createAuditLog({
        actorId: user._id,
        action: 'login',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not provided' });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '15m' }
      );

      res.json({ accessToken });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken && req.user) {
      // Audit log
      await createAuditLog({
        actorId: req.user._id,
        action: 'logout',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
});

export default router;






