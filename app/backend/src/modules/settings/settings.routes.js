const router = require("express").Router();
const controller = require("./settings.controller");

// GET /api/settings
router.get("/", controller.get);

// PUT /api/settings/general
router.put("/general", controller.updateGeneral);

// PUT /api/settings/notifications
router.put("/notifications", controller.updateNotifications);

// POST /api/settings/backup  (create dump + update db + return filename)
router.post("/backup", controller.backup);

// GET /api/settings/backup/:filename (download file)
router.get("/backup/:filename", controller.downloadBackup);

// PUT /api/settings/system
router.put("/system", controller.updateSystem);

module.exports = router;
