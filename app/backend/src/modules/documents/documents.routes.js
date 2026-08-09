const express = require("express");
const router = express.Router();
const ctrl = require("./documents.controller");
const { protectRoute } = require("../../middleware/auth");
const uploadDocument = require("../../middleware/uploadDocument");

router.use(protectRoute);

// Ambil status dokumen (cv + portofolio) milik user
router.get("/", ctrl.getDocuments);

// Upload / ganti CV
router.post(
  "/cv",
  uploadDocument.fields([{ name: "cv", maxCount: 1 }]),
  ctrl.uploadCv,
);

// Upload / ganti Portofolio via FILE
router.post(
  "/portfolio/file",
  uploadDocument.fields([{ name: "portfolio", maxCount: 1 }]),
  ctrl.uploadPortfolioFile,
);

// Set / ganti Portofolio via LINK eksternal
router.put("/portfolio/link", ctrl.setPortfolioLink);

// Hapus CV
router.delete("/cv", ctrl.deleteCv);

// Hapus Portofolio
router.delete("/portfolio", ctrl.deletePortfolio);

module.exports = router;