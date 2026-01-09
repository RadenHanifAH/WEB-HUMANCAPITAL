const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const reportsRepository = require("./reports.repository");

class ReportsService {
  normalizePeriod(period = "monthly") {
    const allowed = ["daily", "weekly", "monthly", "yearly"];
    return allowed.includes(period) ? period : "monthly";
  }

  // rolling window supaya harian tidak kosong
  getDateRange(period) {
    const now = new Date();

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    let startDate;

    switch (period) {
      case "daily":
        // 7 hari terakhir
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;

      case "weekly":
        // 8 minggu terakhir
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7 * 8);
        startDate.setHours(0, 0, 0, 0);
        break;

      case "monthly":
        // 12 bulan terakhir
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case "yearly":
        // 5 tahun terakhir
        startDate = new Date(now.getFullYear() - 4, 0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    return { startDate, endDate };
  }

  async getApplicationsByPeriod(period) {
    const p = this.normalizePeriod(period);
    const { startDate, endDate } = this.getDateRange(p);

    return prisma.application.findMany({
      where: {
        appliedAt: { gte: startDate, lte: endDate },
      },
      include: { job: true, user: true },
    });
  }

  // status final: cek stage ATAU status
  getFinalBucket(app) {
    const stage = String(app.stage || "").toLowerCase().trim();
    const status = String(app.status || "").toLowerCase().trim();

    const accepted =
      stage === "accepted" ||
      status === "accepted" ||
      stage.includes("accepted") ||
      status.includes("accepted") ||
      stage === "hired" ||
      status === "hired";

    const rejected =
      stage === "rejected" ||
      status === "rejected" ||
      stage.includes("rejected") ||
      status.includes("rejected");

    if (accepted) return "accepted";
    if (rejected) return "rejected";
    return "in_progress";
  }

  /**
   * ✅ Chart Trend + Status
   * Harian: Senin..Minggu (7 hari terakhir) dan semua label selalu muncul (0 tetap tampil)
   * Mingguan: Minggu 1..8 (8 minggu)
   * Bulanan: 12 bulan terakhir
   * Tahunan: 5 tahun terakhir
   */
async getReportsByPeriod(period = "monthly") {
  const p = this.normalizePeriod(period);
  const applications = await this.getApplicationsByPeriod(p);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  // helper key format
  const keyYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`; // grouping aman
  };

  const labelDMY = (d) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`; // contoh 06/01/2026
  };

  const keyYM = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
  const labelMY = (d) => `${monthNames[d.getMonth()]} ${d.getFullYear()}`; // Jan 2026

  const keyY = (d) => String(d.getFullYear()); // YYYY

  // =========================
  // TREND MAP DINAMIS
  // =========================
  const trendMap = new Map(); // key -> { label, count, sortKey }

  for (const app of applications) {
    const d = new Date(app.appliedAt);

    // skip invalid date
    if (Number.isNaN(d.getTime())) continue;

    if (p === "daily") {
      const key = keyYMD(d);
      const label = labelDMY(d);
      if (!trendMap.has(key)) {
        trendMap.set(key, { label, count: 0, sortKey: d.getTime() });
      }
      trendMap.get(key).count += 1;
    }

    if (p === "weekly") {
      // Mingguan dinamis: tetap pakai bucket minggu relatif dari startDate,
      // tapi hanya yang ada datanya yang akan muncul.
      const { startDate } = this.getDateRange("weekly");
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffDays / 7); // 0..7
      if (weekIndex >= 0 && weekIndex < 8) {
        const key = `week-${weekIndex + 1}`;
        const label = `Minggu ${weekIndex + 1}`;
        if (!trendMap.has(key)) {
          // sortKey pakai awal minggu
          const wkStart = new Date(start);
          wkStart.setDate(start.getDate() + weekIndex * 7);
          trendMap.set(key, { label, count: 0, sortKey: wkStart.getTime() });
        }
        trendMap.get(key).count += 1;
      }
    }

    if (p === "monthly") {
      const key = keyYM(d);
      const label = labelMY(d);
      if (!trendMap.has(key)) {
        // sortKey pakai awal bulan
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        trendMap.set(key, { label, count: 0, sortKey: monthStart.getTime() });
      }
      trendMap.get(key).count += 1;
    }

    if (p === "yearly") {
      const key = keyY(d);
      const label = key;
      if (!trendMap.has(key)) {
        // sortKey pakai awal tahun
        const yearStart = new Date(d.getFullYear(), 0, 1);
        trendMap.set(key, { label, count: 0, sortKey: yearStart.getTime() });
      }
      trendMap.get(key).count += 1;
    }
  }

