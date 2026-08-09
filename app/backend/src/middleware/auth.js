// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const { findUserById } = require("../modules/auth/auth.repository");

const protectRoute = async (req, res, next) => {
  try {
    const tokenFromCookie = req.cookies?.accessToken;
    const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    const accessToken = tokenFromCookie || tokenFromHeader;

    if (!accessToken) {
      return res.status(401).json({
        message: "Unauthorized - No access token provided",
      });
    }

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

    if (!decoded?.id) {
      return res.status(401).json({
        message: "Unauthorized - Invalid token payload",
      });
    }

    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized - User not found",
      });
    }

    const safeUser = { ...user };
    delete safeUser.password;

    // ⚠️ FIX: kolom di model `pengguna` bernama `peran` (bukan `role`).
    // `user` di sini adalah row database MENTAH dari findUserById
    // (prisma.pengguna.findUnique), jadi cuma punya `peran`, tidak
    // pernah punya `role`. Middleware lain (adminRoute, divisiRoute,
    // dan requireAdmin di users.routes.js) semua mengecek `req.user.role`,
    // sehingga tanpa baris ini pengecekan itu SELALU gagal walau JWT
    // payload-nya sendiri sudah benar berisi `role`.
    safeUser.role = user.peran;

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
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user?.role === "admin") {
      return next();
    }
    return res.status(403).json({ message: "Access denied - admin only" });
  } catch (error) {
    console.error("adminRoute error:", error);
    return res.status(500).json({
      message: "Server error in admin middleware",
      error: error.message,
    });
  }
};

// ✅ Siapapun yang login pakai akun role "divisi" boleh masuk
const divisiRoute = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user?.role === "divisi") {
      return next();
    }
    return res.status(403).json({ message: "Access denied - divisi only" });
  } catch (error) {
    console.error("divisiRoute error:", error);
    return res.status(500).json({
      message: "Server error in divisi middleware",
      error: error.message,
    });
  }
};

module.exports = {
  protectRoute,
  adminRoute,
  divisiRoute,
};