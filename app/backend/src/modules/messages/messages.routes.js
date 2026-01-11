const router = require("express").Router();
const controller = require("./messages.controller");

// GET /api/messages?q=&status=&direction=&page=&pageSize=
router.get("/", controller.list);

// POST /api/messages/send
router.post("/send", controller.send);

// ✅ DELETE /api/messages/bulk?q=&status=
router.delete("/bulk", controller.deleteBulk);

// ✅ DELETE /api/messages/:id
router.delete("/:id", controller.deleteOne);

module.exports = router;
