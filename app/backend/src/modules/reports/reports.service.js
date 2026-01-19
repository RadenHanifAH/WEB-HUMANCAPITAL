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

  isoDate(d) {
    if (!d) return "-";
    const x = new Date(d);
    return x.toISOString().split("T")[0];
  }

  // =========================
  // Weekly custom rule
  // =========================
  getCustomWeeklyBucket(d) {
    const x = new Date(d);
    const day = x.getDate();

    let bucketMonthDate = new Date(x.getFullYear(), x.getMonth(), 1);

    let week;
    if (day >= 1 && day <= 7) week = 1;
    else if (day <= 14) week = 2;
    else if (day <= 21) week = 3;
    else if (day <= 28) week = 4;
    else {
      bucketMonthDate = new Date(x.getFullYear(), x.getMonth() + 1, 1);
      week = 1;
    }

    const ym = this.keyYM(bucketMonthDate);
    const label = `${this.monthLabel(bucketMonthDate)} - Minggu ${week}`;
    const key = `${ym}|W${week}`;
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
        startDate = this.startOfDay(this.addDays(now, -6));
        break;
      case "weekly":
        startDate = this.startOfDay(this.addDays(now, -7 * 8));
        break;
      case "monthly":
        startDate = this.startOfDay(new Date(now.getFullYear(), now.getMonth() - 11, 1));
        break;
      case "yearly":
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
  async getApplicationsInRange(startDate, endDate) {
    return prisma.application.findMany({
      where: { appliedAt: { gte: startDate, lte: endDate } },
      include: { job: true, user: true },
      orderBy: { appliedAt: "asc" },
    });
  }

  async getApplicationsByPeriod(period) {
    const p = this.normalizePeriod(period);
    const { startDate, endDate } = this.getDateRange(p);
    return this.getApplicationsInRange(startDate, endDate);
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
  // Aggregator trend
  // =========================
  aggregateTrend(applications, period) {
    const p = this.normalizePeriod(period);
    const trendMap = new Map();

    for (const app of applications) {
      const d = new Date(app.appliedAt);
      if (Number.isNaN(d.getTime())) continue;

      let key, label, sortKey;

      if (p === "daily") {
        key = this.keyYMD(d);
        label = this.labelDMY(d);
        sortKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      } else if (p === "weekly") {
        const wk = this.getCustomWeeklyBucket(d);
        key = wk.key;
        label = wk.label;
        sortKey = wk.sortKey;
      } else if (p === "monthly") {
        key = this.keyYM(d);
        label = this.monthLabel(d);
        sortKey = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      } else if (p === "yearly") {
        key = String(d.getFullYear());
        label = key;
        sortKey = new Date(d.getFullYear(), 0, 1).getTime();
      }

      if (!key) continue;

      if (!trendMap.has(key)) trendMap.set(key, { label, count: 0, sortKey });
      trendMap.get(key).count += 1;
    }

    const sorted = Array.from(trendMap.values()).sort((a, b) => a.sortKey - b.sortKey);
    return {
      labels: sorted.map((x) => x.label),
      applications: sorted.map((x) => x.count),
    };
  }

  // =========================
  // Export breakdown rule
  // =========================
  getExportBreakdownPeriods(basePeriod) {
    const p = this.normalizePeriod(basePeriod);
    if (p === "weekly") return ["weekly", "daily"];
    if (p === "monthly") return ["monthly", "weekly", "daily"];
    if (p === "yearly") return ["yearly", "monthly", "weekly", "daily"];
    return ["daily"];
  }

  async buildTrendExportData(basePeriod) {
    const p = this.normalizePeriod(basePeriod);
    const { startDate, endDate } = this.getDateRange(p);

    const apps = await this.getApplicationsInRange(startDate, endDate);
    const periods = this.getExportBreakdownPeriods(p);

    const trends = {};
    for (const per of periods) {
      trends[per] = this.aggregateTrend(apps, per);
    }

    return {
      basePeriod: p,
      dateRange: { startDate, endDate },
      trends,
    };
  }

  // =========================
  // MAIN: Trend + Status chart
  // =========================
  async getReportsByPeriod(period = "monthly") {
    const p = this.normalizePeriod(period);
    const applications = await this.getApplicationsByPeriod(p);

    const chartTrend = this.aggregateTrend(applications, p);

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
      chartTrend,
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
  // Export builders
  // =========================
  async buildDashboardExportData({ trendPeriod, positionPeriod, statusPeriod }) {
    const tp = this.normalizePeriod(trendPeriod);
    const pp = this.normalizePeriod(positionPeriod);
    const sp = this.normalizePeriod(statusPeriod);

    const trendExport = await this.buildTrendExportData(tp);

    const statusCharts = await this.getReportsByPeriod(sp);
    const metrics = await this.getOverallMetrics(pp);

    return {
      period: "dashboard",
      dashboardMeta: { trendPeriod: tp, positionPeriod: pp, statusPeriod: sp },
      trendExport,
      chartAcceptance: statusCharts.chartAcceptance,
      positionDetails: metrics.positionDetails,
    };
  }

  async buildSingleData({ type, period }) {
    const p = this.normalizePeriod(period);

    if (type === "trend_analytics") {
      const trendExport = await this.buildTrendExportData(p);
      return { period: p, trendExport };
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

  // =========================
  // XLSX generator
  // NOTE: Posisi & Status sheet NAMA FIX jadi "Posisi" dan "Status"
  // =========================
  async generateXLSXBuffer(report, type = "dashboard") {
    const wb = new ExcelJS.Workbook();
    wb.creator = "HumanCapital";
    wb.created = new Date();

    const PERIOD_NAME = {
      daily: "Harian",
      weekly: "Mingguan",
      monthly: "Bulanan",
      yearly: "Tahunan",
    };

    const styleTitle = (ws, titleText) => {
      ws.getCell("A1").value = titleText;
      ws.getCell("A1").font = { bold: true, size: 14 };
      ws.getRow(1).height = 20;
    };

    const styleHeader = (row) => {
      row.font = { bold: true };
      row.alignment = { vertical: "middle" };
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
      });
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

    const addTrendSheetFromSeries = ({ periodKey, series, dateRange }) => {
      const label = PERIOD_NAME[periodKey] || periodKey;
      const ws = wb.addWorksheet(safeName(`Trend_${label}`));

      styleTitle(ws, `Trend - ${label}`);
      ws.addRow(["Rentang", `${this.isoDate(dateRange?.startDate)} s/d ${this.isoDate(dateRange?.endDate)}`]);
      ws.addRow([]);

      ws.addRow(["Label", "Jumlah"]);
      styleHeader(ws.getRow(4));
      ws.autoFilter = { from: "A4", to: "B4" };
      ws.views = [{ state: "frozen", ySplit: 4 }];

      const labels = Array.isArray(series?.labels) ? series.labels : [];
      const vals = Array.isArray(series?.applications) ? series.applications : [];

      if (!labels.length) ws.addRow(["Data kosong", 0]);
      else labels.forEach((l, i) => ws.addRow([l, vals[i] ?? 0]));

      autoFit(ws);
    };

    // ✅ FIX: Sheet name jadi "Posisi" (tanpa suffix)
    // - jika sudah ada "Posisi", pakai "Posisi (2)" agar tidak error
    const addPositionsSheet = () => {
      const baseName = "Posisi";
      let name = baseName;
      let idx = 2;
      while (wb.getWorksheet(name)) {
        name = `${baseName} (${idx++})`;
      }

      const ws = wb.addWorksheet(safeName(name));

      styleTitle(ws, "Analitik Posisi");
      ws.addRow([]);
      ws.addRow(["Posisi", "Jumlah", "Persentase"]);
      styleHeader(ws.getRow(3));
      ws.autoFilter = { from: "A3", to: "C3" };
      ws.views = [{ state: "frozen", ySplit: 3 }];

      const pos = Array.isArray(report.positionDetails) ? report.positionDetails : [];
      if (!pos.length) {
        ws.addRow(["Data kosong", 0, 0]);
      } else {
        pos.forEach((p) => {
          const r = ws.addRow([p.position || "-", p.count ?? 0, (p.percentage ?? 0) / 100]);
          r.getCell(3).numFmt = "0%";
        });
      }

      autoFit(ws);
    };

    // ✅ FIX: Sheet name jadi "Status" (tanpa suffix)
    // - jika sudah ada "Status", pakai "Status (2)" agar tidak error
    const addStatusSheet = () => {
      const baseName = "Status";
      let name = baseName;
      let idx = 2;
      while (wb.getWorksheet(name)) {
        name = `${baseName} (${idx++})`;
      }

      const ws = wb.addWorksheet(safeName(name));

      styleTitle(ws, "Status Lamaran");
      ws.addRow([]);
      ws.addRow(["Status", "Jumlah"]);
      styleHeader(ws.getRow(3));
      ws.autoFilter = { from: "A3", to: "B3" };
      ws.views = [{ state: "frozen", ySplit: 3 }];

      const acc = report.chartAcceptance || {};
      const labels = Array.isArray(acc.labels) ? acc.labels : [];
      const values = Array.isArray(acc.values) ? acc.values : [];

      if (!labels.length) ws.addRow(["Data kosong", 0]);
      else labels.forEach((l, i) => ws.addRow([l, values[i] ?? 0]));

      autoFit(ws);
    };

    // ====== routing export ======
    if (type === "dashboard") {
      const trendExport = report.trendExport;

      if (trendExport?.trends) {
        const order = this.getExportBreakdownPeriods(trendExport.basePeriod);
        order.forEach((per) =>
          addTrendSheetFromSeries({
            periodKey: per,
            series: trendExport.trends[per],
            dateRange: trendExport.dateRange,
          })
        );
      } else {
        // fallback
        const meta = report.dashboardMeta || {};
        addTrendSheetFromSeries({
          periodKey: meta.trendPeriod || "monthly",
          series: report.chartTrend,
          dateRange: null,
        });
      }

      // ✅ Posisi & Status sekarang sheet-nya tetap "Posisi" & "Status"
      addPositionsSheet();
      addStatusSheet();
    } else if (type === "trend_analytics") {
      const trendExport = report.trendExport;
      if (trendExport?.trends) {
        const order = this.getExportBreakdownPeriods(trendExport.basePeriod);
        order.forEach((per) =>
          addTrendSheetFromSeries({
            periodKey: per,
            series: trendExport.trends[per],
            dateRange: trendExport.dateRange,
          })
        );
      } else {
        addTrendSheetFromSeries({
          periodKey: report.period || "monthly",
          series: report.chartTrend,
          dateRange: null,
        });
      }
    } else if (type === "position_analytics") {
      addPositionsSheet();
    } else if (type === "status_analytics") {
      addStatusSheet();
    } else {
      addTrendSheetFromSeries({
        periodKey: report.period || "monthly",
        series: report.chartTrend,
        dateRange: null,
      });
      addPositionsSheet();
      addStatusSheet();
    }

    return wb.xlsx.writeBuffer();
  }

  async getSavedReports(period = null) {
    const where = period ? { period } : {};
    return reportsRepository.findMany(where);
  }
}

module.exports = new ReportsService();
