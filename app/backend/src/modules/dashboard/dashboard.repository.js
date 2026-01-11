const prisma = require("../../config/prisma");

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

// ✅ Normalisasi stage/status -> pipeline FE
function normalizeStageTitle(app) {
  const stage = String(app?.stage || "")
    .trim()
    .toLowerCase();
  const status = String(app?.status || "")
    .trim()
    .toLowerCase();

  // accepted/rejected jangan masuk pipeline proses
  if (
    status.includes("accept") ||
    stage.includes("accept") ||
    status.includes("hired") ||
    stage.includes("hired")
  )
    return null;
  if (status.includes("reject") || stage.includes("reject")) return null;

  if (
    stage.includes("screan") ||
    stage.includes("screen") ||
    status.includes("under review")
  )
    return "Under Review";
  if (
    stage.includes("interview hc") ||
    stage.includes("interviewhc") ||
    status.includes("interview hc")
  )
    return "Interview HC";
  if (
    stage.includes("psikotes") ||
    stage.includes("psycho") ||
    status.includes("psikotes")
  )
    return "Psikotes";
  if (
    stage.includes("final interview") ||
    stage.includes("finalinterview") ||
    status.includes("final interview")
  )
    return "Final Interview";

  return "Under Review";
}

module.exports = {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  normalizeStageTitle,

  // JOB
  countJobsTotal() {
    return prisma.job.count();
  },
  countJobsActive() {
    return prisma.job.count({ where: { status: "active" } });
  },

  // APPLICATION
  countAllApplications() {
    return prisma.application.count();
  },
  countApplicationsBetween(start, end) {
    return prisma.application.count({
      where: { appliedAt: { gte: start, lte: end } },
    });
  },
  countAcceptedBetween(start, end) {
    return prisma.application.count({
      where: {
        appliedAt: {
          gte: start,
          lte: end,
        },
        OR: [
          { status: { contains: "accept" } },
          { stage: { contains: "accept" } },
          { status: { contains: "hired" } },
          { stage: { contains: "hired" } },
        ],
      },
    });
  },
  findLatestApplicationsToday(start, end, limit = 8) {
    return prisma.application.findMany({
      where: { appliedAt: { gte: start, lte: end } },
      orderBy: { appliedAt: "desc" },
      take: limit,
      include: {
        user: { include: { profile: true } },
        job: true,
      },
    });
  },

  findAllApplicationsForPipeline() {
    return prisma.application.findMany({
      select: {
        id: true,
        status: true,
        stage: true,
      },
    });
  },

  // REPORTS (opsional)
  findLatestReport() {
    return prisma.reports.findFirst({
      orderBy: { createdAt: "desc" },
    });
  },
};
