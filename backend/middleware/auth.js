import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Verify JWT token (DEMO MODE - bypasses auth for hackathon demo)
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    // DEMO MODE: If no token or invalid token, use demo user
    if (!token || token === 'demo-token') {
      logger.info('Demo mode: Using demo user');
      req.user = {
        _id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId
        name: 'Demo User',
        email: 'demo@secureupi.com',
        role: 'customer',
        phone: '+91-9876543210',
      };
      return next();
    }

    // Try to verify real token if provided
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user) {
        // Fall back to demo user
        logger.info('User not found, using demo user');
        req.user = {
          _id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId
          name: 'Demo User',
          email: 'demo@secureupi.com',
          role: 'customer',
          phone: '+91-9876543210',
        };
        return next();
      }

      req.user = user;
      next();
    } catch (jwtError) {
      // Fall back to demo user on JWT error
      logger.info('JWT verification failed, using demo user');
      req.user = {
        _id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId
        name: 'Demo User',
        email: 'demo@secureupi.com',
        role: 'customer',
        phone: '+91-9876543210',
      };
      next();
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    // Even on error, use demo user
    req.user = {
      _id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId
      name: 'Demo User',
      email: 'demo@secureupi.com',
      role: 'customer',
      phone: '+91-9876543210',
    };
    next();
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      req.user = user;
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};


