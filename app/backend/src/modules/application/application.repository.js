const prisma = require("../../config/prisma");

module.exports = {
  create(data) {
    return prisma.application.create({ data });
  },

  findAll() {
    return prisma.application.findMany({
      include: {
        user: { include: { profile: true } },
        job: true,
      },
      orderBy: { appliedAt: "desc" },
    });
  },

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

  findLatestByUserId(userId) {
    return prisma.application.findFirst({
      where: { userId: Number(userId) },
      orderBy: { appliedAt: "desc" },
      select: {
        id: true,
        status: true,
        stage: true,
        appliedAt: true,
        cvUrl: true,
        portfolioUrl: true,
        job: { select: { id: true, title: true } },
      },
    });
  },

  findActiveByUserId(userId) {
    return prisma.application.findFirst({
      where: {
        userId: Number(userId),
        archive: { is: null },
      },
      orderBy: { appliedAt: "desc" },
      select: {
        id: true,
        status: true,
        stage: true,
        appliedAt: true,
        cvUrl: true,
        portfolioUrl: true,
        job: { select: { id: true, title: true } },
      },
    });
  },

  findManyByUserId(userId) {
    return prisma.application.findMany({
      where: { userId: Number(userId) },
      orderBy: { appliedAt: "desc" },
      select: {
        id: true,
        status: true,
        stage: true,
        appliedAt: true,
        cvUrl: true,
        portfolioUrl: true,
        job: { select: { id: true, title: true } },
      },
    });
  },

  updateStatusAndStage(id, status, stage) {
    return prisma.application.update({
      where: { id: Number(id) },
      data: { status, stage },
    });
  },

  updateScore(id, score) {
    return prisma.application.update({
      where: { id: Number(id) },
      data: { score: score === null ? null : Number(score) },
    });
  },
};
