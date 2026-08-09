const router = require("express").Router();
const ctrl = require("./application.controller");
const { protectRoute, adminRoute } = require("../../middleware/auth");

// pelamar apply job (CV & Portofolio diambil otomatis dari dokumen profil)
router.post("/job", protectRoute, ctrl.apply);

// cek kelengkapan dokumen profil sebelum menampilkan tombol "Lamar"
router.get("/profile-readiness", protectRoute, ctrl.checkProfileReadiness);

// cek apakah user sudah melamar lowongan tertentu
router.get("/check/:jobId", protectRoute, ctrl.checkApplication);

// user lihat timeline lamaran terakhir
router.get("/me/latest", protectRoute, ctrl.getMyLatest);

// user lihat list lamaran dia
router.get("/me", protectRoute, ctrl.getMyApplications);

// admin melihat semua lamaran
router.get("/", protectRoute, adminRoute, ctrl.getAll);

// admin download file cv/portfolio dari DB
router.get("/:id/file", protectRoute, adminRoute, ctrl.downloadFile);

// admin update STATUS (tahap otomatis)
router.put("/:id/status", protectRoute, adminRoute, ctrl.updateStatus);

// admin update score
router.put("/:id/score", protectRoute, adminRoute, ctrl.updateScore);

module.exports = router;