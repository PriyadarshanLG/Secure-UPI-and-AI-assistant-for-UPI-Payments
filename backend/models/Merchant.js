import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Merchant name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  upiId: {
    type: String,
    required: [true, 'UPI ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, 'Please provide a valid UPI ID'],
  },
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
}, {
  timestamps: true,
});

// Index for faster queries
merchantSchema.index({ upiId: 1 });
merchantSchema.index({ trustScore: -1 });

const Merchant = mongoose.model('Merchant', merchantSchema);

export default Merchant;






