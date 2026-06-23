const { query, param } = require("express-validator");

const mongoIdParam = (name = "id") =>
  param(name).isMongoId().withMessage(`Invalid ${name}`);

const paginationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage("Limit must be 1–100"),
  query("sort")
    .optional()
    .trim()
    .isIn(["createdAt", "updatedAt", "priority", "status"])
    .withMessage("Invalid sort field"),
];

const statusFilter = query("status")
  .optional()
  .trim()
  .isIn(["pending", "assigned", "in_progress", "verification", "resolved", "rejected", "reopened"])
  .withMessage("Invalid status filter");

const priorityFilter = query("priority")
  .optional()
  .trim()
  .isIn(["low", "medium", "high", "critical"])
  .withMessage("Invalid priority filter");

module.exports = { mongoIdParam, paginationRules, statusFilter, priorityFilter };
