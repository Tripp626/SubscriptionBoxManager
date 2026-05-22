const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerSubscription' },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  method: { type: String, enum: ['credit_card', 'debit_card', 'paypal', 'stripe'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String, unique: true, sparse: true },
  invoiceUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
