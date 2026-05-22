const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyBox, customizeBox, confirmBox, getBoxHistory, getAllBoxes, markShipped,
} = require('../controllers/boxController');

// Customer routes
router.get('/my-box', protect, authorize('customer'), getMyBox);
router.put('/:id/customize', protect, authorize('customer'), customizeBox);
router.put('/:id/confirm', protect, authorize('customer'), confirmBox);
router.get('/history', protect, authorize('customer'), getBoxHistory);

// Admin routes
router.get('/', protect, authorize('admin'), getAllBoxes);
router.put('/:id/ship', protect, authorize('admin'), markShipped);

module.exports = router;
