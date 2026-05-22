const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 1 }, // in months
  frequency: { type: String, enum: ['weekly', 'biweekly', 'monthly', 'quarterly'], default: 'monthly' },
  benefits: [{ type: String }],
  isActive: { type: Boolean, default: true },
  maxProducts: { type: Number, default: 5 },
  category: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
