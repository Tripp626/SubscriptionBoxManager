const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerSubscription', required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  status: {
    type: String,
    enum: ['auto_generated', 'customized', 'confirmed', 'shipped', 'delivered'],
    default: 'auto_generated',
  },
  isPersonalized: { type: Boolean, default: false },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  billingDate: { type: Date, required: true },
  shippedDate: Date,
  deliveredDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Box', boxSchema);
