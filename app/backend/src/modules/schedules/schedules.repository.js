const prisma = require("../../config/prisma");

module.exports = {
  findMany({ page, pageSize }) {
    return prisma.jadwal_wawancara.findMany({
      orderBy: { tanggal_waktu: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },

  count() {
    return prisma.jadwal_wawancara.count();
  },

  create(data) {
    return prisma.jadwal_wawancara.create({ data });
  },

  update(id, data) {
    return prisma.jadwal_wawancara.update({
      where: { id: Number(id) },
      data,
    });
  },

  deleteById(id) {
    return prisma.jadwal_wawancara.delete({
      where: { id: Number(id) },
    });
  },
};