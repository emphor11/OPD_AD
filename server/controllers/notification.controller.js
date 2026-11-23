const Notification = require('../models/Notification');

// @desc Get user notifications
// @route GET /api/notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching notifications' });
  }
};

// @desc Mark single notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating notification' });
  }
};

// @desc Mark all user notifications as read
// @route PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error marking all notifications as read' });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
