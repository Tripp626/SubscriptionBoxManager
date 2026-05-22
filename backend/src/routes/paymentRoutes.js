const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  processPayment, getMyPayments, getPayment, getAllPayments, refundPayment,
} = require('../controllers/paymentController');

// Customer routes
router.post('/', protect, authorize('customer'), processPayment);
router.get('/my-payments', protect, authorize('customer'), getMyPayments);

// Shared
router.get('/:id', protect, getPayment);

// Admin routes
router.get('/', protect, authorize('admin'), getAllPayments);
router.put('/:id/refund', protect, authorize('admin'), refundPayment);

module.exports = router;
