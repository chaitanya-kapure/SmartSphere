const notificationService = require("../services/notificationService");

exports.list = async (req, res, next) => {
  try {
    const notifications = await notificationService.list(req.user.id, req.query);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markRead(
      req.params.id,
      req.user.id
    );
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user.id);
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

exports.unreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (err) {
    next(err);
  }
};
