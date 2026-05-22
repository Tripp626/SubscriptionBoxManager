const asyncHandler = require('../middleware/asyncHandler');
const Feedback = require('../models/Feedback');
const Product = require('../models/Product');

async function updateProductRating(productId) {
  const feedbacks = await Feedback.find({ product: productId });
  const totalRatings = feedbacks.length;
  const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalRatings;
  await Product.findByIdAndUpdate(productId, { averageRating: avgRating, totalRatings });
}

exports.createFeedback = asyncHandler(async (req, res) => {
  const { productId, orderId, rating, comment } = req.body;
  const existing = await Feedback.findOne({ user: req.user._id, product: productId });
  if (existing) {
    existing.rating = rating;
    existing.comment = comment;
    await existing.save();
    await updateProductRating(productId);
    return res.json(existing);
  }
  const feedback = await Feedback.create({ user: req.user._id, product: productId, order: orderId, rating, comment });
  await updateProductRating(productId);
  res.status(201).json(feedback);
});

exports.getProductFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ product: req.params.productId }).populate('user', 'firstName lastName').sort({ createdAt: -1 });
  res.json(feedback);
});

exports.getMyFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ user: req.user._id }).populate('product', 'name imageUrl').sort({ createdAt: -1 });
  res.json(feedback);
});

exports.getAllFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find().populate('user', 'firstName lastName email').populate('product', 'name').sort({ createdAt: -1 });
  res.json(feedback);
});
