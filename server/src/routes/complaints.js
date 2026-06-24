const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/roles");
const validate = require("../middleware/validate");
const {
  createComplaintRules,
  updateStatusRules,
  assignRules,
  rejectRules,
  complaintIdRule,
} = require("../validators/complaintValidators");
const ctrl = require("../controllers/complaintController");

router.post(
  "/",
  authenticate,
  authorize("citizen", "super_admin"),
  createComplaintRules,
  validate,
  ctrl.create
);

router.get("/", authenticate, ctrl.list);

router.get("/:id", authenticate, complaintIdRule, validate, ctrl.getById);

router.put("/:id", authenticate, complaintIdRule, validate, ctrl.update);

router.delete(
  "/:id",
  authenticate,
  complaintIdRule,
  validate,
  ctrl.remove
);

router.post(
  "/:id/assign",
  authenticate,
  authorize("dept_head", "super_admin"),
  complaintIdRule,
  assignRules,
  validate,
  ctrl.assign
);

router.post(
  "/:id/status",
  authenticate,
  authorize("worker", "dept_head", "super_admin"),
  complaintIdRule,
  updateStatusRules,
  validate,
  ctrl.updateStatus
);

router.post(
  "/:id/approve",
  authenticate,
  authorize("dept_head", "super_admin"),
  complaintIdRule,
  validate,
  ctrl.approve
);

router.post(
  "/:id/reject",
  authenticate,
  authorize("dept_head", "super_admin"),
  complaintIdRule,
  rejectRules,
  validate,
  ctrl.reject
);

router.get(
  "/:id/timeline",
  authenticate,
  complaintIdRule,
  validate,
  ctrl.timeline
);

module.exports = router;
