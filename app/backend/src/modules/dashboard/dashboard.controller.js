const service = require("./dashboard.service");

async function getDashboardData(req, res) {
  try {
    const data = await service.getDashboardData();
    return res.status(200).json(data);
  } catch (e) {
    console.error("Dashboard Error:", e);
    return res.status(500).json({
      message: "Gagal memuat dashboard",
      error: e?.message || "Unknown error",
    });
  }
}

module.exports = { getDashboardData };
