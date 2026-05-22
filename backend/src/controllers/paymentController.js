const asyncHandler = require('../middleware/asyncHandler');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

exports.processPayment = asyncHandler(async (req, res) => {
  const { orderId, method } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const payment = await Payment.create({
    user: req.user._id,
    order: orderId,
    amount: order.totalAmount,
    method: method || 'stripe',
    status: 'completed',
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
  order.status = 'processing';
  await order.save();
  res.status(201).json(payment);
});

exports.getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).populate('order', 'totalAmount status').sort({ createdAt: -1 });
  res.json(payments);
});

exports.getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('order');
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
});

exports.getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate('user', 'firstName lastName email').populate('order', 'totalAmount').sort({ createdAt: -1 });
  res.json(payments);
});

exports.refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  payment.status = 'refunded';
  await payment.save();
  res.json({ message: 'Payment refunded', payment });
});
