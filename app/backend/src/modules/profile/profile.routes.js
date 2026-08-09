const express = require("express");
const router = express.Router();
const ctrl = require("./profile.controller");
const auth = require("../../middleware/auth");
const { uploadCertificate } = require("./profile.upload");

// Semua route butuh login
router.use(auth.protectRoute);

// Full profile sekaligus
router.get("/full", ctrl.getFullProfile);

// Work Experience
router.get("/work-experience", ctrl.getWorkExperiences);
router.post("/work-experience", ctrl.createWorkExperience);
router.put("/work-experience/:id", ctrl.updateWorkExperience);
router.delete("/work-experience/:id", ctrl.deleteWorkExperience);

// Education
router.get("/education", ctrl.getEducations);
router.post("/education", ctrl.createEducation);
router.put("/education/:id", ctrl.updateEducation);
router.delete("/education/:id", ctrl.deleteEducation);

// Organization
router.get("/organization", ctrl.getOrganizations);
router.post("/organization", ctrl.createOrganization);
router.put("/organization/:id", ctrl.updateOrganization);
router.delete("/organization/:id", ctrl.deleteOrganization);

// Certificate
router.get("/certificate", ctrl.getCertificates);
router.post("/certificate", uploadCertificate, ctrl.createCertificate);
router.put("/certificate/:id", uploadCertificate, ctrl.updateCertificate);
router.delete("/certificate/:id", ctrl.deleteCertificate);

// Skills
router.get("/skills", ctrl.getUserSkills);
router.put("/skills", ctrl.replaceUserSkills);

module.exports = router;