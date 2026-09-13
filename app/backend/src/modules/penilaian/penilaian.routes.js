const express = require("express");
const router = express.Router();
const penilaianController = require("./penilaian.controller");
const { protectRoute, adminRoute } = require("../../middleware/auth");

// Semua route penilaian (psikotest & interview) khusus admin

// ---------- PREFILL ----------
router.get("/prefill/:applicationId", protectRoute, adminRoute, penilaianController.getPrefillData);

// ---------- SEARCH KANDIDAT (BARU, untuk autocomplete) ----------
// GET /penilaian/search-candidates?q=budi
router.get("/search-candidates", protectRoute, adminRoute, penilaianController.searchCandidates);

// ---------- PSIKOTEST ----------
router.get("/psikotest", protectRoute, adminRoute, penilaianController.listPsikotest);
router.get(
  "/psikotest/by-application/:applicationId",
  protectRoute, adminRoute,
  penilaianController.getPsikotestByApplication,
);
router.get("/psikotest/:id", protectRoute, adminRoute, penilaianController.getPsikotest);
router.post("/psikotest", protectRoute, adminRoute, penilaianController.createPsikotest);
router.put("/psikotest/:id", protectRoute, adminRoute, penilaianController.updatePsikotest);
router.delete("/psikotest/:id", protectRoute, adminRoute, penilaianController.deletePsikotest);

// ---------- INTERVIEW ----------
// stage dikirim sebagai query param, contoh:
//   GET /interview/by-application/12?stage=1
//   GET /interview?stage=2&page=1
router.get("/interview", protectRoute, adminRoute, penilaianController.listInterview);
router.get(
  "/interview/by-application/:applicationId",
  protectRoute, adminRoute,
  penilaianController.getInterviewByApplication,
);
router.get("/interview/:id", protectRoute, adminRoute, penilaianController.getInterview);
router.post("/interview", protectRoute, adminRoute, penilaianController.createInterview);
router.put("/interview/:id", protectRoute, adminRoute, penilaianController.updateInterview);
router.delete("/interview/:id", protectRoute, adminRoute, penilaianController.deleteInterview);

router.get("/documents", protectRoute, adminRoute, penilaianController.listAssessmentDocuments);

module.exports = router;