const express = require("express");
const router = express.Router();
const jobController = require("./job.controller");
const authMiddleware = require("../../middleware/auth");

router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);
router.post("/", authMiddleware.protectRoute, jobController.createJob);
router.put("/:id", authMiddleware.protectRoute, jobController.updateJob);
router.delete("/:id",authMiddleware.protectRoute, jobController.deleteJob);

module.exports = router;
