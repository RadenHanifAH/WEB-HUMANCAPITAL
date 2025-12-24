import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class ReportsRepository {
  async findAll(filter = {}) {
    return await prisma.report.findMany({
      where: filter,
      orderBy: { startDate: 'desc' }
    });
  }

  async findByPeriod(period) {
    return await prisma.report.findMany({
      where: { period: period },
      orderBy: { startDate: 'desc' }
    });
  }

  // Mengambil rata-rata dan total dari snapshot yang ada
  async getAggregatedMetrics() {
    return await prisma.report.aggregate({
      _sum: {
        totalApplications: true,
        accepted: true,
        rejected: true
      },
      _avg: {
        averageProcessTime: true,
        conversionRate: true
      }
    });
  }
}

export default new ReportsRepository();