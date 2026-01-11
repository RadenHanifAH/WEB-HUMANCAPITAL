const router = require("express").Router();
const ctrl = require("./archives.controller");

router.get("/", ctrl.list);
router.get("/export", ctrl.exportCsv);
router.delete("/:id", ctrl.remove);

// ✅ panggil sekali: POST /api/archives/sync
router.post("/sync", ctrl.sync);

module.exports = router;
