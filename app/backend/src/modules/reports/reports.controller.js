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
      const { period } = req.query;
      const data = await reportsService.getReportsByPeriod(period || "monthly");
      return res.status(200).json(data);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Gagal memuat chart", error: error.message });
    }
  };

  /**
   * /api/reports/export
   * - type=dashboard -> 3 sheet (trend + posisi + status)
   *    trendPeriod = dari dropdown
   *    posisi/status = default monthly (tetap)
   * - type=trend_analytics -> 1 sheet trend (period dari dropdown)
   * - type=position_analytics -> 1 sheet posisi (period default monthly)
   * - type=status_analytics -> 1 sheet status (period default monthly)
   */
  exportReport = async (req, res) => {
    try {
      const { type = "dashboard", format = "xlsx" } = req.query;

      let report;

      if (type === "dashboard") {
        const { trendPeriod = "monthly" } = req.query;

        // posisi & status dibuat tetap (misal monthly) karena kamu minta tidak ikut dropdown
        report = await reportsService.buildDashboardExportData({
          trendPeriod,
          positionPeriod: "monthly",
          statusPeriod: "monthly",
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
        });
      }

      const today = new Date().toISOString().split("T")[0];

      if (String(format).toLowerCase() === "xlsx") {
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

      return res
        .status(400)
        .json({ message: "Format tidak didukung. Pakai format=xlsx" });
    } catch (error) {
      console.error("Export Report Error:", error);
      return res
        .status(500)
        .json({ message: "Gagal export laporan", error: error.message });
    }
  };
}

module.exports = new ReportsController();
