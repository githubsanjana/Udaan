const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  merchant: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  txType: {
    type: String,
    enum: ['UPI Transfer', 'Debit Card', 'Credit Card', 'Net Banking', 'International'],
    default: 'UPI Transfer',
  },
  txTime: {
    type: String,
    default: 'Business Hours (9AM–6PM)',
  },
  location: {
    type: String,
    default: 'Usual Location',
  },
  riskScore: {
    type: Number,
    default: 0,
  },
  riskLevel: {
    type: String,
    enum: ['safe', 'medium', 'high'],
    default: 'safe',
  },
  flagged: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Transaction', TransactionSchema)