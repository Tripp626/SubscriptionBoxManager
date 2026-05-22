const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Shipment = require('../models/Shipment');

exports.createOrder = asyncHandler(async (req, res) => {
  const { products, shippingAddress, subscriptionId, isPersonalized } = req.body;
  let totalAmount = 0;
  const orderProducts = [];
  for (const item of products) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ message: `Product ${item.product} not found` });
    if (product.quantity < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }
    orderProducts.push({ product: product._id, quantity: item.quantity, price: product.price });
    totalAmount += product.price * item.quantity;
    product.quantity -= item.quantity;
    await product.save();
  }
  const order = await Order.create({
    user: req.user._id,
    subscription: subscriptionId,
    products: orderProducts,
    totalAmount,
    shippingAddress,
    isPersonalized: isPersonalized || false,
  });
  await Shipment.create({ order: order._id });
  res.status(201).json(order);
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('products.product', 'name price imageUrl').sort({ createdAt: -1 });
  res.json(orders);
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('products.product', 'name price imageUrl').populate('user', 'firstName lastName email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'firstName lastName email').populate('products.product', 'name').sort({ createdAt: -1 });
  res.json(orders);
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});
