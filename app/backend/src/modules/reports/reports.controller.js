const reportsService = require("./reports.service");

class ReportsController {
  getRecruitmentMetrics = async (req, res) => {
    try {
      const metrics = await reportsService.getOverallMetrics();
      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Gagal memuat metrik", error: error.message });
    }
  };

  getChartData = async (req, res) => {
    try {
      const { period } = req.query;
      const data = await reportsService.getReportsByPeriod(period || "monthly");
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: "Gagal memuat chart", error: error.message });
    }
  };
}

module.exports = new ReportsController();