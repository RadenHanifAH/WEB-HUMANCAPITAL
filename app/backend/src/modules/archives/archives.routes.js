const router = require("express").Router();
const ctrl = require("./archives.controller");
const { protectRoute, adminRoute } = require("../../middleware/auth");

// Semua route arsip khusus admin (data pelamar yang sudah diarsipkan)

// ✅ NEW: "/positions" harus di atas "/:id" supaya tidak ketabrak jadi param id
router.get("/positions", protectRoute, adminRoute, ctrl.positions);

router.get("/", protectRoute, adminRoute, ctrl.list);
router.get("/export", protectRoute, adminRoute, ctrl.exportCsv);
router.get("/:id", protectRoute, adminRoute, ctrl.detail);
router.get("/:id/file", protectRoute, adminRoute, ctrl.downloadFile); // download CV/portfolio via lamaran_id
router.delete("/:id", protectRoute, adminRoute, ctrl.remove);
router.post("/sync", protectRoute, adminRoute, ctrl.sync);

module.exports = router;