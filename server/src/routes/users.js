const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/roles");
const ctrl = require("../controllers/userController");

router.get(
  "/workers",
  authenticate,
  authorize("dept_head", "super_admin"),
  ctrl.listWorkers
);

module.exports = router;
