import { Server } from 'socket.io';
import logger from './logger.js';

let io;

/**
 * Initialize WebSocket server
 * @param {object} server - HTTP server instance
 */
export const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.on('join-room', (userId) => {
      socket.join(`user-${userId}`);
      logger.info(`User ${userId} joined their room`);
    });

    socket.on('join-admin', () => {
      socket.join('admin-room');
      logger.info('Admin joined admin room');
    });

    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Send notification to specific user
 * @param {string} userId - User ID
 * @param {object} notification - Notification data
 */
export const sendUserNotification = (userId, notification) => {
  if (io) {
    io.to(`user-${userId}`).emit('notification', notification);
    logger.info(`Notification sent to user ${userId}`);
  }
};

/**
 * Send notification to all admins
 * @param {object} notification - Notification data
 */
export const sendAdminNotification = (notification) => {
  if (io) {
    io.to('admin-room').emit('admin-notification', notification);
    logger.info('Notification sent to admins');
  }
};

/**
 * Broadcast fraud alert
 * @param {object} alert - Alert data
 */
export const broadcastFraudAlert = (alert) => {
  if (io) {
    io.emit('fraud-alert', alert);
    logger.warn(`Fraud alert broadcast: ${alert.type}`);
  }
};

/**
 * Send real-time transaction update
 * @param {string} userId - User ID
 * @param {object} transaction - Transaction data
 */
export const sendTransactionUpdate = (userId, transaction) => {
  if (io) {
    io.to(`user-${userId}`).emit('transaction-update', transaction);
    logger.info(`Transaction update sent to user ${userId}`);
  }
};

export default { initializeWebSocket, sendUserNotification, sendAdminNotification, broadcastFraudAlert, sendTransactionUpdate };






