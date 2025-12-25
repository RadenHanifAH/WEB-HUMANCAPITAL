const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ReportsService {
  async getReportsByPeriod(period) {
    // Ambil semua data pelamar
    const applications = await prisma.application.findMany();

    // Logika pengelompokan trend
    const trendMap = {};
    applications.forEach((app) => {
      const date = new Date(app.appliedAt);
      let label = date.toLocaleDateString("id-ID"); 
      
      if (period === "monthly") {
        label = date.toLocaleString("id-ID", { month: "long", year: "numeric" });
      } else if (period === "yearly") {
        label = date.getFullYear().toString();
      }
      trendMap[label] = (trendMap[label] || 0) + 1;
    });

    return {
      chartTrend: {
        labels: Object.keys(trendMap),
        applications: Object.values(trendMap),
      },
      chartAcceptance: {
        labels: ["Diterima", "Ditolak", "Review"],
        values: [
          // Gunakan toLowerCase agar tidak error karena perbedaan huruf kapital
          applications.filter((a) => a.status?.toLowerCase() === "accepted").length,
          applications.filter((a) => a.status?.toLowerCase() === "rejected").length,
          applications.filter((a) => 
            a.status?.toLowerCase() === "under-review" || 
            a.status?.toLowerCase() === "under review"
          ).length,
        ],
      },
    };
  }

  async getOverallMetrics() {
    const totalApps = await prisma.application.count();
    const allApps = await prisma.application.findMany({ include: { job: true } });

    const acceptedCount = allApps.filter(a => a.status?.toLowerCase() === "accepted").length;
    const rejectedCount = allApps.filter(a => a.status?.toLowerCase() === "rejected").length;

    const positionCounts = {};
    allApps.forEach((app) => {
      const title = app.job?.title || "Unknown Position";
      positionCounts[title] = (positionCounts[title] || 0) + 1;
    });

    const positionDetails = Object.entries(positionCounts).map(([title, count]) => ({
      position: title,
      count: count,
      percentage: totalApps > 0 ? Math.round((count / totalApps) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    return {
      totalApplications: totalApps,
      accepted: acceptedCount,
      rejected: rejectedCount,
      conversionRate: totalApps > 0 ? Number(((acceptedCount / totalApps) * 100).toFixed(1)) : 0,
      positionDetails: positionDetails,
    };
  }
}

module.exports = new ReportsService();