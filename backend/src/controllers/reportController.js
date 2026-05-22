const asyncHandler = require('../middleware/asyncHandler');
const CustomerSubscription = require('../models/CustomerSubscription');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');

exports.getSubscriptionReport = asyncHandler(async (req, res) => {
  const total = await CustomerSubscription.countDocuments();
  const active = await CustomerSubscription.countDocuments({ status: 'active' });
  const cancelled = await CustomerSubscription.countDocuments({ status: 'cancelled' });
  const expired = await CustomerSubscription.countDocuments({ status: 'expired' });
  const paused = await CustomerSubscription.countDocuments({ status: 'paused' });
  res.json({ total, active, cancelled, expired, paused });
});

exports.getSalesReport = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: 'completed' });
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalTransactions = payments.length;
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyPayments = await Payment.find({ status: 'completed', createdAt: { $gte: sixMonthsAgo } });
  const monthlyRevenue = {};
  monthlyPayments.forEach(p => {
    const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + p.amount;
  });
  res.json({ totalRevenue, totalTransactions, avgOrderValue, monthlyRevenue });
});

exports.getCustomerAnalytics = asyncHandler(async (req, res) => {
  const totalCustomers = await CustomerSubscription.distinct('user').then(users => users.length);
  const activeSubscriptions = await CustomerSubscription.countDocuments({ status: 'active' });
  const topProducts = await Order.aggregate([
    { $unwind: '$products' },
    { $group: { _id: '$products.product', totalOrdered: { $sum: '$products.quantity' } } },
    { $sort: { totalOrdered: -1 } },
    { $limit: 5 },
  ]);
  const productIds = topProducts.map(p => p._id);
  const productDetails = await Product.find({ _id: { $in: productIds } }).select('name category price');
  const topProductsWithDetails = topProducts.map(p => {
    const detail = productDetails.find(d => d._id.toString() === p._id.toString());
    return { ...p, ...detail?.toObject() };
  });
  res.json({ totalCustomers, activeSubscriptions, topProducts: topProductsWithDetails });
});
