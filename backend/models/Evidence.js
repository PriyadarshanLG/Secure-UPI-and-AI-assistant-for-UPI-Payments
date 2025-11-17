import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null,
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader ID is required'],
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
  },
  s3Key: {
    type: String,
    default: null,
  },
  ocrText: {
    type: String,
    default: '',
  },
  forgeryVerdict: {
    type: String,
    enum: ['clean', 'tampered', 'unknown'],
    default: 'unknown',
  },
  forgeryScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  hash: {
    type: String,
    required: [true, 'File hash is required'],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
evidenceSchema.index({ uploaderId: 1, uploadedAt: -1 });
evidenceSchema.index({ transactionId: 1 });
evidenceSchema.index({ forgeryVerdict: 1 });
evidenceSchema.index({ hash: 1 });

const Evidence = mongoose.model('Evidence', evidenceSchema);

export default Evidence;






