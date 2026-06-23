const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

router.get("/public", (req, res) => {
  res.json({ message: "Anyone can see this" });
});

router.get("/authenticated", authenticate, (req, res) => {
  res.json({ message: `Hello ${req.user.role}`, user: req.user });
});

router.get("/citizen-only", authenticate, authorize("citizen"), (req, res) => {
  res.json({ message: "Citizen dashboard", user: req.user });
});

router.get("/worker-only", authenticate, authorize("worker"), (req, res) => {
  res.json({ message: "Worker dashboard", user: req.user });
});

router.get(
  "/dept-head-only",
  authenticate,
  authorize("dept_head"),
  (req, res) => {
    res.json({ message: "Department head dashboard", user: req.user });
  }
);

router.get(
  "/admin-only",
  authenticate,
  authorize("super_admin"),
  (req, res) => {
    res.json({ message: "Admin dashboard", user: req.user });
  }
);

router.get(
  "/multi-role",
  authenticate,
  authorize("dept_head", "super_admin"),
  (req, res) => {
    res.json({ message: "Dept head or admin", user: req.user });
  }
);

module.exports = router;
