// app/backend/src/modules/notifications/notifications.routes.js
const router = require("express").Router();
const controller = require("./notifications.controller");

router.get("/recent", controller.getRecent);
router.get("/", controller.getAll);

router.patch("/read-all", controller.markAllAsRead);
router.patch("/:id/read", controller.markAsRead);

router.delete("/:id", controller.remove);

module.exports = router;