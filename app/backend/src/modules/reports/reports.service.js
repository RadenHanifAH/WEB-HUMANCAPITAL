const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const reportsRepository = require("./reports.repository");

class ReportsService {
  // =========================
  // Helpers
  // =========================
  normalizePeriod(period = "monthly") {
    const allowed = ["daily", "weekly", "monthly", "yearly"];
    return allowed.includes(period) ? period : "monthly";
  }

  getDateRange(period) {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "daily": {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case "weekly": {
        const d = new Date(now);
        const dayOfWeek = d.getDay(); // 0 = minggu
        startDate = new Date(d);
        startDate.setDate(d.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case "yearly": {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      }

      case "monthly":
      default: {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;
      }
    }

    return { startDate, endDate };
  }

  async getApplicationsByPeriod(period) {
    const p = this.normalizePeriod(period);
    const { startDate, endDate } = this.getDateRange(p);

    return prisma.application.findMany({
      where: {
        appliedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { job: true },
    });
  }

  // =========================
  // API DATA
  // =========================

  /**
   * Charts: Trend + Status kandidat
   * ✅ terfilter sesuai period
   */
  async getReportsByPeriod(period = "monthly") {
    const p = this.normalizePeriod(period);
    const applications = await this.getApplicationsByPeriod(p);

    // Trend grouping
    const trendMap = {};
    applications.forEach((app) => {
      const date = new Date(app.appliedAt);
      let label = date.toLocaleDateString("id-ID");

      if (p === "weekly") {
        const weekNum = Math.ceil(date.getDate() / 7);
        label = `Minggu ${weekNum}`;
      } else if (p === "monthly") {
        label = date.toLocaleString("id-ID", { month: "long", year: "numeric" });
      } else if (p === "yearly") {
        label = date.getFullYear().toString();
      }

      trendMap[label] = (trendMap[label] || 0) + 1;
    });

    // Status kandidat (3 status)
    const accepted = applications.filter(
      (a) => a.stage?.toLowerCase() === "accepted"
    ).length;

    const rejected = applications.filter(
      (a) => a.stage?.toLowerCase() === "rejected"
    ).length;

    const underReview = applications.filter((a) => {
      const s = a.stage?.toLowerCase();
      return s === "under-review" || s === "under review";
    }).length;

    return {
      period: p,
      chartTrend: {
        labels: Object.keys(trendMap),
        applications: Object.values(trendMap),
      },
      chartAcceptance: {
        labels: ["Diterima", "Ditolak", "Dalam Proses"],
        values: [accepted, rejected, underReview],
      },
    };
  }

  /**
   * Metrics Lowongan (posisi)
   * ✅ terfilter sesuai period
   */
  async getOverallMetrics(period = "monthly") {
    const p = this.normalizePeriod(period);
    const apps = await this.getApplicationsByPeriod(p);

    const totalApps = apps.length;

    const acceptedCount = apps.filter(
      (a) => a.stage?.toLowerCase() === "accepted"
    ).length;

    const rejectedCount = apps.filter(
      (a) => a.stage?.toLowerCase() === "rejected"
    ).length;

    // Position count
    const positionCounts = {};
    apps.forEach((app) => {
      const title = app.job?.title || "Unknown Position";
      positionCounts[title] = (positionCounts[title] || 0) + 1;
    });

    const positionDetails = Object.entries(positionCounts)
      .map(([title, count]) => ({
        position: title,
        count,
        percentage: totalApps > 0 ? Math.round((count / totalApps) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      period: p,
      totalApplications: totalApps,
      accepted: acceptedCount,
      rejected: rejectedCount,
      conversionRate:
        totalApps > 0 ? Number(((acceptedCount / totalApps) * 100).toFixed(1)) : 0,
      positionDetails,
    };
  }

  // =========================
  // SAVE SNAPSHOT
  // =========================

  /**
   * ✅ Save snapshot single period
   * IMPORTANT: selalu CREATE biar history tidak hilang
   */
  async saveReportSnapshot(period = "monthly") {
    const p = this.normalizePeriod(period);

    const metrics = await this.getOverallMetrics(p);
    const charts = await this.getReportsByPeriod(p);
    const { startDate, endDate } = this.getDateRange(p);

    const reportData = {
      period: p,
      startDate,
      endDate,
      totalApplications: metrics.totalApplications,
      accepted: metrics.accepted,
      rejected: metrics.rejected,
      conversionRate: metrics.conversionRate,
      positionDetails: metrics.positionDetails,
      chartTrend: charts.chartTrend,
      chartAcceptance: charts.chartAcceptance,
    };

    // ✅ selalu create (tidak ketimpa)
    return reportsRepository.create(reportData);
  }

  /**
   * ✅ Save snapshot DASHBOARD (3 dropdown berbeda)
   * trendPeriod / positionPeriod / statusPeriod bisa beda-beda
   * IMPORTANT: selalu CREATE biar history tidak hilang
   */
  async saveDashboardSnapshot({
    trendPeriod = "monthly",
    positionPeriod = "monthly",
    statusPeriod = "monthly",
  }) {
    const tp = this.normalizePeriod(trendPeriod);
    const pp = this.normalizePeriod(positionPeriod);
    const sp = this.normalizePeriod(statusPeriod);

    // ambil data sesuai period masing-masing
    const trendCharts = await this.getReportsByPeriod(tp);     // chartTrend
    const statusCharts = await this.getReportsByPeriod(sp);    // chartAcceptance
    const metrics = await this.getOverallMetrics(pp);          // positionDetails + summary

    const trendRange = this.getDateRange(tp);
    const statusRange = this.getDateRange(sp);
    const positionRange = this.getDateRange(pp);

    // startDate paling awal, endDate paling akhir
    const startDate = new Date(
      Math.min(
        trendRange.startDate.getTime(),
        statusRange.startDate.getTime(),
        positionRange.startDate.getTime()
      )
    );
    const endDate = new Date(
      Math.max(
        trendRange.endDate.getTime(),
        statusRange.endDate.getTime(),
        positionRange.endDate.getTime()
      )
    );

    const reportData = {
      period: "dashboard",
      startDate,
      endDate,

      totalApplications: metrics.totalApplications,
      accepted: metrics.accepted,
      rejected: metrics.rejected,
      conversionRate: metrics.conversionRate,

      positionDetails: metrics.positionDetails,
      chartTrend: trendCharts.chartTrend,
      chartAcceptance: statusCharts.chartAcceptance,

      dashboardMeta: {
        trendPeriod: tp,
        positionPeriod: pp,
        statusPeriod: sp,
        trendRange,
        positionRange,
        statusRange,
      },
    };

    // ✅ selalu create (tidak ketimpa)
    return reportsRepository.create(reportData);
  }

  // =========================
  // CSV
  // =========================
  escapeCSV(v) {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  /**
   * ✅ CSV sesuai format screenshot kamu
   */
  generateCSVData(report, type = "dashboard") {
    const e = (v) => this.escapeCSV(v);

    // 1) DASHBOARD (SEMUA)
    if (type === "dashboard") {
      const meta = report.dashboardMeta || {};
      const trendP = meta.trendPeriod || "monthly";
      const statusP = meta.statusPeriod || "monthly";
      const positionP = meta.positionPeriod || "monthly";

      let csv = "";
      csv += "LAPORAN REKRUTMEN (EXPORT SEMUA SESUAI DROPDOWN)\n\n";

      // TREND
      csv += `TREND LAMARAN (Periode: ${trendP})\n`;
      csv += "Label,Jumlah\n";
      const trend = report.chartTrend || { labels: [], applications: [] };
      (trend.labels || []).forEach((label, i) => {
        csv += `${e(label)},${trend.applications?.[i] ?? 0}\n`;
      });
      csv += "\n";

      // STATUS
      csv += `STATUS KANDIDAT (Periode: ${statusP})\n`;
      csv += "Status,Jumlah\n";
      const acc = report.chartAcceptance || { labels: [], values: [] };
      (acc.labels || []).forEach((label, i) => {
        csv += `${e(label)},${acc.values?.[i] ?? 0}\n`;
      });
      csv += "\n";

      // LOWONGAN
      csv += `LOWONGAN (Periode: ${positionP})\n`;
      csv += "Posisi,Jumlah,Persentase\n";
      const pos = report.positionDetails || [];
      pos.forEach((p) => {
        csv += `${e(p.position)},${p.count},${p.percentage}%\n`;
      });

      return csv;
    }

    // 2) single export
    if (type === "position_analytics") {
      let csv = "Posisi,Jumlah Lamaran,Persentase\n";
      const list = report.positionDetails || [];
      list.forEach((p) => {
        csv += `${e(p.position)},${p.count},${p.percentage}%\n`;
      });
      return csv;
    }

    if (type === "trend_analytics") {
      let csv = "Label,Jumlah\n";
      const trend = report.chartTrend || { labels: [], applications: [] };
      (trend.labels || []).forEach((l, i) => {
        csv += `${e(l)},${trend.applications?.[i] ?? 0}\n`;
      });
      return csv;
    }

    if (type === "status_analytics") {
      let csv = "Status Kandidat,Jumlah\n";
      const acc = report.chartAcceptance || { labels: [], values: [] };
      (acc.labels || []).forEach((label, i) => {
        csv += `${e(label)},${acc.values?.[i] ?? 0}\n`;
      });
      return csv;
    }

    // fallback
    let csv = "Ringkasan Laporan Rekrutmen\n";
    csv += `Periode,${e(report.period)}\n`;
    return csv;
  }

  // =========================
  // Saved reports management
  // =========================
  async getSavedReports(period = null) {
    const where = period ? { period } : {};
    return reportsRepository.findMany(where);
  }

  async getReportById(id) {
    return reportsRepository.findById(id);
  }

  async deleteReport(id) {
    return reportsRepository.delete(id);
  }
}

module.exports = new ReportsService();
