const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshAccessToken);
router.post("/logout", authController.logout);
router.get("/profile", authController.getProfile);
router.put("/profile/:id", authController.updateProfile)

module.exports = router;
