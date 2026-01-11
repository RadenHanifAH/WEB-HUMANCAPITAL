const express = require("express");
const reportsController = require("./reports.controller");
const { protectRoute, adminRoute } = require("../../middleware/auth");

const router = express.Router();

router.get("/metrics", reportsController.getRecruitmentMetrics);
router.get("/charts", reportsController.getChartData);

// export xlsx
router.get("/export", protectRoute, adminRoute, reportsController.exportReport);

module.exports = router;
