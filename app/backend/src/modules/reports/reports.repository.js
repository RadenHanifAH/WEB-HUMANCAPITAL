const  prisma = require("../../config/prisma")

class ReportsRepository {
  /**
   * Create new report
   */
  async create(data) {
    return prisma.reports.create({ data });
  }

  /**
   * Update existing report
   */
  async update(id, data) {
    return prisma.reports.update({
      where: { id: Number(id) },
      data,
    });
  }

  /**
   * Find report by criteria
   */
  async findFirst(where) {
    return prisma.reports.findFirst({ where });
  }

  /**
   * Find all reports with optional filter
   */
  async findMany(where = {}) {
    return prisma.reports.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find report by ID
   */
  async findById(id) {
    return prisma.reports.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Delete report
   */
  async delete(id) {
    return prisma.reports.delete({
      where: { id: Number(id) },
    });
  }

  /**
   * Count reports
   */
  async count(where = {}) {
    return prisma.reports.count({ where });
  }
}

module.exports = new ReportsRepository();
