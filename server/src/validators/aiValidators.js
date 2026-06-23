const { body, param } = require("express-validator");

const classifyRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be 5–200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be 10–2000 characters"),
];

const overrideRules = [
  param("id").isMongoId().withMessage("Invalid complaint ID"),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority"),
  body("aiSummary")
    .optional()
    .trim()
    .isLength({ max: 200 }),
];

module.exports = { classifyRules, overrideRules };
