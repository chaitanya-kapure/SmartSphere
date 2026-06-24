const { body } = require("express-validator");

const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2–100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["citizen", "worker", "dept_head", "super_admin"])
    .withMessage("Role must be one of: citizen, worker, dept_head, super_admin"),

  body("department")
    .if((value, { req }) => req.body.role === "dept_head" || req.body.role === "worker")
    .notEmpty()
    .withMessage("Department is required for this role")
    .isMongoId()
    .withMessage("Invalid department ID"),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const refreshRules = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required"),
];

module.exports = { registerRules, loginRules, refreshRules };
