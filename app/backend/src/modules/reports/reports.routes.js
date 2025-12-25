const express = require("express");
const reportsController = require("./reports.controller");

const router = express.Router();

router.get("/metrics", reportsController.getRecruitmentMetrics);
router.get("/charts", reportsController.getChartData);

module.exports = router;
