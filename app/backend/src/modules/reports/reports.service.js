const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const reportsRepository = require("./reports.repository");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const COLORS = {
  primary: "#14304D",
  accent: "#0EA5E9",
  success: "#16A34A",
  danger: "#DC2626",
  info: "#2563EB",
  muted: "#64748B",
  text: "#1E293B",
  border: "#E2E8F0",
  rowAlt: "#F8FAFC",
  cardBg: "#F1F5F9",
  totalBg: "#EEF2F7",
};

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

  keyYMD(d) {
    const x = new Date(d);
    return `${x.getFullYear()}-${this.pad2(x.getMonth() + 1)}-${this.pad2(x.getDate())}`;
  }

  labelDMY(d) {
    const x = new Date(d);
    return `${this.pad2(x.getDate())}/${this.pad2(x.getMonth() + 1)}/${x.getFullYear()}`;
  }

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

  resolveExportDateRange(period, customRange) {
    if (customRange?.startDate && customRange?.endDate) {
      return {
        startDate: this.startOfDay(new Date(customRange.startDate)),
        endDate: this.endOfDay(new Date(customRange.endDate)),
      };
    }
    return this.getDateRange(period);
  }

  // =========================
  // Fetch lamaran
  // =========================
  async getApplicationsInRange(startDate, endDate) {
    return prisma.lamaran.findMany({
      where: { tanggal_melamar: { gte: startDate, lte: endDate } },
      include: { lowongan: true, pengguna: true },
      orderBy: { tanggal_melamar: "asc" },
    });
  }

  async getApplicationsByPeriod(period) {
    const p = this.normalizePeriod(period);
    const { startDate, endDate } = this.getDateRange(p);
    return this.getApplicationsInRange(startDate, endDate);
  }

  // =========================
  // ✅ FIX: Mengambil Diterima / Ditolak dari tabel `arsip`.
  // Di modul arsip sebelumnya, kita sepakat menyimpan "Diterima" / "Ditolak".
  // =========================
  async getArchiveCounts(startDate, endDate) {
    const [accepted, rejected] = await Promise.all([
      prisma.arsip.count({
        where: {
          status_akhir: "Diterima",
          tanggal_keputusan: { gte: startDate, lte: endDate },
        },
      }),
      prisma.arsip.count({
        where: {
          status_akhir: "Ditolak",
          tanggal_keputusan: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    return { accepted, rejected };
  }

  // =========================
  // Final status bucket (hanya untuk in_progress)
  // =========================
  getFinalBucket(app) {
    const stage = String(app.tahap || "").toLowerCase().trim();
    const status = String(app.status || "").toLowerCase().trim();

    const accepted =
      stage === "accepted" ||
      status === "accepted" ||
      stage.includes("accepted") ||
      status.includes("accepted") ||
      stage === "hired" ||
      status === "hired" ||
      status.includes("hired") ||
      status === "diterima" ||
      status.includes("diterima") ||
      stage === "diterima" ||
      stage.includes("diterima") ||
      stage === "final result";

    const rejected =
      stage === "rejected" ||
      status === "rejected" ||
      stage.includes("rejected") ||
      status.includes("rejected") ||
      status === "ditolak" ||
      status.includes("ditolak") ||
      stage === "ditolak" ||
      stage.includes("ditolak");

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
      const d = new Date(app.tanggal_melamar);
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

  async buildTrendExportData(basePeriod, customRange = null) {
    const p = this.normalizePeriod(basePeriod);
    const { startDate, endDate } = this.resolveExportDateRange(p, customRange);

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
    const { startDate, endDate } = this.getDateRange(p);
    const applications = await this.getApplicationsInRange(startDate, endDate);

    const chartTrend = this.aggregateTrend(applications, p);

    const { accepted, rejected } = await this.getArchiveCounts(startDate, endDate);

    let inProgress = 0;
    for (const a of applications) {
      if (this.getFinalBucket(a) === "in_progress") inProgress++;
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
  // Trend + Status chart untuk CUSTOM DATE RANGE
  // =========================
  async getReportsByCustomRange(startDateInput, endDateInput, granularity = "monthly") {
    const g = this.normalizePeriod(granularity);

    const startDate = this.startOfDay(new Date(startDateInput));
    const endDate = this.endOfDay(new Date(endDateInput));

    const applications = await this.getApplicationsInRange(startDate, endDate);

    const chartTrend = this.aggregateTrend(applications, g);

    const { accepted, rejected } = await this.getArchiveCounts(startDate, endDate);

    let inProgress = 0;
    for (const a of applications) {
      if (this.getFinalBucket(a) === "in_progress") inProgress++;
    }

    return {
      period: g,
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
    const { startDate, endDate } = this.getDateRange(p);
    const apps = await this.getApplicationsInRange(startDate, endDate);

    const totalApps = apps.length;

    const positionCounts = {};
    apps.forEach((app) => {
      const title = app.lowongan?.judul || "Unknown Position";
      positionCounts[title] = (positionCounts[title] || 0) + 1;
    });

    const positionDetails = Object.entries(positionCounts)
      .map(([title, count]) => ({
        position: title,
        count,
        percentage: totalApps > 0 ? Math.round((count / totalApps) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const { accepted: acceptedCount, rejected: rejectedCount } =
      await this.getArchiveCounts(startDate, endDate);

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
  async buildDashboardExportData({ trendPeriod, positionPeriod, statusPeriod, dateRange = null }) {
    const tp = this.normalizePeriod(trendPeriod);
    const pp = this.normalizePeriod(positionPeriod);
    const sp = this.normalizePeriod(statusPeriod);

    const trendExport = await this.buildTrendExportData(tp, dateRange);

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

  async buildSingleData({ type, period, dateRange = null }) {
    const p = this.normalizePeriod(period);

    if (type === "trend_analytics") {
      const trendExport = await this.buildTrendExportData(p, dateRange);
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
        const meta = report.dashboardMeta || {};
        addTrendSheetFromSeries({
          periodKey: meta.trendPeriod || "monthly",
          series: report.chartTrend,
          dateRange: null,
        });
      }

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

  // =========================================================
  // PDF generator
  // =========================================================

  _periodName(periodKey) {
    const PERIOD_NAME = {
      daily: "Harian",
      weekly: "Mingguan",
      monthly: "Bulanan",
      yearly: "Tahunan",
    };
    return PERIOD_NAME[periodKey] || periodKey;
  }

  _ensureSpace(doc, neededHeight) {
    const bottomLimit = doc.page.height - doc.page.margins.bottom;
    if (doc.y + neededHeight > bottomLimit) {
      doc.addPage();
      return true;
    }
    return false;
  }

  _drawTopBar(doc) {
    doc.rect(0, 0, doc.page.width, 6).fill(COLORS.accent);
    doc.fillColor(COLORS.text);
  }

  _drawReportHeader(doc, title, subtitle) {
    const marginLeft = doc.page.margins.left;
    const marginRight = doc.page.margins.right;
    const usableWidth = doc.page.width - marginLeft - marginRight;

    doc.y = 34;
    doc.x = marginLeft;

    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(COLORS.muted)
      .text("SISTEM MANAJEMEN REKRUTMEN", marginLeft, doc.y, { characterSpacing: 1.1 });

    const printedAt = new Date().toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
    doc
      .fontSize(8.5)
      .font("Helvetica")
      .fillColor(COLORS.muted)
      .text(`Dicetak: ${printedAt}`, marginLeft, 34, { width: usableWidth, align: "right" });

    doc.moveDown(0.7);
    doc.fontSize(20).font("Helvetica-Bold").fillColor(COLORS.primary).text(title, marginLeft);

    doc.moveDown(0.15);
    doc.fontSize(10.5).font("Helvetica").fillColor(COLORS.muted).text(subtitle, marginLeft);

    doc.moveDown(0.8);
    doc
      .moveTo(marginLeft, doc.y)
      .lineTo(marginLeft + usableWidth, doc.y)
      .strokeColor(COLORS.primary)
      .lineWidth(1.5)
      .stroke();

    doc.moveDown(1);
    doc.fillColor(COLORS.text).font("Helvetica");
    doc.x = marginLeft;
  }

  _drawSectionTitle(doc, text, extraNote) {
    this._ensureSpace(doc, 100);
    const marginLeft = doc.page.margins.left;
    const y = doc.y;

    doc.rect(marginLeft, y + 2, 4, 14).fill(COLORS.accent);
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor(COLORS.primary)
      .text(text, marginLeft + 12, y);

    if (extraNote) {
      doc.moveDown(0.15);
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.muted).text(extraNote, marginLeft + 12);
    }

    doc.moveDown(0.6);
    doc.fillColor(COLORS.text).font("Helvetica");
    doc.x = marginLeft;
  }

  _sectionDivider(doc) {
    const marginLeft = doc.page.margins.left;
    const topThreshold = doc.page.margins.top + 20;
    if (doc.y <= topThreshold) return;

    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.moveDown(0.2);
    doc
      .dash(2, { space: 2 })
      .moveTo(marginLeft, doc.y)
      .lineTo(marginLeft + usableWidth, doc.y)
      .strokeColor(COLORS.border)
      .lineWidth(0.75)
      .stroke()
      .undash();
    doc.moveDown(0.9);
    doc.x = marginLeft;
  }

  _drawTable(doc, { columns, rows, totalRow }) {
    const startX = doc.page.margins.left;
    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const rowHeight = 22;
    const headerHeight = 26;

    const totalRatio = columns.reduce((sum, c) => sum + (c.ratio || 1), 0);
    const colWidths = columns.map((c) => (usableWidth * (c.ratio || 1)) / totalRatio);

    const drawHeaderRow = () => {
      const y = doc.y;
      doc.rect(startX, y, usableWidth, headerHeight).fill(COLORS.primary);
      let x = startX;
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9.5);
      columns.forEach((col, i) => {
        doc.text(col.label, x + 8, y + 8, {
          width: colWidths[i] - 16,
          align: col.align || "left",
        });
        x += colWidths[i];
      });
      doc.y = y + headerHeight;
      doc.fillColor(COLORS.text).font("Helvetica");
    };

    this._ensureSpace(doc, headerHeight + rowHeight * 2);
    drawHeaderRow();

    const drawRow = (cells, { zebra, isTotal } = {}) => {
      const isNewPage = this._ensureSpace(doc, rowHeight);
      if (isNewPage) drawHeaderRow();

      const y = doc.y;

      if (isTotal) {
        doc.rect(startX, y, usableWidth, rowHeight).fill(COLORS.totalBg);
        doc
          .moveTo(startX, y)
          .lineTo(startX + usableWidth, y)
          .strokeColor(COLORS.primary)
          .lineWidth(1)
          .stroke();
      } else if (zebra) {
        doc.rect(startX, y, usableWidth, rowHeight).fill(COLORS.rowAlt);
      }

      let x = startX;
      doc
        .fillColor(isTotal ? COLORS.primary : COLORS.text)
        .font(isTotal ? "Helvetica-Bold" : "Helvetica")
        .fontSize(9.5);
      cells.forEach((cell, i) => {
        doc.text(String(cell), x + 8, y + 6, {
          width: colWidths[i] - 16,
          align: columns[i].align || "left",
        });
        x += colWidths[i];
      });

      doc.y = y + rowHeight;
      doc.fillColor(COLORS.text).font("Helvetica");
    };

    if (!rows.length) {
      this._ensureSpace(doc, rowHeight);
      const y = doc.y;
      doc.fontSize(9.5).fillColor(COLORS.muted).text("Tidak ada data", startX + 8, y + 6);
      doc.y = y + rowHeight;
      doc.fillColor(COLORS.text);
    } else {
      rows.forEach((row, idx) => drawRow(row, { zebra: idx % 2 === 1 }));
    }

    if (totalRow) {
      drawRow(totalRow, { isTotal: true });
    }

    doc
      .moveTo(startX, doc.y)
      .lineTo(startX + usableWidth, doc.y)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();

    doc.moveDown(1);
    doc.x = startX;
  }

  _addTrendSection(doc, { periodKey, series, dateRange }) {
    const label = this._periodName(periodKey);
    const rangeNote = dateRange
      ? `Rentang: ${this.isoDate(dateRange.startDate)} s/d ${this.isoDate(dateRange.endDate)}`
      : null;

    this._drawSectionTitle(doc, `Trend Pelamar - ${label}`, rangeNote);

    const labels = Array.isArray(series?.labels) ? series.labels : [];
    const vals = Array.isArray(series?.applications) ? series.applications : [];
    const rows = labels.map((l, i) => [l, vals[i] ?? 0]);
    const totalVal = vals.reduce((s, v) => s + (Number(v) || 0), 0);

    this._drawTable(doc, {
      columns: [
        { label: "Periode", ratio: 3, align: "left" },
        { label: "Jumlah Pelamar", ratio: 1, align: "right" },
      ],
      rows,
      totalRow: rows.length ? ["Total", totalVal] : null,
    });

    this._sectionDivider(doc);
  }

  _addPositionsSection(doc, report) {
    this._drawSectionTitle(doc, "Analitik Posisi", "Distribusi jumlah lamaran per posisi yang dibuka");

    const pos = Array.isArray(report.positionDetails) ? report.positionDetails : [];
    const rows = pos.map((p) => [p.position || "-", p.count ?? 0, `${p.percentage ?? 0}%`]);
    const totalCount = pos.reduce((s, p) => s + (Number(p.count) || 0), 0);

    this._drawTable(doc, {
      columns: [
        { label: "Posisi", ratio: 3, align: "left" },
        { label: "Jumlah", ratio: 1, align: "right" },
        { label: "Persentase", ratio: 1, align: "right" },
      ],
      rows,
      totalRow: rows.length ? ["Total", totalCount, "100%"] : null,
    });

    this._sectionDivider(doc);
  }

  _addStatusSection(doc, report) {
    this._drawSectionTitle(doc, "Status Lamaran", "Ringkasan status akhir lamaran pada periode laporan");

    const acc = report.chartAcceptance || {};
    const labels = Array.isArray(acc.labels) ? acc.labels : [];
    const values = Array.isArray(acc.values) ? acc.values : [];
    const total = values.reduce((s, v) => s + (Number(v) || 0), 0);

    const rows = labels.map((l, i) => {
      const v = values[i] ?? 0;
      const pct = total > 0 ? `${((v / total) * 100).toFixed(1)}%` : "0%";
      return [l, v, pct];
    });

    this._drawTable(doc, {
      columns: [
        { label: "Status", ratio: 3, align: "left" },
        { label: "Jumlah", ratio: 1, align: "right" },
        { label: "Persentase", ratio: 1, align: "right" },
      ],
      rows,
      totalRow: rows.length ? ["Total", total, "100%"] : null,
    });

    this._sectionDivider(doc);
  }

  _addPageNumbers(doc) {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      const marginLeft = doc.page.margins.left;
      const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const bottom = doc.page.height - doc.page.margins.bottom + 14;

      doc
        .moveTo(marginLeft, bottom - 6)
        .lineTo(marginLeft + usableWidth, bottom - 6)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .stroke();

      doc
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text("Sistem Manajemen Rekrutmen", marginLeft, bottom, {
          width: usableWidth / 2,
          align: "left",
        });

      doc
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(`Halaman ${i - range.start + 1} dari ${range.count}`, marginLeft, bottom, {
          width: usableWidth,
          align: "right",
        });
    }
  }

  _reportTitles(type, report) {
    const TITLE_BY_TYPE = {
      dashboard: ["LAPORAN REKRUTMEN", "Ringkasan Trend, Posisi, dan Status Lamaran"],
      trend_analytics: ["LAPORAN TREND PELAMAR", "Analitik Trend Jumlah Pelamar"],
      position_analytics: ["LAPORAN ANALITIK POSISI", "Distribusi Lamaran per Posisi"],
      status_analytics: ["LAPORAN STATUS LAMARAN", "Ringkasan Status Diterima / Ditolak / Dalam Proses"],
    };
    return TITLE_BY_TYPE[type] || ["LAPORAN REKRUTMEN", "Laporan Rekrutmen Karyawan"];
  }

  async generatePDFBuffer(report, type = "dashboard") {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: "A4",
          bufferPages: true,
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        doc.on("pageAdded", () => this._drawTopBar(doc));
        this._drawTopBar(doc);

        const [title, subtitle] = this._reportTitles(type, report);
        this._drawReportHeader(doc, title, subtitle);

        if (type === "dashboard") {
          const trendExport = report.trendExport;
          const meta = report.dashboardMeta || {};
          const basePeriod = trendExport?.basePeriod || meta.trendPeriod || "monthly";
          const series = trendExport?.trends ? trendExport.trends[basePeriod] : report.chartTrend;

          this._addTrendSection(doc, {
            periodKey: basePeriod,
            series,
            dateRange: trendExport?.dateRange || null,
          });

          this._addPositionsSection(doc, report);
          this._addStatusSection(doc, report);
        } else if (type === "trend_analytics") {
          const trendExport = report.trendExport;
          const basePeriod = trendExport?.basePeriod || report.period || "monthly";
          const series = trendExport?.trends ? trendExport.trends[basePeriod] : report.chartTrend;

          this._addTrendSection(doc, {
            periodKey: basePeriod,
            series,
            dateRange: trendExport?.dateRange || null,
          });
        } else if (type === "position_analytics") {
          this._addPositionsSection(doc, report);
        } else if (type === "status_analytics") {
          this._addStatusSection(doc, report);
        } else {
          this._addTrendSection(doc, {
            periodKey: report.period || "monthly",
            series: report.chartTrend,
            dateRange: null,
          });
          this._addPositionsSection(doc, report);
          this._addStatusSection(doc, report);
        }

        this._addPageNumbers(doc);
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  async getSavedReports(period = null) {
    const where = period ? { period } : {};
    return reportsRepository.findMany(where);
  }
}

module.exports = new ReportsService();