  // urutkan label berdasarkan waktu
  const sorted = Array.from(trendMap.values()).sort((a, b) => a.sortKey - b.sortKey);

  const trendLabels = sorted.map((x) => x.label);
  const trendValues = sorted.map((x) => x.count);

  // =========================
  // STATUS KANDIDAT (sesuai period yg sama)
  // =========================
  let accepted = 0;
  let rejected = 0;
  let inProgress = 0;

  for (const a of applications) {
    const bucket = this.getFinalBucket(a);
    if (bucket === "accepted") accepted++;
    else if (bucket === "rejected") rejected++;
    else inProgress++;
  }

  return {
    period: p,
    chartTrend: {
      labels: trendLabels,
      applications: trendValues,
    },
    chartAcceptance: {
      labels: ["Diterima", "Ditolak", "Dalam Proses"],
      values: [accepted, rejected, inProgress],
    },
  };
}


  async getOverallMetrics(period = "monthly") {
    const p = this.normalizePeriod(period);
    const apps = await this.getApplicationsByPeriod(p);

    const totalApps = apps.length;

    let acceptedCount = 0;
    let rejectedCount = 0;

    for (const a of apps) {
      const bucket = this.getFinalBucket(a);
      if (bucket === "accepted") acceptedCount++;
      if (bucket === "rejected") rejectedCount++;
    }

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
      conversionRate: totalApps > 0 ? Number(((acceptedCount / totalApps) * 100).toFixed(1)) : 0,
      positionDetails,
    };
  }

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

    return reportsRepository.create(reportData);
  }

  async saveDashboardSnapshot({ trendPeriod = "monthly", positionPeriod = "monthly", statusPeriod = "monthly" }) {
    const tp = this.normalizePeriod(trendPeriod);
    const pp = this.normalizePeriod(positionPeriod);
    const sp = this.normalizePeriod(statusPeriod);

    const trendCharts = await this.getReportsByPeriod(tp);
    const statusCharts = await this.getReportsByPeriod(sp);
    const metrics = await this.getOverallMetrics(pp);

    const trendRange = this.getDateRange(tp);
    const statusRange = this.getDateRange(sp);
    const positionRange = this.getDateRange(pp);

    const startDate = new Date(
      Math.min(trendRange.startDate.getTime(), statusRange.startDate.getTime(), positionRange.startDate.getTime())
    );
    const endDate = new Date(
      Math.max(trendRange.endDate.getTime(), statusRange.endDate.getTime(), positionRange.endDate.getTime())
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

    return reportsRepository.create(reportData);
  }

  escapeCSV(v) {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  generateCSVData(report, type = "dashboard") {
    const e = (v) => this.escapeCSV(v);

    if (type === "dashboard") {
      const meta = report.dashboardMeta || {};
      const trendP = meta.trendPeriod || "monthly";
      const statusP = meta.statusPeriod || "monthly";
      const positionP = meta.positionPeriod || "monthly";

      let csv = "";
      csv += "LAPORAN REKRUTMEN (EXPORT SEMUA SESUAI DROPDOWN)\n\n";

      csv += `TREND LAMARAN (Periode: ${trendP})\n`;
      csv += "Label,Jumlah\n";
      const trend = report.chartTrend || { labels: [], applications: [] };
      (trend.labels || []).forEach((label, i) => {
        csv += `${e(label)},${trend.applications?.[i] ?? 0}\n`;
      });
      csv += "\n";

      csv += `STATUS KANDIDAT (Periode: ${statusP})\n`;
      csv += "Status,Jumlah\n";
      const acc = report.chartAcceptance || { labels: [], values: [] };
      (acc.labels || []).forEach((label, i) => {
        csv += `${e(label)},${acc.values?.[i] ?? 0}\n`;
      });
      csv += "\n";

      csv += `LOWONGAN (Periode: ${positionP})\n`;
      csv += "Posisi,Jumlah,Persentase\n";
      const pos = report.positionDetails || [];
      pos.forEach((p) => {
        csv += `${e(p.position)},${p.count},${p.percentage}%\n`;
      });

      return csv;
    }

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

    let csv = "Ringkasan Laporan Rekrutmen\n";
    csv += `Periode,${e(report.period)}\n`;
    return csv;
  }

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
