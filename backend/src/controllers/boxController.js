const asyncHandler = require('../middleware/asyncHandler');
const Box = require('../models/Box');
const Product = require('../models/Product');
const CustomerSubscription = require('../models/CustomerSubscription');
const Preference = require('../models/Preference');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment');

// Auto-generate a box for a subscription
async function generateBox(subscription) {
  const plan = subscription.plan;
  const maxProducts = plan.maxProducts || 5;

  // Try to use user preferences for smarter selection
  const pref = await Preference.findOne({ user: subscription.user });
  let products = [];

  if (pref && pref.categories && pref.categories.length > 0) {
    // Get products matching user preferences
    const preferred = await Product.find({
      isActive: true,
      quantity: { $gt: 0 },
      category: { $in: pref.categories },
    }).limit(maxProducts * 2);

    products = preferred.sort(() => Math.random() - 0.5).slice(0, maxProducts);
  }

  // Fill remaining slots with random products if needed
  if (products.length < maxProducts) {
    const existingIds = products.map(p => p._id.toString());
    const additional = await Product.find({
      isActive: true,
      quantity: { $gt: 0 },
      _id: { $nin: existingIds },
    }).limit(maxProducts - products.length);
    products = [...products, ...additional];
  }

  return products.map(p => p._id);
}

// Get the upcoming box for the user's active subscription
exports.getMyBox = asyncHandler(async (req, res) => {
  const subscription = await CustomerSubscription.findOne({
    user: req.user._id,
    status: 'active',
  }).populate('plan');

  if (!subscription) {
    return res.status(404).json({ message: 'No active subscription found' });
  }

  // Find the most recent box that can still be customized
  let box = await Box.findOne({
    user: req.user._id,
    subscription: subscription._id,
    status: { $in: ['auto_generated', 'customized'] },
  }).populate('products');

  // If no customizable box exists, check if there's a confirmed/shipped one
  if (!box) {
    const existingBox = await Box.findOne({
      user: req.user._id,
      subscription: subscription._id,
      status: { $in: ['confirmed', 'shipped', 'delivered'] },
    }).populate('products');

    if (existingBox) {
      // Return the existing box — frontend will show "waiting" state
      return res.json({ box: existingBox, subscription });
    }

    // No box at all — auto-generate one
    const productIds = await generateBox(subscription);
    box = await Box.create({
      user: req.user._id,
      subscription: subscription._id,
      products: productIds,
      status: 'auto_generated',
      isPersonalized: false,
      billingDate: subscription.nextBillingDate,
      shippingAddress: req.user.address || {},
    });
    box = await box.populate('products');
  }

  res.json({ box, subscription });
});

// Customize the box — swap a product
exports.customizeBox = asyncHandler(async (req, res) => {
  const { removeProductId, addProductId } = req.body;

  const box = await Box.findOne({
    _id: req.params.id,
    user: req.user._id,
    status: { $in: ['auto_generated', 'customized', 'confirmed'] },
  }).populate('subscription');

  if (!box) {
    return res.status(404).json({ message: 'Box not found or already shipped' });
  }

  // Remove the product
  box.products = box.products.filter(p => p.toString() !== removeProductId);

  // Add the new product
  if (addProductId) {
    const product = await Product.findById(addProductId);
    if (!product || product.quantity <= 0) {
      return res.status(400).json({ message: 'Product not available' });
    }
    box.products.push(addProductId);
  }

  box.status = 'customized';
  box.isPersonalized = true;
  await box.save();

  const updatedBox = await box.populate('products');
  res.json({ box: updatedBox });
});

// Confirm the box (lock it in for shipping) and create order/shipment
exports.confirmBox = asyncHandler(async (req, res) => {
  const box = await Box.findOne({
    _id: req.params.id,
    user: req.user._id,
    status: { $in: ['auto_generated', 'customized', 'confirmed'] },
  }).populate('subscription');

  if (!box) {
    return res.status(404).json({ message: 'Box not found or already shipped' });
  }

  box.status = 'confirmed';
  await box.save();

  // Create order and shipment when box is confirmed
  try {
    // Prepare order items with proper product details and stock check
    const orderItems = [];
    let calculatedTotal = 0;

    // box.products are ObjectIds (not populated), so use item directly
    for (const productId of box.products) {
      const product = await Product.findById(productId);
      if (!product) {
        continue; // Skip if product not found
      }
      if (product.quantity <= 0) {
        continue; // Skip if out of stock
      }
      orderItems.push({ product: product._id, quantity: 1, price: product.price });
      calculatedTotal += product.price;
      // Decrement product stock
      product.quantity -= 1;
      await product.save();
    }

    // Don't create order if no valid products
    if (orderItems.length === 0) {
      throw new Error('No valid products available for order');
    }

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      subscription: box.subscription._id,
      products: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress: box.shippingAddress || req.user.address || {},
      isPersonalized: box.isPersonalized,
    });

    // Create shipment
    await Shipment.create({ order: order._id });

    // Return success with both box and order info
    const updatedBox = await Box.findById(box._id).populate('products');
    res.json({
      box: updatedBox,
      orderId: order._id,
      message: 'Box confirmed and order created successfully'
    });

  } catch (orderError) {
    console.error('Failed to create order/shipment after box confirmation:', orderError);
    // Still update the box status but let the frontend know about the order creation issue
    const updatedBox = await Box.findById(box._id).populate('products');
    res.json({
      box: updatedBox,
      error: 'Failed to create order/shipment: ' + orderError.message
    });
  }
});

// Get all past boxes (delivery history)
exports.getBoxHistory = asyncHandler(async (req, res) => {
  const boxes = await Box.find({
    user: req.user._id,
    status: { $in: ['shipped', 'delivered'] },
  })
    .populate('products', 'name category price')
    .sort({ createdAt: -1 });

  res.json(boxes);
});

// Admin: get all boxes
exports.getAllBoxes = asyncHandler(async (req, res) => {
  const boxes = await Box.find()
    .populate('user', 'firstName lastName email')
    .populate('products', 'name category')
    .sort({ createdAt: -1 });
  res.json(boxes);
});

// Admin: mark box as shipped
exports.markShipped = asyncHandler(async (req, res) => {
  const box = await Box.findById(req.params.id);
  if (!box) return res.status(404).json({ message: 'Box not found' });
  box.status = 'shipped';
  box.shippedDate = new Date();
  await box.save();
  res.json({ box });
});
