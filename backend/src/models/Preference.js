const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  categories: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  priceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 1000 },
  },
  dietaryRestrictions: [{ type: String }],
  preferredFrequency: { type: String, enum: ['weekly', 'biweekly', 'monthly', 'quarterly'] },
  dislikedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

module.exports = mongoose.model('Preference', preferenceSchema);
