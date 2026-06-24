const Notification = require("../models/Notification");
const { getIO } = require("../socket");

class NotificationService {
  async create({ recipient, type, title, message, complaint }) {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      complaint,
    });

    try {
      const io = getIO();
      io.to(`user:${recipient}`).emit("notification", notification);
    } catch {
      // Socket not available — notification still persisted
    }

    return notification;
  }

  async list(userId, query = {}) {
    const filter = { recipient: userId };
    if (query.unreadOnly === "true") {
      filter.isRead = false;
    }
    return Notification.find(filter)
      .populate("complaint", "complaintId title status")
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      const { AppError } = require("../utils/errors");
      throw new AppError("Notification not found", 404);
    }
    return notification;
  }

  async markAllRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId) {
    return Notification.countDocuments({ recipient: userId, isRead: false });
  }
}

module.exports = new NotificationService();
