const express = require("express");
const router = express.Router();
const usersController = require("./users.controller");
const authMiddleware = require("../../middleware/auth");

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Akses ditolak. Khusus admin." });
  }
  next();
}

router.use(authMiddleware.protectRoute, requireAdmin);

router.get("/", usersController.getUsers);
router.get("/export", usersController.exportUsers);
router.post("/", usersController.postUser);
router.put("/:id", usersController.putUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;