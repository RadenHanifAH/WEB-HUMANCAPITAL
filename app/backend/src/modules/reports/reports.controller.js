const reportsService = require("./reports.service");

class ReportsController {
  // ✅ Metrics untuk posisi (bisa terima period)
  getRecruitmentMetrics = async (req, res) => {
    try {
      const { period } = req.query;
      const metrics = await reportsService.getOverallMetrics(period || "monthly");
      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({
        message: "Gagal memuat metrik",
        error: error.message,
      });
    }
  };

  // ✅ Chart trend + status (bisa terima period)
  getChartData = async (req, res) => {
    try {
      const { period } = req.query;
      const data = await reportsService.getReportsByPeriod(period || "monthly");
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: "Gagal memuat chart",
        error: error.message,
      });
    }
  };

  /**
   * ✅ Export
   * - type=trend_analytics | position_analytics | status_analytics
   *   pakai: ?type=...&period=monthly
   *
   * - type=dashboard
   *   pakai: ?type=dashboard&trendPeriod=weekly&positionPeriod=yearly&statusPeriod=daily
   */
  exportReport = async (req, res) => {
    try {
      const { type } = req.query;

      const reportType = type || "dashboard";

      let savedReport;

      if (reportType === "dashboard") {
        const { trendPeriod, positionPeriod, statusPeriod } = req.query;

        savedReport = await reportsService.saveDashboardSnapshot({
          trendPeriod: trendPeriod || "monthly",
          positionPeriod: positionPeriod || "monthly",
          statusPeriod: statusPeriod || "monthly",
        });
      } else {
        const { period } = req.query;
        const reportPeriod = period || "monthly";
        savedReport = await reportsService.saveReportSnapshot(reportPeriod);
      }

      const csvData = reportsService.generateCSVData(savedReport, reportType);

      const filename = `laporan_${reportType}_${new Date()
        .toISOString()
        .split("T")[0]}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send("\uFEFF" + csvData);
    } catch (error) {
      console.error("Export Report Error:", error);
      res.status(500).json({
        message: "Gagal export laporan",
        error: error.message,
      });
    }
  };

  getSavedReports = async (req, res) => {
    try {
      const { period } = req.query;
      const reports = await reportsService.getSavedReports(period);

      res.status(200).json({
        message: "Daftar laporan tersimpan",
        count: reports.length,
        data: reports,
      });
    } catch (error) {
      res.status(500).json({
        message: "Gagal memuat laporan tersimpan",
        error: error.message,
      });
    }
  };

  getReportById = async (req, res) => {
    try {
      const { id } = req.params;
      const report = await reportsService.getReportById(id);

      if (!report) {
        return res.status(404).json({ message: "Laporan tidak ditemukan" });
      }

      res.status(200).json({
        message: "Detail laporan",
        data: report,
      });
    } catch (error) {
      res.status(500).json({
        message: "Gagal memuat detail laporan",
        error: error.message,
      });
    }
  };

  deleteReport = async (req, res) => {
    try {
      const { id } = req.params;
      await reportsService.deleteReport(id);

      res.status(200).json({ message: "Laporan berhasil dihapus" });
    } catch (error) {
      res.status(500).json({
        message: "Gagal menghapus laporan",
        error: error.message,
      });
    }
  };
}

module.exports = new ReportsController();
