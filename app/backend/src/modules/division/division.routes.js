const express = require("express");
const router = express.Router();
const controller = require("./division.controller");
const { protectRoute, divisiRoute } = require("../../middleware/auth");

// ─── Dashboard ─────────────────────────────────────────────────
router.get(
  "/dashboard",
  protectRoute,
  divisiRoute,
  controller.getDivisiDashboard,
);

// ─── Pengajuan SDM ─────────────────────────────────────────────
router.get(
  "/pengajuan",
  protectRoute,
  divisiRoute,
  controller.getPengajuanList,
);

router.get(
  "/pengajuan/:id",
  protectRoute,
  divisiRoute,
  controller.getPengajuanById,
);

router.post(
  "/pengajuan",
  protectRoute,
  divisiRoute,
  controller.createPengajuan,
);

router.put(
  "/pengajuan/:id",
  protectRoute,
  divisiRoute,
  controller.updatePengajuan,
);

router.delete(
  "/pengajuan/:id",
  protectRoute,
  divisiRoute,
  controller.deletePengajuan,
);

router.post(
  "/pengajuan/:id/submit",
  protectRoute,
  divisiRoute,
  controller.submitPengajuan,
);


module.exports = router;