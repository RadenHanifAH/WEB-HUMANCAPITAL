const express = require("express");
const router = express.Router();
const controller = require("./activityLog.controller");
const { protectRoute, adminRoute } = require("../../middleware/auth");

// Hanya admin yang boleh akses semua endpoint di sini
router.use(protectRoute, adminRoute);

router.get("/", controller.list);
router.get("/stats", controller.getStats);
router.get("/:id", controller.getById);

// ✅ route /export/csv dan /export/excel sudah dihapus

module.exports = router;