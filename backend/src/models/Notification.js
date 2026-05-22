const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['registration', 'payment', 'renewal', 'delivery', 'promotion', 'system'],
    required: true,
  },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  sentVia: { type: String, enum: ['email', 'sms', 'in_app'], default: 'email' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
