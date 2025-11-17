import AuditLog from '../models/AuditLog.js';

/**
 * Create an audit log entry
 * @param {Object} options - Audit log options
 * @param {string} options.actorId - User ID performing the action
 * @param {string} options.action - Action type
 * @param {string} options.targetId - Target resource ID (optional)
 * @param {string} options.targetType - Target resource type (optional)
 * @param {Object} options.details - Additional details (optional)
 * @param {string} options.ipAddress - IP address (optional)
 * @param {string} options.userAgent - User agent (optional)
 */
export const createAuditLog = async (options) => {
  try {
    const auditLog = new AuditLog({
      actorId: options.actorId,
      action: options.action,
      targetId: options.targetId || null,
      targetType: options.targetType || null,
      details: options.details || {},
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null,
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    // Don't throw error if audit logging fails - log it instead
    console.error('Failed to create audit log:', error);
    return null;
  }
};






