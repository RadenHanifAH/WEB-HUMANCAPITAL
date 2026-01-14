const router = require("express").Router();
const ctrl = require("./application.controller");
const upload = require("../../middleware/upload");
const { protectRoute, adminRoute } = require("../../middleware/auth");

// pelamar apply job (upload masuk DB)
router.post(
  "/job",
  protectRoute,
  upload.fields([
    { name: "cv", maxCount: 1 },
    { name: "portfolio", maxCount: 1 },
  ]),
  ctrl.apply
);

// user lihat timeline
router.get("/me/latest", protectRoute, ctrl.getMyLatest);

// user lihat list lamaran dia
router.get("/me", protectRoute, ctrl.getMyApplications);

// admin melihat semua lamaran
router.get("/", protectRoute, adminRoute, ctrl.getAll);

// admin download file cv/portfolio dari DB
router.get("/:id/file", protectRoute, adminRoute, ctrl.downloadFile);

// admin update STATUS (stage otomatis)
router.put("/:id/status", protectRoute, adminRoute, ctrl.updateStatus);

// admin update score
router.put("/:id/score", protectRoute, adminRoute, ctrl.updateScore);

module.exports = router;
