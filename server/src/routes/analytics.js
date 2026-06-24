const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const ctrl = require("../controllers/analyticsController");

router.use(authenticate);

router.get("/stats", ctrl.stats);
router.get("/monthly-trend", ctrl.monthlyTrend);
router.get("/department-distribution", ctrl.departmentDistribution);
router.get("/status-distribution", ctrl.statusDistribution);
router.get("/priority-distribution", ctrl.priorityDistribution);
router.get("/area-trend", ctrl.areaTrend);
router.get("/worker-performance", ctrl.workerPerformance);

module.exports = router;
