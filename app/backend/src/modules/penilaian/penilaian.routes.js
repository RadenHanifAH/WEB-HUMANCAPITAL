const express = require("express");
const router = express.Router();
const penilaianController = require("./penilaian.controller");

// ---------- PREFILL ----------
router.get("/prefill/:applicationId", penilaianController.getPrefillData);

// ---------- SEARCH KANDIDAT (BARU, untuk autocomplete) ----------
// GET /penilaian/search-candidates?q=budi
router.get("/search-candidates", penilaianController.searchCandidates);

// ---------- PSIKOTEST ----------
router.get("/psikotest", penilaianController.listPsikotest);
router.get(
  "/psikotest/by-application/:applicationId",
  penilaianController.getPsikotestByApplication,
);
router.get("/psikotest/:id", penilaianController.getPsikotest);
router.post("/psikotest", penilaianController.createPsikotest);
router.put("/psikotest/:id", penilaianController.updatePsikotest);
router.delete("/psikotest/:id", penilaianController.deletePsikotest);

// ---------- INTERVIEW ----------
// stage dikirim sebagai query param, contoh:
//   GET /interview/by-application/12?stage=1
//   GET /interview?stage=2&page=1
router.get("/interview", penilaianController.listInterview);
router.get(
  "/interview/by-application/:applicationId",
  penilaianController.getInterviewByApplication,
);
router.get("/interview/:id", penilaianController.getInterview);
router.post("/interview", penilaianController.createInterview);
router.put("/interview/:id", penilaianController.updateInterview);
router.delete("/interview/:id", penilaianController.deleteInterview);

router.get("/documents", penilaianController.listAssessmentDocuments);

module.exports = router;

