const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const reportsRepository = require("./reports.repository");

class ReportsService {
  /**
   * Get reports by period (Real-time data from Application)
   */
  async getReportsByPeriod(period) {
    const applications = await prisma.application.findMany({
      include: { job: true },
    });

    // Logika pengelompokan trend
    const trendMap = {};
    applications.forEach((app) => {
      const date = new Date(app.appliedAt);
      let label = date.toLocaleDateString("id-ID");

      if (period === "weekly") {
        const weekNum = Math.ceil(date.getDate() / 7);
        label = `Minggu ${weekNum}`;
      } else if (period === "monthly") {
        label = date.toLocaleString("id-ID", {
          month: "long",
          year: "numeric",
        });
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
          applications.filter((a) => a.stage?.toLowerCase() === "accepted")
            .length,
          applications.filter((a) => a.stage?.toLowerCase() === "rejected")
            .length,
          applications.filter(
            (a) =>
              a.stage?.toLowerCase() === "under-review" ||
              a.stage?.toLowerCase() === "under review"
          ).length,
        ],
      },
    };
  }

  /**
   * Get overall metrics (Real-time data from Application)
   */
  async getOverallMetrics() {
    const totalApps = await prisma.application.count();
    const allApps = await prisma.application.findMany({
      include: { job: true },
    });

    const acceptedCount = allApps.filter(
      (a) => a.stage?.toLowerCase() === "accepted"
    ).length;
    const rejectedCount = allApps.filter(
      (a) => a.stage?.toLowerCase() === "rejected"
    ).length;

    const positionCounts = {};
    allApps.forEach((app) => {
      const title = app.job?.title || "Unknown Position";
      positionCounts[title] = (positionCounts[title] || 0) + 1;
    });

    const positionDetails = Object.entries(positionCounts)
      .map(([title, count]) => ({
        position: title,
        count: count,
        percentage: totalApps > 0 ? Math.round((count / totalApps) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalApplications: totalApps,
      accepted: acceptedCount,
      rejected: rejectedCount,
      conversionRate:
        totalApps > 0
          ? Number(((acceptedCount / totalApps) * 100).toFixed(1))
          : 0,
      positionDetails: positionDetails,
    };
  }

  /**
   * Save report snapshot to database
   */
  async saveReportSnapshot(period = "monthly") {
    try {
      console.log(`📊 Saving ${period} report snapshot...`);

      // 1. Ambil data real-time
      const metrics = await this.getOverallMetrics();
      const charts = await this.getReportsByPeriod(period);

      // 2. Tentukan date range
      const { startDate, endDate } = this.getDateRange(period);

      // 3. Cek apakah sudah ada report untuk periode ini (hari yang sama)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingReport = await reportsRepository.findFirst({
        period,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      });

      // 4. Prepare data
      const reportData = {
        period,
        startDate,
        endDate,
        totalApplications: metrics.totalApplications,
        accepted: metrics.accepted,
        rejected: metrics.rejected,
        conversionRate: metrics.conversionRate,
        // chartTrend: charts.chartTrend,
        // chartAcceptance: charts.chartAcceptance,
        // positionDetails: metrics.positionDetails,
      };

      // 5. Save or Update
      let savedReport;
      if (existingReport) {
        // Update existing report (jika user export lagi di hari yang sama)
        savedReport = await reportsRepository.update(
          existingReport.id,
          reportData
        );
        console.log(`✅ Report updated: ID ${savedReport.id}`);
      } else {
        // Create new report
        savedReport = await reportsRepository.create(reportData);
        console.log(`✅ Report created: ID ${savedReport.id}`);
      }

      return savedReport;
    } catch (error) {
      console.error("❌ Error saving report:", error);
      throw error;
    }
  }

  /**
   * Helper: Get date range based on period
   */
  getDateRange(period) {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "daily":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;

      case "weekly":
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;

      case "monthly":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Get saved reports from database
   */
  async getSavedReports(period = null) {
    const where = period ? { period } : {};
    return reportsRepository.findMany(where);
  }

  /**
   * Get report by ID
   */
  async getReportById(id) {
    return reportsRepository.findById(id);
  }

  /**
   * Delete report
   */
  async deleteReport(id) {
    return reportsRepository.delete(id);
  }

  /**
   * Generate CSV data from report
   */
  generateCSVData(report, type = "comprehensive") {
    let csvData = "";

    if (type === "position_analytics") {
      csvData = "Posisi,Jumlah Lamaran,Persentase\n";
      if (report.positionDetails) {
        report.positionDetails.forEach((p) => {
          csvData += `${p.position},${p.count},${p.percentage}%\n`;
        });
      }
    } else if (type === "trend_analytics") {
      csvData = "Tanggal/Periode,Jumlah Lamaran\n";
      if (report.chartTrend) {
        report.chartTrend.labels.forEach((l, i) => {
          csvData += `${l},${report.chartTrend.applications[i]}\n`;
        });
      }
    } else {
      // Comprehensive
      csvData = "Ringkasan Laporan Rekrutmen\n";
      csvData += `Periode,${report.period}\n`;
      csvData += `Tanggal Mulai,${new Date(report.startDate).toLocaleDateString(
        "id-ID"
      )}\n`;
      csvData += `Tanggal Akhir,${new Date(report.endDate).toLocaleDateString(
        "id-ID"
      )}\n`;
      csvData += `Total Lamaran,${report.totalApplications}\n`;
      csvData += `Diterima,${report.accepted}\n`;
      csvData += `Ditolak,${report.rejected}\n`;
      csvData += `Conversion Rate,${report.conversionRate}%\n`;
      csvData += `\nDetail Posisi:\n`;
      csvData += `Posisi,Jumlah,Persentase\n`;
      if (report.positionDetails) {
        report.positionDetails.forEach((p) => {
          csvData += `${p.position},${p.count},${p.percentage}%\n`;
        });
      }
    }

    return csvData;
  }
}

module.exports = new ReportsService();
