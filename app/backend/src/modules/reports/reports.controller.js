import reportsService from './reports.service.js';

class ReportsController {
  // Method ini harus menggunakan arrow function agar context 'this' tidak hilang
  getRecruitmentMetrics = async (req, res) => {
    try {
      const metrics = await reportsService.getOverallMetrics();
      res.status(200).json(metrics);
    } catch (error) {
      console.error("Controller Error:", error);
      res.status(500).json({ message: "Gagal memuat metrik rekrutmen" });
    }
  }

  getChartData = async (req, res) => {
    try {
      const { period } = req.query; 
      const data = await reportsService.getReportsByPeriod(period || 'monthly');
      res.status(200).json(data);
    } catch (error) {
      console.error("Controller Error:", error);
      res.status(500).json({ message: "Gagal memuat data grafik" });
    }
  }
}

export default new ReportsController();