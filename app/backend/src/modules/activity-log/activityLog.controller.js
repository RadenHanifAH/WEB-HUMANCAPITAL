const service = require("./activityLog.service");

async function list(req, res) {
  try {
    const result = await service.getLogs(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("ActivityLog List Error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal memuat log aktivitas",
      error: err?.message,
    });
  }
}

async function getById(req, res) {
  try {
    const item = await service.getLogById(req.params.id);
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Gagal memuat detail log",
    });
  }
}

async function getStats(req, res) {
  try {
    const stats = await service.getStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error("ActivityLog Stats Error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal memuat statistik",
      error: err?.message,
    });
  }
}

// ✅ exportCSV & exportExcel sudah dihapus

module.exports = { list, getById, getStats };