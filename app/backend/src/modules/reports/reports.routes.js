const express = require("express");
const reportsController = require("./reports.controller");
const { protectRoute, adminRoute } = require("../../middleware/auth");

const router = express.Router();

// Real-time endpoints
router.get("/metrics", reportsController.getRecruitmentMetrics);
router.get("/charts", reportsController.getChartData);

// Export (Save to DB + Download CSV)
router.get("/export", protectRoute, adminRoute, reportsController.exportReport);

// Saved reports
router.get(
  "/saved",
  protectRoute,
  adminRoute,
  reportsController.getSavedReports
);
router.get(
  "/saved/:id",
  protectRoute,
  adminRoute,
  reportsController.getReportById
);
router.delete(
  "/saved/:id",
  protectRoute,
  adminRoute,
  reportsController.deleteReport
);

module.exports = router;
