const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPlan, getPlans, getAllPlans, updatePlan, deletePlan,
  subscribe, getMySubscriptions, cancelSubscription, renewSubscription,
  pauseSubscription, resumeSubscription, skipNextBilling, getAllSubscriptions,
} = require('../controllers/subscriptionController');

// Public routes
router.get('/plans', getPlans);

// Customer routes
router.post('/subscribe', protect, authorize('customer'), subscribe);
router.get('/my-subscriptions', protect, authorize('customer'), getMySubscriptions);
router.put('/cancel/:id', protect, authorize('customer'), cancelSubscription);
router.put('/renew/:id', protect, authorize('customer'), renewSubscription);
router.put('/pause/:id', protect, authorize('customer'), pauseSubscription);
router.put('/resume/:id', protect, authorize('customer'), resumeSubscription);
router.put('/skip/:id', protect, authorize('customer'), skipNextBilling);

// Admin routes
router.get('/admin/plans', protect, authorize('admin'), getAllPlans);
router.post('/admin/plans', protect, authorize('admin'), createPlan);
router.put('/admin/plans/:id', protect, authorize('admin'), updatePlan);
router.delete('/admin/plans/:id', protect, authorize('admin'), deletePlan);
router.get('/admin/subscriptions', protect, authorize('admin'), getAllSubscriptions);

module.exports = router;
