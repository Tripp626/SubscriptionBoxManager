const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSubscriptionReport, getSalesReport, getCustomerAnalytics,
} = require('../controllers/reportController');

router.get('/subscriptions', protect, authorize('admin'), getSubscriptionReport);
router.get('/sales', protect, authorize('admin'), getSalesReport);
router.get('/customers', protect, authorize('admin'), getCustomerAnalytics);

module.exports = router;
