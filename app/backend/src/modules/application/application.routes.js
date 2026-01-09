const router = require("express").Router();
const ctrl = require("./application.controller");
const uploadCV = require("../../middleware/upload");
const { protectRoute, adminRoute } = require("../../middleware/auth");

// pelamar apply job
router.post(
  "/job",
  protectRoute,
  uploadCV.fields([
    { name: "cv", maxCount: 1 },
    { name: "portfolio", maxCount: 1 },
  ]),
  ctrl.apply
);

// admin melihat semua lamaran
router.get("/", protectRoute, adminRoute, ctrl.getAll);

// ✅ admin update STATUS saja (stage akan otomatis ikut status di service)
router.put("/:id/status", protectRoute, adminRoute, ctrl.updateStatus);

// admin update score
router.put("/:id/score", protectRoute, adminRoute, ctrl.updateScore);

// user lihat timeline
router.get("/me/latest", protectRoute, ctrl.getMyLatest);

module.exports = router;
