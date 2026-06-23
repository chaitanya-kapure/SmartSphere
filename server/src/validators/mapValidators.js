const { query } = require("express-validator");

const nearbyRules = [
  query("lng")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
  query("lat")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  query("maxDistance")
    .optional()
    .isFloat({ min: 100, max: 50000 })
    .withMessage("maxDistance must be 100–50000 meters"),
];

const reverseGeocodeRules = [
  query("lat")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  query("lng")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
];

module.exports = { nearbyRules, reverseGeocodeRules };
