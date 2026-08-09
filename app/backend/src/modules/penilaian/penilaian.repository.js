const prisma = require("../../config/prisma");

// ---------- FILTER TAHAP SELEKSI UNTUK SEARCH KANDIDAT ----------
const STAGE_VARIANTS = {
  "interview-pertama": ["Interview Pertama", "Interview HC"],
  psikotes: ["Psikotes", "Psikotes/Technical Test", "Psikotes/technical test"],
  "interview-kedua": ["Interview Kedua", "Final Interview"],
};

// ✅ NEW: Mapping key tahap ke jenis jadwal_wawancara (sesuai yang disimpan di schedules.service.js)
const SCHEDULE_JENIS_MAP = {
  "interview-pertama": "InterviewPertama", // ✅ Sesuai enum Prisma
  "psikotes": "Psikotes",
  "interview-kedua": "InterviewKedua"      // ✅ Sesuai enum Prisma
};

// ---------- PSIKOTEST ----------

const createPsikotest = async (data) => {
  return prisma.hasil_psikotes.create({ data });
};

const updatePsikotest = async (id, data) => {
  return prisma.hasil_psikotes.update({
    where: { id: Number(id) },
    data,
  });
};

const getPsikotestById = async (id) => {
  return prisma.hasil_psikotes.findUnique({
    where: { id: Number(id) },
    include: { lamaran: true },
  });
};

const getPsikotestByApplication = async (lamaran_id) => {
  return prisma.hasil_psikotes.findFirst({
    where: { lamaran_id: Number(lamaran_id) },
    orderBy: { created_at: "desc" },
  });
};

const listPsikotest = async ({ q = "", page = 1, pageSize = 10 }) => {
  const where = q ? { nama_pelamar: { contains: q } } : {};

  const [items, total] = await Promise.all([
    prisma.hasil_psikotes.findMany({
      where,
      include: { lamaran: true },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      orderBy: { created_at: "desc" },
    }),
    prisma.hasil_psikotes.count({ where }),
  ]);

  return { items, total };
};

const deletePsikotest = async (id) => {
  return prisma.hasil_psikotes.delete({ where: { id: Number(id) } });
};

// ---------- INTERVIEW ----------

const createInterview = async (data) => {
  return prisma.hasil_wawancara.create({ data });
};

const updateInterview = async (id, data) => {
  return prisma.hasil_wawancara.update({
    where: { id: Number(id) },
    data,
  });
};

const getInterviewById = async (id) => {
  return prisma.hasil_wawancara.findUnique({
    where: { id: Number(id) },
    include: { lamaran: true },
  });
};

const getInterviewByApplication = async (lamaran_id, tahap) => {
  const where = { lamaran_id: Number(lamaran_id) };
  if (tahap) where.tahap = Number(tahap);

  return prisma.hasil_wawancara.findFirst({
    where,
    orderBy: { created_at: "desc" },
  });
};

const listInterview = async ({ q = "", page = 1, pageSize = 10, tahap } = {}) => {
  const where = {
    ...(q ? { nama_pelamar: { contains: q } } : {}),
    ...(tahap ? { tahap: Number(tahap) } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.hasil_wawancara.findMany({
      where,
      include: { lamaran: true },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      orderBy: { created_at: "desc" },
    }),
    prisma.hasil_wawancara.count({ where }),
  ]);

  return { items, total };
};

const deleteInterview = async (id) => {
  return prisma.hasil_wawancara.delete({ where: { id: Number(id) } });
};

// ---------- HELPER: ambil data lamaran untuk prefill form (+ profil lengkap) ----------
const getApplicationForPrefill = async (lamaran_id) => {
  const app = await prisma.lamaran.findUnique({
    where: { id: Number(lamaran_id) },
    include: {
      pengguna: {
        include: {
          profil: true,
          pendidikan: {
            orderBy: { tanggal_mulai: "desc" },
            take: 1,
          },
        },
      },
      lowongan: true,
    },
  });
  return app;
};

// ---------- HELPER: ambil tahap & status lamaran saat ini (untuk auto-advance) ----------
const getApplicationStage = async (lamaran_id) => {
  return prisma.lamaran.findUnique({
    where: { id: Number(lamaran_id) },
    select: { id: true, tahap: true, status: true },
  });
};

// ---------- cari kandidat by nama, DIFILTER sesuai tahap seleksi & SUDAH DIIADWALKAN ----------
const searchApplicationsByName = async (q, stageKey, limit = 8) => {
  if (!q || !q.trim()) return [];

  const where = {
    pengguna: { nama: { contains: q.trim() } },
  };

  if (stageKey) {
    // Filter berdasarkan tahap lamaran saat ini
    const stageValues = STAGE_VARIANTS[stageKey];
    if (stageValues) {
      where.tahap = { in: stageValues };
    }

    // ✅ Filter: Hanya tampilkan kandidat yang SUDAH DIIADWALKAN di tahap ini
    const scheduleJenis = SCHEDULE_JENIS_MAP[stageKey];
    if (scheduleJenis) {
      where.jadwal_wawancara = {
        some: {
          jenis: scheduleJenis,
          status: { not: "canceled" } // Abaikan jadwal yang dibatalkan
        }
      };
    }
  }

  return prisma.lamaran.findMany({
    where,
    select: {
      id: true,
      tahap: true,
      status: true,
      pengguna: {
        select: {
          nama: true,
          email: true,
          profil: true,
          pendidikan: {
            orderBy: { tanggal_mulai: "desc" },
            take: 1,
          },
        },
      },
      lowongan: {
        select: { judul: true },
      },
    },
    take: Number(limit),
    orderBy: { tanggal_melamar: "desc" },
  });
};

// ---------- DOKUMEN PENILAIAN: gabungan psikotest + interview per lamaran ----------
const listAssessmentDocuments = async (q = "") => {
  const where = {
    AND: [
      {
        OR: [
          { hasil_psikotes: { some: {} } },
          { hasil_wawancara: { some: {} } },
        ],
      },
      q && q.trim() ? { pengguna: { nama: { contains: q.trim() } } } : {},
    ],
  };

  return prisma.lamaran.findMany({
    where,
    select: {
      id: true,
      tahap: true,
      status: true,
      tanggal_melamar: true,
      nama_cv: true,
      nama_portofolio: true,
      pengguna: {
        select: {
          id: true,
          nama: true,
          email: true,
          profil: true,
          keahlian_pengguna: { select: { nama: true } },
        },
      },
      lowongan: {
        select: { judul: true },
      },
      hasil_psikotes: {
        orderBy: { updated_at: "desc" },
      },
      hasil_wawancara: {
        orderBy: { updated_at: "desc" },
      },
    },
    orderBy: { tanggal_melamar: "desc" },
  });
};

module.exports = {
  createPsikotest,
  updatePsikotest,
  getPsikotestById,
  getPsikotestByApplication,
  listPsikotest,
  deletePsikotest,

  createInterview,
  updateInterview,
  getInterviewById,
  getInterviewByApplication,
  listInterview,
  deleteInterview,

  getApplicationForPrefill,
  getApplicationStage,
  searchApplicationsByName,

  listAssessmentDocuments,
};