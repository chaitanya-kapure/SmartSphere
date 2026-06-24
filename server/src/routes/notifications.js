const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { listRules, markReadRules } = require("../validators/notificationValidators");
const ctrl = require("../controllers/notificationController");

router.get("/", authenticate, listRules, validate, ctrl.list);
router.get("/unread-count", authenticate, ctrl.unreadCount);
router.patch("/read-all", authenticate, ctrl.markAllRead);
router.patch("/:id/read", authenticate, markReadRules, validate, ctrl.markRead);

module.exports = router;
