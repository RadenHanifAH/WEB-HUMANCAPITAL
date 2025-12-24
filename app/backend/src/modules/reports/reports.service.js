import reportsRepository from './reports.repository.js';

class ReportsService {
  async getReportsByPeriod(period) {
    const data = await reportsRepository.findByPeriod(period);
    
    // Transformasi data untuk Chart.js (Frontend)
    // Map data agar label dan value terpisah sesuai format Chart.js
    const labels = data.map(r => new Date(r.startDate).toLocaleDateString('id-ID'));
    const applications = data.map(r => r.totalApplications);
    const accepted = data.map(r => r.accepted);
    const rejected = data.map(r => r.rejected);

    return {
      chartTrend: { labels, applications },
      chartAcceptance: { labels, accepted, rejected }
    };
  }

  async getOverallMetrics() {
    const agg = await reportsRepository.getAggregatedMetrics();
    // Ambil detail posisi dari record snapshot terbaru
    const reports = await reportsRepository.findAll();
    const lastReport = reports[0];
    
    return {
      totalApplications: agg._sum.totalApplications || 0,
      accepted: agg._sum.accepted || 0,
      rejected: agg._sum.rejected || 0,
      avgProcessTime: agg._avg.averageProcessTime ? parseFloat(agg._avg.averageProcessTime.toFixed(1)) : 0,
      conversionRate: agg._avg.conversionRate ? parseFloat(agg._avg.conversionRate.toFixed(1)) : 0,
      positionDetails: lastReport?.positionDetails || []
    };
  }
}

export default new ReportsService();