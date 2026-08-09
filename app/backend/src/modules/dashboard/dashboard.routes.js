const router = require("express").Router();
const ctrl = require("./dashboard.controller");
const { protectRoute, adminRoute } = require("../../middleware/auth");

// ✅ Dashboard admin (butuh login + role admin)
router.get("/data", protectRoute, adminRoute, ctrl.getDashboardData);

module.exports = router;