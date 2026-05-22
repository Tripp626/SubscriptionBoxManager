const asyncHandler = require('../middleware/asyncHandler');
const Notification = require('../models/Notification');

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true },
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked as read' });
});

exports.sendNotification = asyncHandler(async (req, res) => {
  const { userId, type, subject, message, sentVia } = req.body;
  const notification = await Notification.create({
    user: userId, type, subject, message, sentVia: sentVia || 'in_app',
  });
  res.status(201).json(notification);
});

exports.getAllNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().populate('user', 'firstName lastName email').sort({ createdAt: -1 });
  res.json(notifications);
});
