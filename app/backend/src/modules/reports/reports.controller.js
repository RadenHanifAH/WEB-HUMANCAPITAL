const reportsService = require("./reports.service");

class ReportsController {
  /**
   * Get real-time metrics
   */
  getRecruitmentMetrics = async (req, res) => {
    try {
      const metrics = await reportsService.getOverallMetrics();
      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({
        message: "Gagal memuat metrik",
        error: error.message,
      });
    }
  };

  /**
   * Get real-time chart data
   */
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
   * Export report (Save to DB + Return CSV)
   */
  exportReport = async (req, res) => {
    try {
      const { type, period } = req.query;

      // Type: comprehensive | position_analytics | trend_analytics
      // Period: daily | weekly | monthly | yearly

      const reportPeriod = period || "monthly";

      console.log(`📤 Exporting ${type} report for period: ${reportPeriod}`);

      // 1. Save snapshot to database first
      const savedReport = await reportsService.saveReportSnapshot(reportPeriod);

      // 2. Generate CSV from saved report
      const csvData = reportsService.generateCSVData(savedReport, type);

      // 3. Set filename
      const filename = `laporan_${type || "comprehensive"}_${
        savedReport.period
      }_${new Date().toISOString().split("T")[0]}.csv`;

      // 4. Send CSV file
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.status(200).send("\uFEFF" + csvData); // BOM for Excel UTF-8 support
    } catch (error) {
      console.error("Export Report Error:", error);
      res.status(500).json({
        message: "Gagal export laporan",
        error: error.message,
      });
    }
  };

  /**
   * Get saved reports list
   */
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

  /**
   * Get report by ID
   */
  getReportById = async (req, res) => {
    try {
      const { id } = req.params;
      const report = await reportsService.getReportById(id);

      if (!report) {
        return res.status(404).json({
          message: "Laporan tidak ditemukan",
        });
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

  /**
   * Delete report
   */
  deleteReport = async (req, res) => {
    try {
      const { id } = req.params;
      await reportsService.deleteReport(id);

      res.status(200).json({
        message: "Laporan berhasil dihapus",
      });
    } catch (error) {
      res.status(500).json({
        message: "Gagal menghapus laporan",
        error: error.message,
      });
    }
  };

  /**
   * Manual save snapshot (optional, jika mau ada button terpisah)
   */
  saveSnapshot = async (req, res) => {
    try {
      const { period } = req.body;

      if (
        !period ||
        !["daily", "weekly", "monthly", "yearly"].includes(period)
      ) {
        return res.status(400).json({
          message: "Period harus diisi: daily, weekly, monthly, atau yearly",
        });
      }

      const report = await reportsService.saveReportSnapshot(period);

      res.status(201).json({
        message: `Laporan ${period} berhasil disimpan`,
        data: report,
      });
    } catch (error) {
      console.error("Save Snapshot Error:", error);
      res.status(500).json({
        message: "Gagal menyimpan laporan",
        error: error.message,
      });
    }
  };
}

module.exports = new ReportsController();
