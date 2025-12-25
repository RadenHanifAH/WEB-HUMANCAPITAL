const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ReportsRepository {
  findAll(filter = {}) {
    return prisma.report.findMany({
      where: filter,
      orderBy: { startDate: "desc" },
    });
  }

  findByPeriod(period) {
    return prisma.report.findMany({
      where: { period },
      orderBy: { startDate: "desc" },
    });
  }

  getAggregatedMetrics() {
    return prisma.report.aggregate({
      _sum: {
        totalApplications: true,
        accepted: true,
        rejected: true,
      },
      _avg: {
        averageProcessTime: true,
        conversionRate: true,
      },
    });
  }
}

module.exports = new ReportsRepository();
