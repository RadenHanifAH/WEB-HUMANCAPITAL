const express = require("express");
const router = express.Router();
const jobController = require("./job.controller");
const { protectRoute, adminRoute } = require("../../middleware/auth");

// Publik: siapa saja boleh lihat daftar lowongan
router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);

// Khusus admin: create/update/delete lowongan
router.post("/", protectRoute, adminRoute, jobController.createJob);
router.put("/:id", protectRoute, adminRoute, jobController.updateJob);
router.delete("/:id", protectRoute, adminRoute, jobController.deleteJob);

module.exports = router;