import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: [true, 'Merchant ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR'],
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  riskScore: {
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
transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index({ merchantId: 1, timestamp: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ riskScore: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;






