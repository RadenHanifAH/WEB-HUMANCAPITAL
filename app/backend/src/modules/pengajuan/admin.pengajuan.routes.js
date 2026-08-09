// app/backend/src/modules/admin/admin.pengajuan.routes.js
const express    = require("express");
const router     = express.Router();
const controller = require("./admin.pengajuan.controller");
const { protectRoute, adminRoute } = require("../../middleware/auth");

// Semua route dilindungi: harus login + role admin

// ── Stats (harus di atas /:id agar tidak ter-match sebagai id) ──
router.get("/stats",        protectRoute, adminRoute, controller.getStats);

// ── List & Detail ─────────────────────────────────────────────
router.get("/",             protectRoute, adminRoute, controller.getList);
router.get("/:id",          protectRoute, adminRoute, controller.getById);

// ── Aksi ──────────────────────────────────────────────────────
router.post("/:id/approve", protectRoute, adminRoute, controller.approve);
router.post("/:id/reject",  protectRoute, adminRoute, controller.reject);

module.exports = router;