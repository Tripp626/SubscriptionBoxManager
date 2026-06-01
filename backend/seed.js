const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const SubscriptionPlan = require('./src/models/SubscriptionPlan');
const Product = require('./src/models/Product');
const CustomerSubscription = require('./src/models/CustomerSubscription');
const Order = require('./src/models/Order');
const Payment = require('./src/models/Payment');
const Box = require('./src/models/Box');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await SubscriptionPlan.deleteMany({});
  await Product.deleteMany({});
  await CustomerSubscription.deleteMany({});
  await Order.deleteMany({});
  await Payment.deleteMany({});
  await Box.deleteMany({});
  console.log('Cleared existing data');

  // Create admin user
  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@sbms.com',
    password: 'admin123',
    role: 'admin',
    phone: '555-0100',
  });
  console.log('Created admin user: admin@sbms.com / admin123');

  // Create sample customer
  const customer = await User.create({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
    phone: '555-0101',
    address: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'US' },
  });
  console.log('Created customer: jane@example.com / password123');

  // Create subscription plans
  const plans = await SubscriptionPlan.create([
    {
      name: 'Starter Box',
      description: 'A curated selection of 3-5 products perfect for trying out our service.',
      price: 29.99,
      duration: 1,
      frequency: 'monthly',
      benefits: ['3-5 products per box', 'Free shipping', 'Cancel anytime', 'Basic personalization'],
      maxProducts: 5,
      category: 'starter',
    },
    {
      name: 'Premium Box',
      description: 'Our most popular plan with 5-8 premium products tailored to your tastes.',
      price: 49.99,
      duration: 1,
      frequency: 'monthly',
      benefits: ['5-8 products per box', 'Free express shipping', 'Priority support', 'Advanced personalization', 'Exclusive items'],
      maxProducts: 8,
      category: 'premium',
    },
    {
      name: 'Deluxe Box',
      description: 'The ultimate experience with 8-12 luxury products and VIP treatment.',
      price: 79.99,
      duration: 1,
      frequency: 'monthly',
      benefits: ['8-12 products per box', 'Free same-day shipping', 'VIP support', 'AI-powered personalization', 'Exclusive & limited items', 'Early access to new products'],
      maxProducts: 12,
      category: 'deluxe',
    },
  ]);
  console.log(`Created ${plans.length} subscription plans`);

  // Create products
  const products = await Product.create([
    { name: 'Organic Face Serum', description: 'Hydrating vitamin C serum with hyaluronic acid for glowing skin.', price: 24.99, category: 'Beauty', tags: ['skincare', 'organic', 'anti-aging'], quantity: 50, lowStockThreshold: 10, averageRating: 4.5, totalRatings: 12 },
    { name: 'Artisan Coffee Blend', description: 'Single-origin Ethiopian coffee beans, medium roast.', price: 18.99, category: 'Food & Snacks', tags: ['coffee', 'organic', 'artisan'], quantity: 100, lowStockThreshold: 20, averageRating: 4.8, totalRatings: 25},
    { name: 'Wireless Earbuds', description: 'Bluetooth 5.3 earbuds with noise cancellation and 24h battery.', price: 45.99, category: 'Tech & Gadgets', tags: ['audio', 'wireless', 'bluetooth'], quantity: 30, lowStockThreshold: 5, averageRating: 4.2, totalRatings: 8},
    { name: 'Silk Sleep Mask', description: '100% mulberry silk sleep mask for ultimate comfort.', price: 15.99, category: 'Wellness', tags: ['sleep', 'silk', 'luxury'], quantity: 80, lowStockThreshold: 15, averageRating: 4.6, totalRatings: 18},
    { name: 'Scented Candle Set', description: 'Set of 3 hand-poured soy candles: lavender, vanilla, sandalwood.', price: 22.99, category: 'Home & Living', tags: ['candles', 'soy', 'aromatherapy'], quantity: 60, lowStockThreshold: 10, averageRating: 4.4, totalRatings: 15},
    { name: 'Protein Snack Box', description: 'Assorted high-protein snacks: bars, nuts, and jerky.', price: 34.99, category: 'Food & Snacks', tags: ['protein', 'snacks', 'healthy'], quantity: 45, lowStockThreshold: 10, averageRating: 4.3, totalRatings: 20},
    { name: 'Bamboo Desk Organizer', description: 'Eco-friendly bamboo desk organizer with multiple compartments.', price: 28.99, category: 'Home & Living', tags: ['bamboo', 'eco', 'office'], quantity: 25, lowStockThreshold: 5, averageRating: 4.1, totalRatings: 7},
    { name: 'Fitness Resistance Bands', description: 'Set of 5 resistance bands with different strength levels.', price: 19.99, category: 'Wellness', tags: ['fitness', 'exercise', 'resistance'], quantity: 70, lowStockThreshold: 15, averageRating: 4.7, totalRatings: 22},
    { name: 'Portable Phone Charger', description: '10,000mAh power bank with fast charging and dual USB ports.', price: 32.99, category: 'Tech & Gadgets', tags: ['charger', 'portable', 'power'], quantity: 40, lowStockThreshold: 8, averageRating: 4.0, totalRatings: 11},
    { name: 'Luxury Lip Balm Set', description: 'Set of 4 moisturizing lip balms in seasonal flavors.', price: 12.99, category: 'Beauty', tags: ['lip balm', 'moisturizing', 'set'], quantity: 90, lowStockThreshold: 20, averageRating: 4.5, totalRatings: 16},
    { name: 'Gourmet Hot Sauce Collection', description: '5-pack of artisan hot sauces ranging from mild to extreme.', price: 26.99, category: 'Food & Snacks', tags: ['hot sauce', 'gourmet', 'spicy'], quantity: 55, lowStockThreshold: 10, averageRating: 4.6, totalRatings: 14 },
    { name: 'Yoga Mat Premium', description: 'Extra thick 6mm non-slip yoga mat with carrying strap.', price: 38.99, category: 'Wellness', tags: ['yoga', 'fitness', 'exercise'], quantity: 35, lowStockThreshold: 8, averageRating: 4.4, totalRatings: 19 },
  ]);
  console.log(`Created ${products.length} products`);

  // Create a customer subscription
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  const nextBillingDate = new Date(endDate);
  nextBillingDate.setDate(nextBillingDate.getDate() - 7);

  const subscription = await CustomerSubscription.create({
    user: customer._id,
    plan: plans[1]._id, // Premium Box
    status: 'active',
    startDate,
    endDate,
    nextBillingDate,
    autoRenew: true,
    paymentMethod: 'stripe',
  });
  console.log(`Created subscription for ${customer.email} (${plans[1].name})`);

  // Create sample orders with products for top products / sales data
  const makeOrderItems = (items) =>
    items.map(p => {
      const prod = products.find(pr => pr._id.toString() === p.product.toString());
      return { product: p.product, quantity: p.quantity, price: prod.price };
    });

  const orderItems1 = makeOrderItems([
    { product: products[0]._id, quantity: 1 },
    { product: products[1]._id, quantity: 2 },
    { product: products[2]._id, quantity: 1 },
  ]);
  const orderItems2 = makeOrderItems([
    { product: products[1]._id, quantity: 1 },
    { product: products[5]._id, quantity: 3 },
    { product: products[7]._id, quantity: 1 },
    { product: products[3]._id, quantity: 2 },
  ]);
  const orderItems3 = makeOrderItems([
    { product: products[2]._id, quantity: 2 },
    { product: products[9]._id, quantity: 1 },
    { product: products[10]._id, quantity: 2 },
  ]);

  const total1 = orderItems1.reduce((s, p) => s + p.price * p.quantity, 0);
  const total2 = orderItems2.reduce((s, p) => s + p.price * p.quantity, 0);
  const total3 = orderItems3.reduce((s, p) => s + p.price * p.quantity, 0);

  const createdOrders = await Order.create([
    {
      user: customer._id,
      products: orderItems1,
      totalAmount: total1,
      status: 'delivered',
      shippingAddress: customer.address,
      subscription: subscription._id,
      isPersonalized: false,
    },
    {
      user: customer._id,
      products: orderItems2,
      totalAmount: total2,
      status: 'delivered',
      shippingAddress: customer.address,
      subscription: subscription._id,
      isPersonalized: true,
    },
    {
      user: admin._id,
      products: orderItems3,
      totalAmount: total3,
      status: 'processing',
      shippingAddress: { street: '456 Admin Ave', city: 'San Francisco', state: 'CA', zipCode: '94102', country: 'US' },
      isPersonalized: false,
    },
  ]);
  console.log('Created 3 sample orders');

  // Create payments for the orders
  await Payment.create([
    { user: customer._id, order: createdOrders[0]._id, subscription: subscription._id, amount: total1, method: 'stripe', status: 'completed', transactionId: 'txn_' + Date.now() },
    { user: customer._id, order: createdOrders[1]._id, subscription: subscription._id, amount: total2, method: 'stripe', status: 'completed', transactionId: 'txn_' + (Date.now() + 1) },
    { user: admin._id, order: createdOrders[2]._id, amount: total3, method: 'paypal', status: 'completed', transactionId: 'txn_' + (Date.now() + 2) },
  ]);
  console.log('Created 3 sample payments');

  // Create a box for the customer
  await Box.create({
    user: customer._id,
    subscription: subscription._id,
    products: [products[0]._id, products[1]._id, products[3]._id, products[7]._id],
    status: 'auto_generated',
    isPersonalized: false,
    billingDate: nextBillingDate,
    shippingAddress: customer.address,
  });
  console.log('Created sample box for customer');

  console.log('\n--- Seed complete ---');
  console.log('Admin login: admin@sbms.com / admin123');
  console.log('Customer login: jane@example.com / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
