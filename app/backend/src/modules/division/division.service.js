// src/modules/division/division.service.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  /**
   * Ambil ringkasan data pengajuan SDM untuk dashboard divisi.
   * Difilter berdasarkan pengguna_id yang login, jadi setiap divisi
   * hanya melihat pengajuan miliknya sendiri.
   */
  async getDashboardData(pengguna_id) {
    const where = pengguna_id ? { pengguna_id } : {};

    const [total_pengajuan, pending, approved, rejected, recent_pengajuan] =
      await Promise.all([
        prisma.pengajuan_sdm.count({ where }),
        prisma.pengajuan_sdm.count({ where: { ...where, status: "PENDING" } }),
        prisma.pengajuan_sdm.count({
          where: { ...where, status: "APPROVED" },
        }),
        prisma.pengajuan_sdm.count({
          where: { ...where, status: "REJECTED" },
        }),
        prisma.pengajuan_sdm.findMany({
          where,
          orderBy: { created_at: "desc" },
          take: 5,
        }),
      ]);

    return {
      total_pengajuan,
      pending,
      approved,
      rejected,
      recent_pengajuan,
    };
  },
};