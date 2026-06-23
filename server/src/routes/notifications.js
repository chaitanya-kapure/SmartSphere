const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const ctrl = require("../controllers/notificationController");

router.get("/", authenticate, ctrl.list);
router.get("/unread-count", authenticate, ctrl.unreadCount);
router.patch("/read-all", authenticate, ctrl.markAllRead);
router.patch("/:id/read", authenticate, ctrl.markRead);

module.exports = router;
