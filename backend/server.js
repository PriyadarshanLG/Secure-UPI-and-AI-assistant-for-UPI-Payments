import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import net from 'net';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import logger from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';
import evidenceRoutes from './routes/evidence.js';
import scoreRoutes from './routes/score.js';
import adminRoutes from './routes/admin.js';
import linkRoutes from './routes/links.js';
import smsRoutes from './routes/sms.js';
import voiceRoutes from './routes/voice.js';
import verificationRoutes from './routes/verification.js';
import socialAccountRoutes from './routes/socialAccounts.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;

/**
 * Check if a port is available by trying to bind a temporary server.
 */
function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester
          .once('close', () => resolve(true))
          .close();
      })
      .listen(port, '0.0.0.0');
  });
}

/**
 * Find an available port starting from the preferred one.
 * We scan a small range to keep developer ergonomics high.
 */
async function resolvePort(preferredPort, maxOffset = 10) {
  for (let offset = 0; offset <= maxOffset; offset++) {
    const candidate = preferredPort + offset;
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(candidate)) {
      return candidate;
    }
  }
  throw new Error(`No free ports found between ${preferredPort}-${preferredPort + maxOffset}`);
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use('/api/', rateLimiter);

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/social-accounts', socialAccountRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
  try {
    // Ensure database is ready before accepting traffic
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/secure-upi');
    logger.info('Connected to MongoDB');

    let port = DEFAULT_PORT;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    while (attempts < MAX_ATTEMPTS) {
      try {
        // eslint-disable-next-line no-await-in-loop
        port = await resolvePort(port);
        if (port !== DEFAULT_PORT) {
          logger.warn(`Port ${DEFAULT_PORT} is busy. Falling back to ${port}`);
        }

        // eslint-disable-next-line no-await-in-loop
        const server = await new Promise((resolve, reject) => {
          const instance = app.listen(port, () => resolve(instance));
          instance.on('error', reject);
        });

        server.on('error', (error) => {
          if (error.code === 'EADDRINUSE') {
            logger.error(`Port ${port} became unavailable. Restart to retry binding.`);
          } else {
            logger.error('Server error:', error);
          }
        });

        logger.info(`Server running on port ${port}`);
        return;
      } catch (error) {
        if (error.code === 'EADDRINUSE') {
          logger.warn(`Port ${port} taken before bind. Retrying with next port...`);
          port += 1;
          attempts += 1;
          continue;
        }
        throw error;
      }
    }

    throw new Error(`Failed to bind server after ${MAX_ATTEMPTS} attempts`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;




