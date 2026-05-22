const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createFeedback, getProductFeedback, getMyFeedback, getAllFeedback,
} = require('../controllers/feedbackController');

// Public
router.get('/product/:productId', getProductFeedback);

// Customer
router.post('/', protect, authorize('customer'), createFeedback);
router.get('/my-feedback', protect, authorize('customer'), getMyFeedback);

// Admin
router.get('/', protect, authorize('admin'), getAllFeedback);

module.exports = router;
