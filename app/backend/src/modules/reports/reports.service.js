const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const reportsRepository = require("./reports.repository");
const ExcelJS = require("exceljs");

class ReportsService {
  normalizePeriod(period = "monthly") {
    const allowed = ["daily", "weekly", "monthly", "yearly"];
    return allowed.includes(period) ? period : "monthly";
  }

  getDateRange(period) {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    let startDate;
    switch (period) {
      case "daily":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7 * 8);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "yearly":
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
      where: { appliedAt: { gte: startDate, lte: endDate } },
      include: { job: true, user: true },
      orderBy: { appliedAt: "asc" },
    });
  }

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

  async getReportsByPeriod(period = "monthly") {
    const p = this.normalizePeriod(period);
    const applications = await this.getApplicationsByPeriod(p);

    const monthNames = [
      "Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"
    ];

    const keyYMD = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

    const labelDMY = (d) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}/${d.getFullYear()}`;

    const keyYM = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const labelMY = (d) => `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    const keyY = (d) => String(d.getFullYear());

    const trendMap = new Map();

    for (const app of applications) {
      const d = new Date(app.appliedAt);
      if (Number.isNaN(d.getTime())) continue;

      if (p === "daily") {
        const key = keyYMD(d);
        const label = labelDMY(d);
        if (!trendMap.has(key))
          trendMap.set(key, { label, count: 0, sortKey: d.getTime() });
        trendMap.get(key).count += 1;
      }

      if (p === "weekly") {
        const { startDate } = this.getDateRange("weekly");
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7);

        if (weekIndex >= 0 && weekIndex < 8) {
          const key = `week-${weekIndex + 1}`;
          const label = `Minggu ${weekIndex + 1}`;
          if (!trendMap.has(key)) {
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
          const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
          trendMap.set(key, { label, count: 0, sortKey: monthStart.getTime() });
        }
        trendMap.get(key).count += 1;
      }

      if (p === "yearly") {
        const key = keyY(d);
        const label = key;
        if (!trendMap.has(key)) {
          const yearStart = new Date(d.getFullYear(), 0, 1);
          trendMap.set(key, { label, count: 0, sortKey: yearStart.getTime() });
        }
        trendMap.get(key).count += 1;
      }
    }

    const sorted = Array.from(trendMap.values()).sort((a, b) => a.sortKey - b.sortKey);
    const trendLabels = sorted.map((x) => x.label);
    const trendValues = sorted.map((x) => x.count);

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
      chartTrend: { labels: trendLabels, applications: trendValues },
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

    let acceptedCount = 0;
    let rejectedCount = 0;

    for (const a of apps) {
      const bucket = this.getFinalBucket(a);
      if (bucket === "accepted") acceptedCount++;
      if (bucket === "rejected") rejectedCount++;
    }

    return {
      period: p,
      totalApplications: totalApps,
      accepted: acceptedCount,
      rejected: rejectedCount,
      conversionRate: totalApps > 0 ? Number(((acceptedCount / totalApps) * 100).toFixed(1)) : 0,
      positionDetails,
    };
  }

  // DASHBOARD EXPORT: trend ikut dropdown, posisi+status bisa tetap
  async buildDashboardExportData({ trendPeriod, positionPeriod, statusPeriod }) {
    const tp = this.normalizePeriod(trendPeriod);
    const pp = this.normalizePeriod(positionPeriod);
    const sp = this.normalizePeriod(statusPeriod);

    const trendCharts = await this.getReportsByPeriod(tp);
    const statusCharts = await this.getReportsByPeriod(sp);
    const metrics = await this.getOverallMetrics(pp);

    return {
      period: "dashboard",
      dashboardMeta: { trendPeriod: tp, positionPeriod: pp, statusPeriod: sp },
      chartTrend: trendCharts.chartTrend,
      chartAcceptance: statusCharts.chartAcceptance,
      positionDetails: metrics.positionDetails,
    };
  }

  async buildSingleData({ type, period }) {
    const p = this.normalizePeriod(period);

    if (type === "trend_analytics") {
      const charts = await this.getReportsByPeriod(p);
      return { period: p, chartTrend: charts.chartTrend };
    }

    if (type === "position_analytics") {
      const metrics = await this.getOverallMetrics(p);
      return { period: p, positionDetails: metrics.positionDetails };
    }

    if (type === "status_analytics") {
      const charts = await this.getReportsByPeriod(p);
      return { period: p, chartAcceptance: charts.chartAcceptance };
    }

    const charts = await this.getReportsByPeriod(p);
    const metrics = await this.getOverallMetrics(p);
    return { period: p, ...charts, ...metrics };
  }

  async generateXLSXBuffer(report, type = "dashboard") {
    const wb = new ExcelJS.Workbook();
    wb.creator = "HumanCapital";
    wb.created = new Date();

    const styleHeader = (row) => {
      row.font = { bold: true };
      row.alignment = { vertical: "middle" };
    };

    const autoFit = (ws) => {
      ws.columns.forEach((col) => {
        let max = 10;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const v = cell.value;
          const len = v ? String(v).length : 0;
          if (len > max) max = len;
        });
        col.width = Math.min(Math.max(max + 2, 10), 45);
      });
    };

    const safeName = (name) => String(name).slice(0, 31);

    const addTrendSheet = (periodLabel) => {
      const ws = wb.addWorksheet(safeName(`Trend_${periodLabel}`));
      ws.addRow(["Label", "Jumlah"]);
      styleHeader(ws.getRow(1));

      const trend = report.chartTrend || {};
      const labels = Array.isArray(trend.labels) ? trend.labels : [];
      const vals = Array.isArray(trend.applications) ? trend.applications : [];

      if (!labels.length) ws.addRow(["Data kosong", 0]);
      else labels.forEach((label, i) => ws.addRow([label, vals[i] ?? 0]));

      autoFit(ws);
    };

    const addPositionsSheet = (periodLabel) => {
      const ws = wb.addWorksheet(safeName(`Posisi_${periodLabel}`));
      ws.addRow(["Posisi", "Jumlah", "Persentase"]);
      styleHeader(ws.getRow(1));

      const pos = Array.isArray(report.positionDetails) ? report.positionDetails : [];
      if (!pos.length) ws.addRow(["Data kosong", 0, "0%"]);
      else pos.forEach((p) => ws.addRow([p.position || "-", p.count ?? 0, `${p.percentage ?? 0}%`]));

      autoFit(ws);
    };

    const addStatusSheet = (periodLabel) => {
      const ws = wb.addWorksheet(safeName(`Status_${periodLabel}`));
      ws.addRow(["Status", "Jumlah"]);
      styleHeader(ws.getRow(1));

      const acc = report.chartAcceptance || {};
      const labels = Array.isArray(acc.labels) ? acc.labels : [];
      const values = Array.isArray(acc.values) ? acc.values : [];

      if (!labels.length) ws.addRow(["Data kosong", 0]);
      else labels.forEach((l, i) => ws.addRow([l, values[i] ?? 0]));

      autoFit(ws);
    };

    if (type === "dashboard") {
      const meta = report.dashboardMeta || {};
      addTrendSheet(meta.trendPeriod || "monthly");
      addPositionsSheet(meta.positionPeriod || "monthly");
      addStatusSheet(meta.statusPeriod || "monthly");
    } else if (type === "trend_analytics") {
      addTrendSheet(report.period || "monthly");
    } else if (type === "position_analytics") {
      addPositionsSheet(report.period || "monthly");
    } else if (type === "status_analytics") {
      addStatusSheet(report.period || "monthly");
    } else {
      addTrendSheet(report.period || "monthly");
      addPositionsSheet(report.period || "monthly");
      addStatusSheet(report.period || "monthly");
    }

    return wb.xlsx.writeBuffer();
  }

  async getSavedReports(period = null) {
    const where = period ? { period } : {};
    return reportsRepository.findMany(where);
  }
}

module.exports = new ReportsService();
