import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import Merchant from '../models/Merchant.js';
import Transaction from '../models/Transaction.js';
import Evidence from '../models/Evidence.js';
import DeviceTelemetry from '../models/DeviceTelemetry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/secure-upi';

const seed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Merchant.deleteMany({});
    await Transaction.deleteMany({});
    await Evidence.deleteMany({});
    await DeviceTelemetry.deleteMany({});
    console.log('Cleared existing data');

    // Create admin users
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admins = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@secureupi.com',
        passwordHash: adminPassword,
        role: 'admin',
        phone: '+911234567890',
        isVerified: true,
      },
      {
        name: 'Super Admin',
        email: 'superadmin@secureupi.com',
        passwordHash: adminPassword,
        role: 'admin',
        phone: '+911234567891',
        isVerified: true,
      },
    ]);
    console.log('Created admin users');

    // Create merchants
    const merchants = await Merchant.insertMany([
      {
        name: 'Amazon India',
        upiId: 'AMAZON@PAYTM',
        trustScore: 85,
        metadata: { category: 'E-commerce', verified: true },
      },
      {
        name: 'Flipkart',
        upiId: 'FLIPKART@UPI',
        trustScore: 82,
        metadata: { category: 'E-commerce', verified: true },
      },
      {
        name: 'Swiggy',
        upiId: 'SWIGGY@PAYTM',
        trustScore: 78,
        metadata: { category: 'Food Delivery', verified: true },
      },
      {
        name: 'Zomato',
        upiId: 'ZOMATO@UPI',
        trustScore: 75,
        metadata: { category: 'Food Delivery', verified: true },
      },
      {
        name: 'Suspicious Merchant',
        upiId: 'SUSPECT@UPI',
        trustScore: 25,
        metadata: { category: 'Unknown', verified: false },
      },
    ]);
    console.log('Created merchants');

    // Create regular users
    const userPassword = await bcrypt.hash('user123', 12);
    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: userPassword,
        role: 'customer',
        phone: '+911234567892',
        isVerified: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        passwordHash: userPassword,
        role: 'customer',
        phone: '+911234567893',
        isVerified: true,
      },
      {
        name: 'Merchant User',
        email: 'merchant@example.com',
        passwordHash: userPassword,
        role: 'merchant',
        phone: '+911234567894',
        isVerified: true,
      },
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        passwordHash: userPassword,
        role: 'customer',
        phone: '+911234567895',
        isVerified: false,
      },
      {
        name: 'Bob Williams',
        email: 'bob@example.com',
        passwordHash: userPassword,
        role: 'customer',
        phone: '+911234567896',
        isVerified: true,
      },
    ]);
    console.log('Created users');

    // Create transactions
    const transactions = [];
    const statuses = ['pending', 'completed', 'failed'];
    const amounts = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000];

    for (let i = 0; i < 30; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const riskScore = Math.floor(Math.random() * 100);
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      transactions.push({
        userId: user._id,
        merchantId: merchant._id,
        amount,
        currency: 'INR',
        status,
        timestamp,
        riskScore,
        metadata: {
          paymentMethod: 'UPI',
          transactionType: 'payment',
        },
      });
    }

    const createdTransactions = await Transaction.insertMany(transactions);
    console.log('Created transactions');

    // Create evidence items
    const evidenceItems = [];
    const verdicts = ['clean', 'tampered', 'unknown'];

    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const transaction = createdTransactions[Math.floor(Math.random() * createdTransactions.length)];
      const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
      const forgeryScore = Math.floor(Math.random() * 100);

      evidenceItems.push({
        transactionId: transaction._id,
        uploaderId: user._id,
        filePath: `/uploads/evidence-${i + 1}.jpg`,
        hash: `sha256-${Math.random().toString(36).substring(7)}`,
        ocrText: `Transaction screenshot ${i + 1}. Amount: ₹${transaction.amount}. Merchant: ${merchants.find(m => m._id.equals(transaction.merchantId))?.name}`,
        forgeryVerdict: verdict,
        forgeryScore,
        metadata: {
          fileName: `evidence-${i + 1}.jpg`,
          fileSize: Math.floor(Math.random() * 5000000) + 100000,
        },
      });
    }

    await Evidence.insertMany(evidenceItems);
    console.log('Created evidence items');

    // Create device telemetry
    const telemetryItems = [];
    const osTypes = ['Android', 'iOS', 'Windows'];

    for (const user of users) {
      const isRooted = Math.random() > 0.8;
      const os = osTypes[Math.floor(Math.random() * osTypes.length)];
      const suspicionScore = isRooted ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 30);

      telemetryItems.push({
        userId: user._id,
        deviceId: `device-${user._id}-${Math.random().toString(36).substring(7)}`,
        isRooted,
        os,
        osVersion: '13.0',
        installedApps: Array.from({ length: Math.floor(Math.random() * 50) + 20 }, (_, i) => `app-${i}`),
        suspicionScore,
        lastSeen: new Date(),
      });
    }

    await DeviceTelemetry.insertMany(telemetryItems);
    console.log('Created device telemetry');

    console.log('\n✅ Seed data created successfully!');
    console.log('\nAdmin credentials:');
    console.log('  Email: admin@secureupi.com');
    console.log('  Password: admin123');
    console.log('\nUser credentials:');
    console.log('  Email: john@example.com');
    console.log('  Password: user123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();






