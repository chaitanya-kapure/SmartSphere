const { body, param } = require("express-validator");

const createComplaintRules = [
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

  body("category").optional().trim(),

  body("address").optional().trim(),

  body("location")
    .optional()
    .isObject()
    .withMessage("Location must be an object"),

  body("location.coordinates")
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage("Coordinates must be [lng, lat]"),

  body("images")
    .optional()
    .isArray({ max: 5 })
    .withMessage("Maximum 5 images allowed"),
];

const updateStatusRules = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn([
      "pending",
      "assigned",
      "in_progress",
      "verification",
      "resolved",
      "rejected",
      "reopened",
    ])
    .withMessage("Invalid status value"),

  body("remark").optional().trim().isLength({ max: 500 }),
];

const assignRules = [
  body("workerId")
    .notEmpty()
    .withMessage("Worker ID is required")
    .isMongoId()
    .withMessage("Invalid worker ID"),
];

const complaintIdRule = [
  param("id").isMongoId().withMessage("Invalid complaint ID"),
];

module.exports = {
  createComplaintRules,
  updateStatusRules,
  assignRules,
  complaintIdRule,
};
