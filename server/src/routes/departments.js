const router = require("express").Router();
const departmentController = require("../controllers/departmentController");

router.get("/", departmentController.listActive);

module.exports = router;
