const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  tags: [{ type: String }],
  imageUrl: { type: String },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text' });

// Ensure indexes are built when the model is loaded
const Product = mongoose.model('Product', productSchema);
Product.createIndexes().catch(() => {});

module.exports = Product;
