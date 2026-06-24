const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { nearbyRules, reverseGeocodeRules, searchRules } = require("../validators/mapValidators");
const ctrl = require("../controllers/mapController");

router.get("/complaints", authenticate, ctrl.getComplaints);
router.get("/nearby", authenticate, nearbyRules, validate, ctrl.getNearby);
router.get("/reverse-geocode", authenticate, reverseGeocodeRules, validate, ctrl.reverseGeocode);
router.get("/search", authenticate, searchRules, validate, ctrl.searchLocation);

module.exports = router;
