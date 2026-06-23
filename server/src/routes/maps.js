const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const ctrl = require("../controllers/mapController");

router.get("/complaints", authenticate, ctrl.getComplaints);
router.get("/nearby", authenticate, ctrl.getNearby);
router.get("/reverse-geocode", authenticate, ctrl.reverseGeocode);

module.exports = router;
