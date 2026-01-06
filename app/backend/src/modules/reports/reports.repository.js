const prisma = require("../../config/prisma");

class ReportsRepository {
  async create(data) {
    return prisma.reports.create({ data });
  }

  async update(id, data) {
    return prisma.reports.update({
      where: { id: Number(id) },
      data,
    });
  }

  async findFirst(where) {
    return prisma.reports.findFirst({ where });
  }

  async findMany(where = {}) {
    return prisma.reports.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id) {
    return prisma.reports.findUnique({
      where: { id: Number(id) },
    });
  }

  async delete(id) {
    return prisma.reports.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = new ReportsRepository();
