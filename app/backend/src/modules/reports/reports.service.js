const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const reportsRepository = require("./reports.repository");
const ExcelJS = require("exceljs");

class ReportsService {
  // =========================
  // Helpers tanggal
  // =========================
  startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  endOfDay(d) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  }

  addDays(date, days) {
    const x = new Date(date);
    x.setDate(x.getDate() + days);
    return x;
  }

  addMonths(date, months) {
    const x = new Date(date);
    x.setMonth(x.getMonth() + months);
    return x;
  }

  pad2(n) {
    return String(n).padStart(2, "0");
  }

  // key: YYYY-MM-DD
  keyYMD(d) {
    const x = new Date(d);
    return `${x.getFullYear()}-${this.pad2(x.getMonth() + 1)}-${this.pad2(x.getDate())}`;
  }

  // label: DD/MM/YYYY
  labelDMY(d) {
    const x = new Date(d);
    return `${this.pad2(x.getDate())}/${this.pad2(x.getMonth() + 1)}/${x.getFullYear()}`;
  }

  // key: YYYY-MM
  keyYM(d) {
    const x = new Date(d);
    return `${x.getFullYear()}-${this.pad2(x.getMonth() + 1)}`;
  }

  monthLabel(d) {
    const x = new Date(d);
    const names = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${names[x.getMonth()]} ${x.getFullYear()}`;
  }

  // =========================
  // Weekly custom rule:
  // Minggu 1: 1-7
  // Minggu 2: 8-14
  // Minggu 3: 15-21
  // Minggu 4: 22-28
  // Tanggal 29-31 => dianggap Minggu 1 bulan berikutnya
  // =========================
  getCustomWeeklyBucket(d) {
    const x = new Date(d);
    const day = x.getDate(); // 1..31

    // default: bulan yang sama
    let bucketMonthDate = new Date(x.getFullYear(), x.getMonth(), 1);

    let week;
    if (day >= 1 && day <= 7) week = 1;
    else if (day <= 14) week = 2;
    else if (day <= 21) week = 3;
    else if (day <= 28) week = 4;
    else {
      // 29-31 => pindah bulan, minggu 1
      bucketMonthDate = new Date(x.getFullYear(), x.getMonth() + 1, 1);
      week = 1;
    }

    const ym = this.keyYM(bucketMonthDate); // YYYY-MM
    const label = `${this.monthLabel(bucketMonthDate)} - Minggu ${week}`;
    const key = `${ym}|W${week}`;

    // sortKey: gunakan start bulan bucket + offset minggu (agar urut)
    const sortKey = bucketMonthDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000;

    return { key, label, sortKey };
  }

  // =========================
  // Period & Date Range
  // =========================
  normalizePeriod(period = "monthly") {
    const allowed = ["daily", "weekly", "monthly", "yearly"];
    return allowed.includes(period) ? period : "monthly";
  }

  getDateRange(period) {
    const now = new Date();
    const endDate = this.endOfDay(now);

    let startDate;

    switch (period) {
      case "daily":
        // 7 hari terakhir
        startDate = this.startOfDay(this.addDays(now, -6));
        break;

      case "weekly":
        // 8 minggu terakhir kira-kira (biar cukup data)
        // tapi bucket weekly tetap per-bulan (custom rule) saat agregasi
        startDate = this.startOfDay(this.addDays(now, -7 * 8));
        break;

      case "monthly":
        // 12 bulan terakhir
        startDate = this.startOfDay(new Date(now.getFullYear(), now.getMonth() - 11, 1));
        break;

      case "yearly":
        // 5 tahun terakhir
        startDate = this.startOfDay(new Date(now.getFullYear() - 4, 0, 1));
        break;

      default:
        startDate = this.startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        break;
    }

    return { startDate, endDate };
  }

  // =========================
  // Fetch applications
  // =========================
  async getApplicationsByPeriod(period) {
    const p = this.normalizePeriod(period);
    const { startDate, endDate } = this.getDateRange(p);

    return prisma.application.findMany({
      where: { appliedAt: { gte: startDate, lte: endDate } },
      include: { job: true, user: true },
      orderBy: { appliedAt: "asc" },
    });
  }

  // =========================
  // Final status bucket
  // =========================
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

  // =========================
  // MAIN: Trend + Status chart
  // (HANYA tampil yang ada datanya)
  // =========================
  async getReportsByPeriod(period = "monthly") {
    const p = this.normalizePeriod(period);
    const applications = await this.getApplicationsByPeriod(p);

    /**
     * trendMap:
     * key -> { label, count, sortKey }
     */
    const trendMap = new Map();

    for (const app of applications) {
      const d = new Date(app.appliedAt);
      if (Number.isNaN(d.getTime())) continue;

      let key, label, sortKey;

      if (p === "daily") {
        key = this.keyYMD(d);
        label = this.labelDMY(d);
        // sortKey by timestamp day start
        sortKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      }

      if (p === "weekly") {
        const wk = this.getCustomWeeklyBucket(d);
        key = wk.key;
        label = wk.label;
        sortKey = wk.sortKey;
      }

      if (p === "monthly") {
        key = this.keyYM(d);
        label = this.monthLabel(d);
        sortKey = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      }

      if (p === "yearly") {
        key = String(d.getFullYear());
        label = key;
        sortKey = new Date(d.getFullYear(), 0, 1).getTime();
      }

      if (!key) continue;

      if (!trendMap.has(key)) {
        trendMap.set(key, { label, count: 0, sortKey });
      }
      trendMap.get(key).count += 1;
    }

    // urutkan
    const sorted = Array.from(trendMap.values()).sort((a, b) => a.sortKey - b.sortKey);
    const trendLabels = sorted.map((x) => x.label);
    const trendValues = sorted.map((x) => x.count);

    // acceptance status (tetap)
    let accepted = 0;
    let rejected = 0;
    let inProgress = 0;

    for (const a of applications) {
      const b = this.getFinalBucket(a);
      if (b === "accepted") accepted++;
      else if (b === "rejected") rejected++;
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

  // =========================
  // Metrics
  // =========================
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

  // =========================
  // Export builders (punya kamu)
  // =========================
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
