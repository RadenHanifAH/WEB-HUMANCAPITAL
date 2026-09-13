const router = require("express").Router();
const controller = require("./schedules.controller");
const { protectRoute, adminRoute } = require("../../middleware/auth");

// =========================
// GET
// =========================
router.get("/applicants", protectRoute, adminRoute, controller.applicants);
router.get("/applicants-by-stage", protectRoute, adminRoute, controller.applicantsByStage);

router.get("/me", protectRoute, controller.mySchedules);

router.get("/", protectRoute, adminRoute, controller.list);
router.get("/:id", protectRoute, controller.getById);

// =========================
// POST
// =========================
router.post("/", protectRoute, adminRoute, controller.create);
router.post("/bulk", protectRoute, adminRoute, controller.bulkCreate);
router.patch("/:id/complete", protectRoute, adminRoute, controller.complete);

// Tetap protectRoute saja (bukan adminRoute) — dipakai juga oleh pelamar
// publik lewat link email berbasis token, lihat komentar di controller.
router.patch("/:id/confirm-applicant", protectRoute, controller.confirmApplicant);

// Lihat catatan di bawah soal mark-expired
router.patch("/:id/mark-expired", controller.markExpired);

router.patch("/:id/mark-no-show", protectRoute, adminRoute, controller.markNoShow);
router.patch("/:id/reject", protectRoute, adminRoute, controller.reject);

// =========================
// DELETE
// =========================
router.delete("/:id", protectRoute, adminRoute, controller.delete);

module.exports = router;