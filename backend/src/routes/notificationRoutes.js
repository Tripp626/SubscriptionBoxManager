const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyNotifications, markAsRead, markAllAsRead, sendNotification, getAllNotifications,
} = require('../controllers/notificationController');

// Customer routes
router.get('/', protect, getMyNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

// Admin routes
router.post('/send', protect, authorize('admin'), sendNotification);
router.get('/admin/all', protect, authorize('admin'), getAllNotifications);

module.exports = router;
