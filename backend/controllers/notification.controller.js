const mongoose = require('mongoose');
const Notification = require('../models/notification.model');

const listNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 40));

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ userId, read: false }),
    ]);

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications: notifications.map((n) => ({
        id: n._id,
        type: n.type,
        titleEn: n.titleEn,
        titleHi: n.titleHi,
        messageEn: n.messageEn,
        messageHi: n.messageHi,
        read: n.read,
        createdAt: n.createdAt,
        meta: n.meta || {},
      })),
    });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to load notifications' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid notification id' });
    }

    const updated = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return res.status(200).json({
      success: true,
      notification: { id: updated._id, read: true },
      unreadCount,
    });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });

    return res.status(200).json({
      success: true,
      unreadCount: 0,
    });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to mark all read' });
  }
};

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
