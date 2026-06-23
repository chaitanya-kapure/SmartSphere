const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/roles");
const upload = require("../middleware/upload");
const ctrl = require("../controllers/uploadController");

router.post(
  "/complaint",
  authenticate,
  authorize("citizen", "super_admin"),
  upload.single("image"),
  ctrl.uploadComplaintImage
);

router.post(
  "/proof",
  authenticate,
  authorize("worker", "dept_head", "super_admin"),
  upload.single("image"),
  ctrl.uploadProofImage
);

module.exports = router;
