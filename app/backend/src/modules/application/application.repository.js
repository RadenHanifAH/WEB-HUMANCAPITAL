const prisma = require("../../config/prisma");

module.exports = {
  // =====================================================
  // CREATE APPLICATION (dengan file disimpan di DB)
  // =====================================================
  create(data) {
    return prisma.application.create({ data });
  },

  // =====================================================
  // ADMIN: LIST SEMUA LAMARAN (TANPA BLOB FILE)
  // =====================================================
  findAll() {
    return prisma.application.findMany({
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        job: true,
      },
      orderBy: {
        appliedAt: "desc",
      },
    });
  },

  // =====================================================
  // ADMIN / SERVICE: AMBIL STATUS & STAGE SAJA
  // =====================================================
  findById(id) {
    return prisma.application.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        status: true,
        stage: true,
      },
    });
  },

  // =====================================================
  // USER: TIMELINE TERAKHIR (TANPA BLOB)
  // =====================================================
  findLatestByUserId(userId) {
    return prisma.application.findFirst({
      where: {
        userId: Number(userId),
      },
      orderBy: {
        appliedAt: "desc",
      },
      select: {
        id: true,
        status: true,
        stage: true,
        appliedAt: true,

        cvName: true,
        portfolioName: true,

        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },

  // =====================================================
  // SERVICE: CEK LAMARAN AKTIF (BELUM DIARSIP)
  // =====================================================
  findActiveByUserId(userId) {
    return prisma.application.findFirst({
      where: {
        userId: Number(userId),
        archive: {
          is: null,
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
      select: {
        id: true,
        status: true,
        stage: true,
        appliedAt: true,

        cvName: true,
        portfolioName: true,

        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },

  // =====================================================
  // USER: LIST SEMUA LAMARAN DIA (TANPA BLOB)
  // =====================================================
  findManyByUserId(userId) {
    return prisma.application.findMany({
      where: {
        userId: Number(userId),
      },
      orderBy: {
        appliedAt: "desc",
      },
      select: {
        id: true,
        status: true,
        stage: true,
        appliedAt: true,

        cvName: true,
        portfolioName: true,

        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },

  // =====================================================
  // ADMIN: UPDATE STATUS & STAGE
  // =====================================================
  updateStatusAndStage(id, status, stage) {
    return prisma.application.update({
      where: { id: Number(id) },
      data: {
        status,
        stage,
      },
    });
  },

  // =====================================================
  // ADMIN: UPDATE SCORE
  // =====================================================
  updateScore(id, score) {
    return prisma.application.update({
      where: { id: Number(id) },
      data: {
        score: score === null ? null : Number(score),
      },
    });
  },

  // =====================================================
  // ADMIN: DOWNLOAD FILE (AMBIL BLOB + METADATA)
  // =====================================================
  findFileById(id) {
    return prisma.application.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,

        cvData: true,
        cvName: true,
        cvMime: true,
        cvSize: true,

        portfolioData: true,
        portfolioName: true,
        portfolioMime: true,
        portfolioSize: true,
      },
    });
  },
};
