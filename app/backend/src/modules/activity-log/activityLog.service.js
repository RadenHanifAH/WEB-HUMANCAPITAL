const prisma = require("../../config/prisma");

// ✅ FIX: hard-lock modul dihapus.
// Modul sekarang jadi filter OPSIONAL dari client (?modul=lowongan, dst).
// Tanpa param → semua modul ditampilkan.

// ─── Filter builder ────────────────────────────────────────────────────────────
function buildWhere({ search, aksi, modul, pengguna_id, startDate, endDate }) {
  const where = {};

  if (modul && modul !== "all") where.modul = modul;
  if (aksi && aksi !== "all") where.aksi = aksi;
  if (pengguna_id) where.pengguna_id = Number(pengguna_id);

  if (search) {
    where.OR = [
      { deskripsi: { contains: search } },
      { nama_pelaku: { contains: search } },
    ];
  }

  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.created_at.lte = end;
    }
  }

  return where;
}

// ─── List logs dengan pagination ──────────────────────────────────────────────
async function getLogs(params = {}) {
  const {
    search = "",
    aksi = "all",
    modul = "all",
    pengguna_id,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = params;

  const take = Math.min(Number(limit) || 10, 100);
  const skip = (Number(page) - 1) * take;

  const where = buildWhere({ search, aksi, modul, pengguna_id, startDate, endDate });

  const [items, total] = await Promise.all([
    prisma.log_aktivitas.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take,
      include: {
        pengguna: {
          select: { id: true, nama: true, email: true, peran: true },
        },
      },
    }),
    prisma.log_aktivitas.count({ where }),
  ]);

  return {
    items,
    total,
    page: Number(page),
    pageSize: take,
    totalPages: Math.ceil(total / take) || 1,
  };
}

// ─── Detail satu log (tanpa filter modul) ─────────────────────────────────────
async function getLogById(id) {
  const item = await prisma.log_aktivitas.findUnique({
    where: { id: Number(id) },
    include: {
      pengguna: {
        select: { id: true, nama: true, email: true, peran: true },
      },
    },
  });

  if (!item) throw { status: 404, message: "Log tidak ditemukan" };
  return item;
}

// ─── Stats untuk dashboard cards (semua modul) ────────────────────────────────
async function getStats() {
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const [total, today, thisWeek, byAction, byModule] = await Promise.all([
    prisma.log_aktivitas.count(),
    prisma.log_aktivitas.count({
      where: { created_at: { gte: startOfToday } },
    }),
    prisma.log_aktivitas.count({
      where: { created_at: { gte: startOfWeek } },
    }),
    prisma.log_aktivitas.groupBy({
      by: ["aksi"],
      _count: { aksi: true },
      orderBy: { _count: { aksi: "desc" } },
    }),
    // ✅ FIX: byModule dihitung nyata, bukan disimulasikan 1 modul
    prisma.log_aktivitas.groupBy({
      by: ["modul"],
      _count: { modul: true },
      orderBy: { _count: { modul: "desc" } },
    }),
  ]);

  return {
    total,
    today,
    thisWeek,
    byAction: byAction.map((b) => ({ aksi: b.aksi, count: b._count.aksi })),
    byModule: byModule.map((b) => ({ modul: b.modul, count: b._count.modul })),
  };
}

module.exports = {
  getLogs,
  getLogById,
  getStats,
};