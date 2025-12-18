// backend/src/modules/application/application.repository.js
const prisma = require("../../config/prisma");

module.exports = {
  create(data) {
    return prisma.application.create({ data });
  },

  findAll() {
    return prisma.application.findMany({
      include: {
        user: {
          include: {
            profile: true, // 🛑 PASTIKAN RELASI PROFILE DIMUAT DI SINI
          },
        },
        job: true,
      },
      orderBy: { appliedAt: "desc" },
    });
  },

  findById(id) {
    return prisma.application.findUnique({
      where: { id: Number(id) },
      include: { user: true, job: true },
    });
  },
  // ✅ FUNGSI BARU/DIUBAH: Untuk mengupdate status dan stage
  updateStatusAndStage(id, status, stage) {
    return prisma.application.update({
      where: { id: Number(id) },
      data: { status, stage }, // Update status DAN stage
    });
  },
  // ✅ FUNGSI BARU: Untuk mengupdate score
  updateScore(id, score) {
    return prisma.application.update({
      where: { id: Number(id) },
      data: { score: score === null ? null : Number(score) }, // Pastikan score diubah ke Number atau null
    });
  },
};
