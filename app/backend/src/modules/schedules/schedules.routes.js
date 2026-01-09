// backend/src/modules/schedules/schedules.routes.js
const router = require("express").Router();
const controller = require("./schedules.controller");

router.get("/", controller.list);
router.get("/applicants", controller.applicants);

router.post("/", controller.create);
router.patch("/:id/complete", controller.complete);
router.delete("/:id", controller.delete);

module.exports = router;
