import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Actor ID is required'],
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'login',
      'logout',
      'register',
      'create_transaction',
      'update_transaction',
      'upload_evidence',
      'delete_evidence',
      'update_profile',
      'admin_action',
      'risk_assessment',
      'link_safety_check',
      'sms_fraud_check',
      'other',
    ],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  targetType: {
    type: String,
    enum: ['User', 'Transaction', 'Evidence', 'Merchant', 'DeviceTelemetry', 'URL', 'SMS', null],
    default: null,
  },
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
auditLogSchema.index({ actorId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ targetId: 1, targetType: 1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;




