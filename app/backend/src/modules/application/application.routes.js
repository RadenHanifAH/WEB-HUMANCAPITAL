// backend/src/modules/application/application.routes.js (Pastikan ini yang Anda gunakan)

const router = require("express").Router();
const ctrl = require("./application.controller");
const uploadCV = require("../../middleware/upload");

// 🛑 AMBIL FUNGSI DARI OBJEK EXPORTED
const { protectRoute, adminRoute } = require("../../middleware/auth");

// pelamar apply job (POST) - Jika user biasa bisa apply, cukup protectRoute

router.post(
  "/job",
  protectRoute,
  uploadCV.fields([
    { name: "cv", maxCount: 1 },
    { name: "portfolio", maxCount: 1 },
  ]),
  ctrl.apply
);
// admin melihat semua lamaran (GET) - HARUS protectRoute DILANJUTKAN adminRoute
router.get("/", protectRoute, adminRoute, ctrl.getAll);

// admin update status lamaran (PUT)
router.put("/:id/status", protectRoute, adminRoute, ctrl.updateStatus);

// admin update score lamaran
router.put("/:id/score", protectRoute, adminRoute, ctrl.updateScore);

module.exports = router;
