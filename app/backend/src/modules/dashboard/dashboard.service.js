const repo = require("./dashboard.repository");

function pad2(n) {
  return String(n).padStart(2, "0");
}
function formatTimeId(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

module.exports = {
  async getDashboardData() {
    const now = new Date();

    const todayStart = repo.startOfDay(now);
    const todayEnd = repo.endOfDay(now);

    const [
      totalPositionsCount,
      activePositionsCount,
      totalApplications,
      applicationsToday,
      latestAppsRows,
      pipelineRows,
    ] = await Promise.all([
      repo.countJobsTotal(),
      repo.countJobsActive(),
      repo.countAllApplications(),
      repo.countApplicationsBetween(todayStart, todayEnd),
      repo.findLatestApplicationsToday(todayStart, todayEnd, 8),
      repo.findAllApplicationsForPipeline(),
      // repo.findLatestReport(), // ❌ Dihapus
    ]);

    // ✅ FIX: ambil nama dari pengguna.nama, foto dari profil.foto_profil
    const latestApplications = (latestAppsRows || []).map((a) => {
      return {
        id: a.id,
        name: a.pengguna?.nama || "Unknown",
        fotoProfile: a.pengguna?.profil?.foto_profil || null,
        position: a.lowongan?.judul || "-",
        status: a.tahap || a.status || "Screaning",
        time: a.tanggal_melamar ? formatTimeId(a.tanggal_melamar) : "-",
      };
    });

    // ✅ Pipeline (nama stage baru)
    const counts = {
      "Screaning": 0,
      "Interview Pertama": 0,
      Psikotes: 0,
      "Interview Kedua": 0,
    };

    for (const a of pipelineRows || []) {
      const title = repo.normalizeStageTitle(a);
      if (!title) continue;
      counts[title] = (counts[title] || 0) + 1;
    }

    const totalPipeline = Object.values(counts).reduce((s, x) => s + x, 0) || 1;

    const pipeline = [
      {
        title: "Screaning",
        color: "text-orange-500",
        count: counts["Screaning"] || 0,
        value: Math.round(((counts["Screaning"] || 0) / totalPipeline) * 100),
      },
      {
        title: "Interview Pertama",
        color: "text-blue-500",
        count: counts["Interview Pertama"] || 0,
        value: Math.round(((counts["Interview Pertama"] || 0) / totalPipeline) * 100),
      },
      {
        title: "Psikotes",
        color: "text-purple-500",
        count: counts["Psikotes"] || 0,
        value: Math.round(((counts["Psikotes"] || 0) / totalPipeline) * 100),
      },
      {
        title: "Interview Kedua",
        color: "text-green-500",
        count: counts["Interview Kedua"] || 0,
        value: Math.round(((counts["Interview Kedua"] || 0) / totalPipeline) * 100),
      },
    ];

    return {
      stats: {
        totalApplications,
        applicationsToday,
      },
      activePositionsCount,
      totalPositionsCount,
      latestApplications,
      pipeline,
      reportSnapshot: null, // ✅ Dibuat null default
    };
  },
};