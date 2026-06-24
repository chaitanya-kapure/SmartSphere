const { query, param } = require("express-validator");

const listRules = [
  query("unreadOnly")
    .optional()
    .isIn(["true", "false"])
    .withMessage("unreadOnly must be true or false"),
];

const markReadRules = [
  param("id").isMongoId().withMessage("Invalid notification ID"),
];

module.exports = { listRules, markReadRules };
