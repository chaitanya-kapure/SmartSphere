const router = require("express").Router();
const {
  register,
  login,
  logout,
  refresh,
} = require("../controllers/authController");
const {
  registerRules,
  loginRules,
  refreshRules,
} = require("../validators/authValidators");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.post("/logout", authenticate, logout);
router.post("/refresh", refreshRules, validate, refresh);

module.exports = router;
