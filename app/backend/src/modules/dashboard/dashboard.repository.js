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

// ✅ Normalisasi tahap/status -> pipeline FE
function normalizeStageTitle(app) {
  const stage = String(app?.tahap || "")
    .trim()
    .toLowerCase();
  const status = String(app?.status || "")
    .trim()
    .toLowerCase();

  // accepted/rejected (lama & baru) jangan masuk pipeline proses
  if (
    status.includes("accept") ||
    stage.includes("accept") ||
    status.includes("hired") ||
    stage.includes("hired") ||
    status.includes("diterima") ||
    stage.includes("diterima")
  )
    return null;
  if (
    status.includes("reject") ||
    stage.includes("reject") ||
    status.includes("ditolak") ||
    stage.includes("ditolak")
  )
    return null;

  if (
    stage.includes("screan") ||
    stage.includes("screen") ||
    status.includes("under review") ||
    status.includes("screan") ||
    status.includes("screen")
  )
    return "Screaning";

  // ✅ Interview HC (lama) & Interview Pertama (baru)
  if (
    stage.includes("interview hc") ||
    stage.includes("interviewhc") ||
    stage.includes("interview pertama") ||
    status.includes("interview hc") ||
    status.includes("interview pertama")
  )
    return "Interview Pertama";

  // ✅ Psikotes / Psikotes-Technical Test
  if (
    stage.includes("psikotes") ||
    stage.includes("psycho") ||
    stage.includes("technical") ||
    status.includes("psikotes") ||
    status.includes("technical")
  )
    return "Psikotes";

  // ✅ Final Interview (lama) & Interview Kedua (baru)
  if (
    stage.includes("final interview") ||
    stage.includes("finalinterview") ||
    stage.includes("interview kedua") ||
    status.includes("final interview") ||
    status.includes("interview kedua")
  )
    return "Interview Kedua";

  return "Screaning";
}

module.exports = {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  normalizeStageTitle,

  // LOWONGAN
  countJobsTotal() {
    return prisma.lowongan.count();
  },
  countJobsActive() {
    return prisma.lowongan.count({ where: { status: "active" } });
  },

  // LAMARAN
  countAllApplications() {
    return prisma.lamaran.count();
  },
  countApplicationsBetween(start, end) {
    return prisma.lamaran.count({
      where: { tanggal_melamar: { gte: start, lte: end } },
    });
  },
  findLatestApplicationsToday(start, end, limit = 8) {
    return prisma.lamaran.findMany({
      where: { tanggal_melamar: { gte: start, lte: end } },
      orderBy: { tanggal_melamar: "desc" },
      take: limit,
      include: {
        pengguna: { include: { profil: true } },
        lowongan: true,
      },
    });
  },

  findAllApplicationsForPipeline() {
    return prisma.lamaran.findMany({
      select: {
        id: true,
        status: true,
        tahap: true,
      },
    });
  },
};