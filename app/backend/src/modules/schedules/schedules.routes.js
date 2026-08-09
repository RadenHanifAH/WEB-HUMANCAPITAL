const router = require("express").Router();
const controller = require("./schedules.controller");

router.get("/applicants", controller.applicants);
router.get("/applicants-by-stage", controller.applicantsByStage);
router.get("/", controller.list);
router.get("/:id", controller.getById);

router.post("/", controller.create);
router.post("/bulk", controller.bulkCreate);

router.patch("/:id/complete", controller.complete);

// Pelamar: konfirmasi hadir / tidak hadir (+ alasan)
router.patch("/:id/confirm-applicant", controller.confirmApplicant);
router.patch("/:id/mark-expired", controller.markExpired);

// HR: override manual
router.patch("/:id/mark-no-show", controller.markNoShow);

// ✅ TAMBAHKAN BARIS INI
router.patch("/:id/reject", controller.reject);

router.delete("/:id", controller.delete);

module.exports = router;