const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createProduct, getProducts, getProduct, updateProduct, deleteProduct, deactivateProduct, activateProduct, getLowStock,
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('image'), createProduct);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.put('/:id/deactivate', protect, authorize('admin'), deactivateProduct);
router.put('/:id/activate', protect, authorize('admin'), activateProduct);
router.get('/admin/low-stock', protect, authorize('admin'), getLowStock);

module.exports = router;
