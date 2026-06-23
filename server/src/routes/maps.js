const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { nearbyRules, reverseGeocodeRules } = require("../validators/mapValidators");
const ctrl = require("../controllers/mapController");

router.get("/complaints", authenticate, ctrl.getComplaints);
router.get("/nearby", authenticate, nearbyRules, validate, ctrl.getNearby);
router.get("/reverse-geocode", authenticate, reverseGeocodeRules, validate, ctrl.reverseGeocode);

module.exports = router;
