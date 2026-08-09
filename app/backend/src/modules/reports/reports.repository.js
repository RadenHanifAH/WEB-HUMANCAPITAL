const prisma = require("../../config/prisma");

class ReportsRepository {
  async create(data) {
    return prisma.laporan.create({ data });
  }

  async update(id, data) {
    return prisma.laporan.update({
      where: { id: Number(id) },
      data,
    });
  }

  async findFirst(where) {
    return prisma.laporan.findFirst({ where });
  }

  async findMany(where = {}) {
    return prisma.laporan.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async findById(id) {
    return prisma.laporan.findUnique({
      where: { id: Number(id) },
    });
  }

  async delete(id) {
    return prisma.laporan.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = new ReportsRepository();