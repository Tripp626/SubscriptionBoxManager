const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

exports.createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body };
  if (req.file) {
    productData.imageUrl = `/uploads/products/${req.file.filename}`;
  }
  if (productData.price) productData.price = parseFloat(productData.price);
  if (productData.quantity) productData.quantity = parseInt(productData.quantity, 10);
  if (productData.tags && typeof productData.tags === 'string') {
    productData.tags = productData.tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  if (productData.isActive !== undefined) {
    productData.isActive = productData.isActive === 'true' || productData.isActive === true;
  }
  if (!productData.imageUrl) delete productData.imageUrl;
  const product = await Product.create(productData);
  res.status(201).json(product);
});

exports.getProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, page = 1, limit = 20, showAll } = req.query;
  const filter = (showAll === 'true') ? {} : { isActive: true };
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }
  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const updateInfo = { ...req.body };
  if (req.file) {
    updateInfo.imageUrl = `/uploads/products/${req.file.filename}`;
  }
  if (updateInfo.price) updateInfo.price = parseFloat(updateInfo.price);
  if (updateInfo.quantity) updateInfo.quantity = parseInt(updateInfo.quantity, 10);
  if (updateInfo.tags && typeof updateInfo.tags === 'string') {
    updateInfo.tags = updateInfo.tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  if (updateInfo.isActive !== undefined) {
    updateInfo.isActive = updateInfo.isActive === 'true' || updateInfo.isActive === true;
  }
  if (updateInfo.imageUrl === '' || updateInfo.imageUrl === 'undefined') {
    updateInfo.imageUrl = null;
  }
  const product = await Product.findByIdAndUpdate(req.params.id, updateInfo, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
});

exports.deactivateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deactivated', product });
});

exports.activateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product activated', product });
});

exports.getLowStock = asyncHandler(async (req, res) => {
  const products = await Product.find({ $expr: { $lte: ['$quantity', '$lowStockThreshold'] }, isActive: true });
  res.json(products);
});
