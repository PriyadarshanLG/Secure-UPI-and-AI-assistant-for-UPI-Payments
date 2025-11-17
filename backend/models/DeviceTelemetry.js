import mongoose from 'mongoose';

const deviceTelemetrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  deviceId: {
    type: String,
    required: [true, 'Device ID is required'],
  },
  isRooted: {
    type: Boolean,
    default: false,
  },
  os: {
    type: String,
    enum: ['Android', 'iOS', 'Windows', 'macOS', 'Linux', 'Unknown'],
    default: 'Unknown',
  },
  osVersion: {
    type: String,
    default: '',
  },
  installedApps: [{
    type: String,
  }],
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  suspicionScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
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
deviceTelemetrySchema.index({ userId: 1, deviceId: 1 });
deviceTelemetrySchema.index({ suspicionScore: -1 });
deviceTelemetrySchema.index({ lastSeen: -1 });

const DeviceTelemetry = mongoose.model('DeviceTelemetry', deviceTelemetrySchema);

export default DeviceTelemetry;






