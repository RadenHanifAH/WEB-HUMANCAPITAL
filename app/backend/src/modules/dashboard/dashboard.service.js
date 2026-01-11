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

    const monthStart = repo.startOfMonth(now);
    const monthEnd = repo.endOfMonth(now);

    const [
      totalPositionsCount,
      activePositionsCount,
      totalApplications,
      applicationsToday,
      acceptedThisMonth,
      latestAppsRows,
      pipelineRows,
      latestReport,
    ] = await Promise.all([
      repo.countJobsTotal(),
      repo.countJobsActive(),
      repo.countAllApplications(),
      repo.countApplicationsBetween(todayStart, todayEnd),
      repo.countAcceptedBetween(monthStart, monthEnd),
      repo.findLatestApplicationsToday(todayStart, todayEnd, 8),
      repo.findAllApplicationsForPipeline(),
      repo.findLatestReport(),
    ]);

    // ✅ Latest Applications (hari ini)
    const latestApplications = (latestAppsRows || []).map((a) => {
      const name = a.user?.profile?.fullName || a.user?.name || "Unknown";
      return {
        id: a.id,
        name,
        position: a.job?.title || "-",
        status: a.stage || a.status || "Under Review",
        time: a.appliedAt ? formatTimeId(a.appliedAt) : "-",
      };
    });

    // ✅ Pipeline
    const counts = {
      "Under Review": 0,
      "Interview HC": 0,
      Psikotes: 0,
      "Final Interview": 0,
    };

    for (const a of pipelineRows || []) {
      const title = repo.normalizeStageTitle(a);
      if (!title) continue;
      counts[title] = (counts[title] || 0) + 1;
    }

    const totalPipeline = Object.values(counts).reduce((s, x) => s + x, 0) || 1;

    const pipeline = [
      {
        title: "Under Review",
        color: "text-orange-500",
        count: counts["Under Review"] || 0,
        value: Math.round(((counts["Under Review"] || 0) / totalPipeline) * 100),
      },
      {
        title: "Interview HC",
        color: "text-blue-500",
        count: counts["Interview HC"] || 0,
        value: Math.round(((counts["Interview HC"] || 0) / totalPipeline) * 100),
      },
      {
        title: "Psikotes",
        color: "text-purple-500",
        count: counts["Psikotes"] || 0,
        value: Math.round(((counts["Psikotes"] || 0) / totalPipeline) * 100),
      },
      {
        title: "Final Interview",
        color: "text-green-500",
        count: counts["Final Interview"] || 0,
        value: Math.round(((counts["Final Interview"] || 0) / totalPipeline) * 100),
      },
    ];

    return {
      stats: {
        totalApplications,
        applicationsToday,
        acceptedThisMonth,
      },
      activePositionsCount,
      totalPositionsCount,
      latestApplications,
      pipeline,
      reportSnapshot: latestReport || null,
    };
  },
};
