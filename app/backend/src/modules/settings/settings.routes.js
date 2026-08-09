const router = require("express").Router();
const controller = require("./settings.controller");

// GET /api/settings
router.get("/", controller.get);

// PUT /api/settings/general
router.put("/general", controller.updateGeneral);

// PUT /api/settings/notifications
router.put("/notifications", controller.updateNotifications);


// PUT /api/settings/system
router.put("/system", controller.updateSystem);

module.exports = router;
