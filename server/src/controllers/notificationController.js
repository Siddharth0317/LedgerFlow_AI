import Notification from '../models/Notification.js';

/**
 * @desc    Get user notifications and unread count
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res, next) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
      Notification.countDocuments({ owner: req.user._id, read: false }),
    ]);

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ owner: req.user._id, read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
