// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const { findUserById } = require("../modules/auth/auth.repository");

const protectRoute = async (req, res, next) => {
  try {
    // ✅ 1) Ambil access token (prioritas cookie)
    const tokenFromCookie = req.cookies?.accessToken;

    // optional: support Bearer token juga
    const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    const accessToken = tokenFromCookie || tokenFromHeader;

    if (!accessToken) {
      return res.status(401).json({
        message: "Unauthorized - No access token provided",
      });
    }

    // ✅ 2) Verify token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err?.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Unauthorized - Access token expired",
        });
      }
      return res.status(401).json({
        message: "Unauthorized - Invalid access token",
      });
    }

    // ✅ 3) Validasi payload
    if (!decoded?.id) {
      return res.status(401).json({
        message: "Unauthorized - Invalid token payload",
      });
    }

    // ✅ 4) Ambil user dari DB
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized - User not found",
      });
    }

    // ✅ 5) Jangan expose password (dan field sensitif lain kalau ada)
    const safeUser = { ...user };
    delete safeUser.password;

    // taruh ke req.user (biar controller bisa pakai)
    req.user = safeUser;

    return next();
  } catch (error) {
    console.error("protectRoute error:", error);
    return res.status(500).json({
      message: "Server error in auth middleware",
      error: error.message,
    });
  }
};

const adminRoute = (req, res, next) => {
  try {
    // pastikan protectRoute sudah jalan dulu
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role === "admin") {
      return next();
    }

    return res.status(403).json({
      message: "Access denied - admin only",
    });
  } catch (error) {
    console.error("adminRoute error:", error);
    return res.status(500).json({
      message: "Server error in admin middleware",
      error: error.message,
    });
  }
};

module.exports = {
  protectRoute,
  adminRoute,
};
