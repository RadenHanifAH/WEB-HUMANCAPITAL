const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authMiddleware =  require("../../middleware/auth")

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshAccessToken);
router.post("/logout", authController.logout);
router.get("/profile", authMiddleware.protectRoute, authController.getProfile)
router.put("profile", authMiddleware.protectRoute, authController.updateProfile)

module.exports = router;
