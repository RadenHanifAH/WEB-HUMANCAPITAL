const router = require("express").Router();
const controller = require("./settings.controller");
const { protectRoute, adminRoute } = require("../../middleware/auth");

// Pengaturan sistem khusus admin

// GET /api/settings
router.get("/", protectRoute, adminRoute, controller.get);

// PUT /api/settings/general
router.put("/general", protectRoute, adminRoute, controller.updateGeneral);

// PUT /api/settings/notifications
router.put("/notifications", protectRoute, adminRoute, controller.updateNotifications);

// PUT /api/settings/system
router.put("/system", protectRoute, adminRoute, controller.updateSystem);

module.exports = router;