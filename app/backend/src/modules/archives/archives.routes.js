const router = require("express").Router();
const ctrl = require("./archives.controller");

// ✅ NEW: "/positions" harus di atas "/:id" supaya tidak ketabrak jadi param id
router.get("/positions", ctrl.positions);

router.get("/", ctrl.list);
router.get("/export", ctrl.exportCsv);
router.get("/:id", ctrl.detail);
router.get("/:id/file", ctrl.downloadFile); // ✅ download CV/portfolio via lamaran_id
router.delete("/:id", ctrl.remove);
router.post("/sync", ctrl.sync);

module.exports = router;