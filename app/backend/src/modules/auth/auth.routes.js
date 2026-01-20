// src/modules/auth/auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authMiddleware = require("../../middleware/auth");

router.post("/register", authController.register); // kirim OTP
router.post("/verify-otp", authController.verifyOtp); // validasi OTP + create user
router.post("/resend-otp", authController.resendOtp); // kirim ulang OTP

router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshAccessToken);
router.post("/logout", authController.logout);

router.get("/profile", authMiddleware.protectRoute, authController.getProfile);
router.put(
  "/profile",
  authMiddleware.protectRoute,
  authController.updateProfile,
);

router.put(
  "/change-password",
  authMiddleware.protectRoute,
  authController.changePassword,
);

router.post("/password-reset/request", authController.requestReset);
router.post("/password-reset/confirm", authController.confirmReset);

module.exports = router;
