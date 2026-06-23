const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/roles");
const insightsService = require("../services/ai/insightsService");
const classificationService = require("../services/ai/classificationService");
const priorityService = require("../services/ai/priorityService");
const duplicateDetectionService = require("../services/ai/duplicateDetectionService");
const Complaint = require("../models/Complaint");

router.use(authenticate);

router.get("/insights", authorize("super_admin"), async (req, res, next) => {
  try {
    const result = await insightsService.generate();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/classify", async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const [classification, priority, summary] = await Promise.allSettled([
      classificationService.classify(title, description),
      priorityService.predict(title, description),
      require("../services/ai/summarizationService").summarize(title, description),
    ]);

    res.json({
      classification: classification.status === "fulfilled" ? classification.value : null,
      priority: priority.status === "fulfilled" ? priority.value : null,
      summary: summary.status === "fulfilled" ? summary.value : null,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/detect-duplicate", async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const result = await duplicateDetectionService.check(title, description);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.patch("/override/:id", authorize("super_admin", "dept_head"), async (req, res, next) => {
  try {
    const { category, priority, department, aiSummary } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint || complaint.isDeleted) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    if (category !== undefined) complaint.category = category;
    if (priority !== undefined) complaint.priority = priority;
    if (department !== undefined) complaint.department = department;
    if (aiSummary !== undefined) complaint.aiSummary = aiSummary;

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
