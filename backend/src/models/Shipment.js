const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  trackingNumber: { type: String, unique: true, sparse: true },
  carrier: { type: String, trim: true },
  status: {
    type: String,
    enum: ['preparing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed'],
    default: 'preparing',
  },
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  deliveryPersonnel: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackingUpdates: [{
    status: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
