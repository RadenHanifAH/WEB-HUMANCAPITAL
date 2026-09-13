const reportsService = require("./reports.service");
// 📝 LOG: tambahan untuk Log Aktivitas
const { logActivity, getClientIp } = require("../activity-log/activityLog.helper");

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

  // /api/reports/export — type: dashboard | trend_analytics | position_analytics | status_analytics
  // format: xlsx (default) | pdf. startDate & endDate opsional untuk custom range trend.
  exportReport = async (req, res) => {
    try {
      const { type = "dashboard", format = "xlsx", startDate, endDate } = req.query;
      const normalizedFormat = String(format).toLowerCase();

      const customRange = startDate && endDate ? { startDate, endDate } : null;

      let report;

      if (type === "dashboard") {
        const { trendPeriod = "monthly" } = req.query;

        report = await reportsService.buildDashboardExportData({
          trendPeriod,
          positionPeriod: "monthly",
          statusPeriod: "monthly",
          dateRange: customRange,
        });
      } else {
        const { period = "monthly" } = req.query;

        const finalPeriod =
          type === "trend_analytics" ? period : "monthly";

        report = await reportsService.buildSingleData({
          type,
          period: finalPeriod,
          dateRange: type === "trend_analytics" ? customRange : null,
        });
      }

      const today = new Date().toISOString().split("T")[0];

      if (normalizedFormat === "xlsx") {
        const buffer = await reportsService.generateXLSXBuffer(report, type);

        // 📝 LOG: admin mengexport laporan (xlsx)
        logActivity({
          pengguna_id: req.user?.id,
          aksi: "EXPORT",
          modul: "laporan",
          target_id: null,
          deskripsi: `Export laporan "${type}" (format: xlsx)`,
          data_sebelum: null,
          data_sesudah: null,
          ip_address: getClientIp(req),
        });

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

      if (normalizedFormat === "pdf") {
        const buffer = await reportsService.generatePDFBuffer(report, type);

        // 📝 LOG: admin mengexport laporan (pdf)
        logActivity({
          pengguna_id: req.user?.id,
          aksi: "EXPORT",
          modul: "laporan",
          target_id: null,
          deskripsi: `Export laporan "${type}" (format: pdf)`,
          data_sebelum: null,
          data_sesudah: null,
          ip_address: getClientIp(req),
        });

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