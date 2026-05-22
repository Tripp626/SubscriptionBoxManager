const mongoose = require('mongoose');

const customerSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  status: { type: String, enum: ['active', 'paused', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date, required: true },
  nextBillingDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: true },
  paymentMethod: { type: String, enum: ['credit_card', 'debit_card', 'paypal', 'stripe'], default: 'stripe' },
}, { timestamps: true });

module.exports = mongoose.model('CustomerSubscription', customerSubscriptionSchema);
