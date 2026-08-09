const reportsService = require("./reports.service");

class ReportsController {
  getRecruitmentMetrics = async (req, res) => {
    try {
      const { period } = req.query;
      const metrics = await reportsService.getOverallMetrics(period || "monthly");
      return res.status(200).json(metrics);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Gagal memuat metrik", error: error.message });
    }
  };

  getChartData = async (req, res) => {
    try {
      const { period, startDate, endDate, granularity } = req.query;

      let data;

      // ✅ Kalau ada custom date range (startDate & endDate), pakai granularity
      // yang dipilih user (harian/mingguan/bulanan/tahunan) untuk grouping-nya,
      // bukan default range "12 bulan terakhir".
      if (startDate && endDate) {
        data = await reportsService.getReportsByCustomRange(
          startDate,
          endDate,
          granularity || "monthly"
        );
      } else {
        data = await reportsService.getReportsByPeriod(period || "monthly");
      }

      return res.status(200).json(data);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Gagal memuat chart", error: error.message });
    }
  };

  /**
   * /api/reports/export
   * - type=dashboard -> 3 sheet/section (trend + posisi + status)
   *    trendPeriod = dari dropdown
   *    posisi/status = default monthly (tetap)
   * - type=trend_analytics -> 1 sheet/section trend (period dari dropdown)
   * - type=position_analytics -> 1 sheet/section posisi (period default monthly)
   * - type=status_analytics -> 1 sheet/section status (period default monthly)
   *
   * - format=xlsx (default) -> spreadsheet Excel
   * - format=pdf -> laporan formal PDF dengan header, tabel per section,
   *   dan nomor halaman
   *
   * ✅ BARU: startDate & endDate (opsional) -> kalau dikirim (biasanya karena
   * user sedang pakai custom date range di chart trend), trend export akan
   * memakai rentang tanggal ini alih-alih rolling window default dari
   * `trendPeriod`/`period`. Hanya berlaku untuk type=dashboard &
   * type=trend_analytics — posisi/status tetap pakai window monthly default,
   * sesuai desain awal (tidak ikut dropdown maupun custom range).
   */
  exportReport = async (req, res) => {
    try {
      const { type = "dashboard", format = "xlsx", startDate, endDate } = req.query;
      const normalizedFormat = String(format).toLowerCase();

      const customRange = startDate && endDate ? { startDate, endDate } : null;

      let report;

      if (type === "dashboard") {
        const { trendPeriod = "monthly" } = req.query;

        // posisi & status dibuat tetap (misal monthly) karena kamu minta tidak ikut dropdown
        report = await reportsService.buildDashboardExportData({
          trendPeriod,
          positionPeriod: "monthly",
          statusPeriod: "monthly",
          dateRange: customRange,
        });
      } else {
        // single export
        const { period = "monthly" } = req.query;

        // kamu minta: trend ikut dropdown, posisi/status tetap
        const finalPeriod =
          type === "trend_analytics" ? period : "monthly";

        report = await reportsService.buildSingleData({
          type,
          period: finalPeriod,
          // custom range hanya relevan buat trend_analytics
          dateRange: type === "trend_analytics" ? customRange : null,
        });
      }

      const today = new Date().toISOString().split("T")[0];

      if (normalizedFormat === "xlsx") {
        const buffer = await reportsService.generateXLSXBuffer(report, type);

        const filename = `laporan_${type}_${today}.xlsx`;
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        return res.status(200).send(Buffer.from(buffer));
      }

      // ✅ BARU: export laporan formal dalam bentuk PDF
      if (normalizedFormat === "pdf") {
        const buffer = await reportsService.generatePDFBuffer(report, type);

        const filename = `laporan_${type}_${today}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        return res.status(200).send(buffer);
      }

      return res
        .status(400)
        .json({ message: "Format tidak didukung. Pakai format=xlsx atau format=pdf" });
    } catch (error) {
      console.error("Export Report Error:", error);
      return res
        .status(500)
        .json({ message: "Gagal export laporan", error: error.message });
    }
  };
}

module.exports = new ReportsController();