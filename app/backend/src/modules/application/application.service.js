const fs = require("fs");
const path = require("path");
const prisma = require("../../config/prisma");
const repo = require("./application.repository");

// ✅ Notifikasi ke admin — pelamar baru masuk.
// Di-require secara optional: jika modul belum ada, service tetap jalan.
let notificationsService = null;
let NOTIFICATION_TYPES = {};
try {
  const notifModule = require("../notifications/notifications.service");
  notificationsService = notifModule.notificationsService;
  NOTIFICATION_TYPES = notifModule.NOTIFICATION_TYPES || {};
} catch (e) {
  console.warn(
    "⚠️  Module notifikasi tidak tersedia, notifikasi pelamar baru akan dilewati:",
    e.message,
  );
}

const UPLOAD_DIR = path.join(__dirname, "../../../uploads/documents");

const VALID_STAGES = [
  "Screaning",
  "Interview Pertama",
  "Psikotes",
  "Interview Kedua",
  "Final Result",
];

const REQUIRED_PROFILE_FIELDS = [
  "nik",
  "jenis_kelamin",
  "nomor_hp",
  "tempat_lahir",
  "tanggal_lahir",
  "alamat",
];

const SECTION_LABELS = {
  cv: "CV",
  dataPribadi: "Data Pribadi",
  tentangSaya: "Tentang Saya",
  pengalamanKerja: "Pengalaman Kerja",
  pendidikan: "Pendidikan",
  skills: "Skills",
};

// ── Helper functions ─────────────────────────────────────────────────────────

function normalizeText(val) {
  return String(val || "").trim();
}

function toKebab(val) {
  return normalizeText(val).toLowerCase().replace(/\s+/g, "-");
}

function isFilled(val) {
  return val !== null && val !== undefined && String(val).trim() !== "";
}

function isAdminRole(role) {
  return String(role || "").toLowerCase() === "admin";
}

function isFinalStatus(status = "") {
  const s = normalizeText(status).toLowerCase();
  return (
    s === "accepted" ||
    s === "rejected" ||
    s.includes("accept") ||
    s.includes("reject") ||
    s.includes("hired") ||
    s.includes("diterima") ||
    s.includes("ditolak")
  );
}

function stageFromRejectedAt(statusRaw = "") {
  const s = normalizeText(statusRaw).toLowerCase();
  if (!s.startsWith("rejected-at-")) return null;

  const slug = s.replace("rejected-at-", "").trim();

  if (
    slug === "screaning" ||
    slug === "screening" ||
    slug === "under-review" ||
    slug === "under_review"
  )
    return "Screaning";

  if (
    slug === "interview-hc" ||
    slug === "interviewhc" ||
    slug === "interview-pertama" ||
    slug === "interviewpertama"
  )
    return "Interview Pertama";

  if (
    slug === "psikotes" ||
    slug === "psychotest" ||
    slug === "psycho-test" ||
    slug.includes("technical")
  )
    return "Psikotes";

  if (
    slug === "final-interview" ||
    slug === "finalinterview" ||
    slug === "interview-kedua" ||
    slug === "interviewkedua"
  )
    return "Interview Kedua";

  if (slug.includes("offering")) return "Final Result";

  return "Screaning";
}

function mapStatusToStage(statusRaw = "") {
  const raw = normalizeText(statusRaw);
  const low = raw.toLowerCase();

  const rejectedAtStage = stageFromRejectedAt(raw);
  if (rejectedAtStage) return rejectedAtStage;

  if (VALID_STAGES.includes(raw)) return raw;

  if (
    low === "screaning" ||
    low === "screening" ||
    low === "under-review" ||
    low === "under review" ||
    low === "under_review"
  )
    return "Screaning";

  if (
    low === "interview hc" ||
    low === "interview-hc" ||
    low === "interviewhc" ||
    low === "interview pertama" ||
    low === "interview-pertama" ||
    low === "interviewpertama"
  )
    return "Interview Pertama";

  if (
    low === "psikotes" ||
    low === "psikotes/technical test" ||
    low === "psychotest" ||
    low === "psycho test" ||
    low.includes("technical")
  )
    return "Psikotes";

  if (
    low === "final interview" ||
    low === "final-interview" ||
    low === "finalinterview" ||
    low === "interview kedua" ||
    low === "interview-kedua" ||
    low === "interviewkedua"
  )
    return "Interview Kedua";

  if (low.includes("offering")) return "Final Result";

  if (
    low === "accepted" ||
    low.includes("accept") ||
    low.includes("hired") ||
    low.includes("diterima")
  )
    return "Final Result";

  if (low === "rejected" || low.includes("reject") || low.includes("ditolak"))
    return "Screaning";

  return "Screaning";
}

function extractCvBase64(fileUrl) {
  if (!fileUrl) return null;

  if (fileUrl.startsWith("data:")) {
    const commaIdx = fileUrl.indexOf(",");
    if (commaIdx === -1) return null;
    return fileUrl.slice(commaIdx + 1);
  }

  // Fallback: pola lama (path disk)
  const fileName = path.basename(fileUrl);
  const filePath = path.join(UPLOAD_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const buffer = fs.readFileSync(filePath);
  return buffer.toString("base64");
}

function guessMimeFromName(name) {
  if (!name) return "application/pdf";
  const ext = path.extname(name).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  return "application/octet-stream";
}

// ── Upsert arsip (inline — sebelumnya dari archivesRepo) ────────────────────
async function upsertArchiveFromApplication(lamaranId) {
  const lamaran = await prisma.lamaran.findUnique({
    where: { id: lamaranId },
    include: {
      pengguna: true,
      lowongan: true,
    },
  });

  if (!lamaran) return null;

  return prisma.arsip.upsert({
    where: { lamaran_id: lamaranId },
    create: {
      lamaran_id: lamaranId,
      pengguna_id: lamaran.pengguna_id,
      lowongan_id: lamaran.lowongan_id,
      nama_pelamar: lamaran.pengguna?.nama || "",
      email_pelamar: lamaran.pengguna?.email || "",
      posisi: lamaran.lowongan?.judul || "",
      status_akhir: lamaran.status,
      updated_at: new Date(),
    },
    update: {
      status_akhir: lamaran.status,
      tanggal_keputusan: new Date(),
      updated_at: new Date(),
    },
  });
}

// ── Module exports ──────────────────────────────────────────────────────────

module.exports = {
  // =====================================================
  // APPLY JOB
  // =====================================================
  async applyJob(userId, jobId, role) {
    const existing = await repo.findByUserAndJob(userId, jobId);

    if (existing) {
      const err = new Error("Anda sudah melamar lowongan ini");
      err.code = "ACTIVE_APPLICATION_EXISTS";
      throw err;
    }

    const isAdmin = isAdminRole(role);

    if (!isAdmin) {
      const readiness = await this.checkProfileReadiness(userId, role);

      if (!readiness.ready) {
        const missingLabels = readiness.missing
          .map((key) => SECTION_LABELS[key] || key)
          .join(", ");

        const err = new Error(
          `Profil belum lengkap. Silakan lengkapi: ${missingLabels} pada halaman Profil terlebih dahulu.`,
        );
        err.code = "PROFILE_INCOMPLETE";
        throw err;
      }
    }

    // ✅ Ambil dokumen dari tabel dokumen_pengguna
    const profileDocs = await prisma.dokumen_pengguna.findUnique({
      where: { pengguna_id: Number(userId) },
    });

    const cvBase64 = extractCvBase64(profileDocs?.url_cv);

    if (!cvBase64 && !isAdmin) {
      const err = new Error(
        "File CV pada profil tidak ditemukan. Silakan unggah ulang CV di halaman Profil.",
      );
      err.code = "PROFILE_INCOMPLETE";
      throw err;
    }

    let portfolioBase64 = null;
    let portfolioName = null;
    let portfolioMime = null;
    let portfolioSize = null;

    if (profileDocs?.url_portofolio && profileDocs?.nama_portofolio) {
      portfolioBase64 = extractCvBase64(profileDocs.url_portofolio);
      if (portfolioBase64) {
        portfolioName = profileDocs.nama_portofolio;
        portfolioMime = guessMimeFromName(profileDocs.nama_portofolio);
        portfolioSize = Buffer.byteLength(portfolioBase64, "base64");
      }
    }

    // ✅ Create lamaran — field names sesuai skema (snake_case)
    // data_cv, mime_cv, nama_cv, ukuran_cv bersifat NOT NULL di skema,
    // jadi untuk admin tanpa CV kita isi default.
    const created = await repo.create({
      pengguna_id: Number(userId),
      lowongan_id: Number(jobId),

      data_cv: cvBase64 || "",
      mime_cv: cvBase64
        ? guessMimeFromName(profileDocs?.nama_cv)
        : "application/pdf",
      nama_cv: profileDocs?.nama_cv || "cv.pdf",
      ukuran_cv: cvBase64 ? Buffer.byteLength(cvBase64, "base64") : 0,

      data_portofolio: portfolioBase64,
      mime_portofolio: portfolioMime,
      nama_portofolio: portfolioName,
      ukuran_portofolio: portfolioSize,

      status: "Screaning",
      tahap: "Screaning",
    });

    // ✅ Notifikasi ke semua admin — pelamar baru masuk.
    // Dibungkus try/catch + non-blocking supaya kalau gagal,
    // TIDAK menggagalkan proses melamar yang sudah berhasil tersimpan.
    // ⚠️ FIX: variabel direname ke `nama`/`judul` (sesuai kolom Prisma
    // pengguna.nama & lowongan.judul), bukan lagi applicantName/jobTitle.
    if (notificationsService && NOTIFICATION_TYPES.NEW_APPLICANT) {
      Promise.all([
        prisma.lowongan.findUnique({
          where: { id: Number(jobId) },
          select: { judul: true },
        }),
        prisma.pengguna.findUnique({
          where: { id: Number(userId) },
          select: { nama: true },
        }),
      ])
        .then(([lowongan, pengguna]) => {
          const nama = pengguna?.nama || "Kandidat";
          const judul = lowongan?.judul || "posisi ini";
          return notificationsService.notifyAllAdmins({
            type: NOTIFICATION_TYPES.NEW_APPLICANT,
            title: `${nama} melamar untuk ${judul}`,
            message: `Kandidat baru mengajukan lamaran untuk posisi ${judul}.`,
            actionUrl: "applicants",
            metadata: { applicationId: created.id },
          });
        })
        .catch((err) =>
          console.error(
            "❌ Gagal membuat notifikasi pelamar baru:",
            err.message,
          ),
        );
    }

    return created;
  },

  // =====================================================
  // CEK KELENGKAPAN PROFIL
  // =====================================================
  async checkProfileReadiness(userId, role) {
    if (isAdminRole(role)) {
      return {
        ready: true,
        sections: {
          cv: true,
          dataPribadi: true,
          tentangSaya: true,
          pengalamanKerja: true,
          pendidikan: true,
          skills: true,
        },
        missing: [],
        optional: {
          pengalamanOrganisasi: true,
          sertifikat: true,
          portfolio: true,
        },
        hasCv: true,
        hasPortfolio: true,
        cvName: null,
      };
    }

    // ✅ Ambil dokumen_pengguna + profil lengkap dalam parallel
    const [profileDocs, fullProfile] = await Promise.all([
      prisma.dokumen_pengguna.findUnique({
        where: { pengguna_id: Number(userId) },
      }),
      prisma.pengguna.findUnique({
        where: { id: Number(userId) },
        include: {
          profil: true,
          pengalaman_kerja: true,
          pendidikan: true,
          keahlian_pengguna: true,
          organisasi: true,
          sertifikat: true,
        },
      }),
    ]);

    const profile = fullProfile?.profil || {};

    const nama = fullProfile?.nama;

    const hasCv = Boolean(profileDocs?.url_cv);

    // ✅ Field profil sesuai skema: nik, jenis_kelamin, nomor_hp,
    //    tempat_lahir, tanggal_lahir, alamat
    const dataPribadiComplete =
      isFilled(nama) &&
      REQUIRED_PROFILE_FIELDS.every((field) => isFilled(profile[field]));

    // ✅ Field "tentang" (bukan "about")
    const tentangSayaComplete = isFilled(profile.tentang);

    const pengalamanKerjaComplete =
      (fullProfile?.pengalaman_kerja?.length || 0) > 0;

    const pendidikanComplete = (fullProfile?.pendidikan?.length || 0) > 0;

    const skillsComplete = (fullProfile?.keahlian_pengguna?.length || 0) > 0;

    const sections = {
      cv: hasCv,
      dataPribadi: dataPribadiComplete,
      tentangSaya: tentangSayaComplete,
      pengalamanKerja: pengalamanKerjaComplete,
      pendidikan: pendidikanComplete,
      skills: skillsComplete,
    };

    const missing = Object.entries(sections)
      .filter(([, complete]) => !complete)
      .map(([key]) => key);

    return {
      ready: missing.length === 0,
      sections,
      missing,
      optional: {
        pengalamanOrganisasi: (fullProfile?.organisasi?.length || 0) > 0,
        sertifikat: (fullProfile?.sertifikat?.length || 0) > 0,
        portfolio: Boolean(profileDocs?.url_portofolio),
      },
      hasCv,
      hasPortfolio: Boolean(profileDocs?.url_portofolio),
      cvName: profileDocs?.nama_cv || null,
    };
  },

  // =====================================================
  // GET ALL APPLICATIONS (ADMIN)
  // =====================================================
  async getAllApplications() {
    return repo.findAll();
  },

  // =====================================================
  // GET MY APPLICATIONS (USER)
  // =====================================================
  async getMyApplications(userId) {
    return repo.findManyByUserId(userId);
  },

  // =====================================================
  // CHECK USER APPLICATION
  // =====================================================
  async checkUserApplication(userId, jobId) {
    return repo.findByUserAndJob(userId, jobId);
  },

  // =====================================================
  // GET MY TIMELINE APPLICATION
  // =====================================================
  async getMyTimelineApplication(userId) {
    const active = await repo.findActiveByUserId(userId);
    if (active) return active;

    const latest = await repo.findLatestByUserId(userId);
    return latest || null;
  },

  // =====================================================
  // UPDATE APPLICATION STATUS
  // =====================================================
  async updateApplicationStatus(id, status) {
    const rawStatus = normalizeText(status);
    const low = rawStatus.toLowerCase();

    const current = await repo.findById(id);
    if (!current) throw new Error("Application tidak ditemukan");

    // ✅ Rejected -> Ditolak
    if (
      low === "rejected" ||
      low.includes("reject") ||
      low.includes("ditolak")
    ) {
      const lastStage = current.tahap || "Screaning";
      const rejectedStatus = `rejected-at-${toKebab(lastStage)}`;

      const updated = await repo.updateStatusAndTahap(
        id,
        rejectedStatus,
        lastStage,
      );

      // ✅ Upsert arsip dibungkus try/catch — kalau gagal, JANGAN
      //    menggagalkan update status.
      try {
        await upsertArchiveFromApplication(Number(id));
      } catch (e) {
        console.error(
          `Gagal upsert arsip untuk lamaran ${id} (status: rejected):`,
          e?.message || e,
        );
      }
      return updated;
    }

    // ✅ Accepted -> Diterima
    if (
      low === "accepted" ||
      low.includes("accept") ||
      low.includes("hired") ||
      low.includes("diterima")
    ) {
      const finalStage = "Final Result";
      const updated = await repo.updateStatusAndTahap(
        id,
        "Diterima",
        finalStage,
      );

      try {
        await upsertArchiveFromApplication(Number(id));
      } catch (e) {
        console.error(
          `Gagal upsert arsip untuk lamaran ${id} (status: accepted):`,
          e?.message || e,
        );
      }
      return updated;
    }

    const stage = mapStatusToStage(rawStatus);
    return repo.updateStatusAndTahap(id, rawStatus, stage);
  },

  // =====================================================
  // UPDATE APPLICATION SCORE
  // =====================================================
  async updateApplicationScore(id, score) {
    const numericId = Number(id);
    if (!numericId || Number.isNaN(numericId)) {
      throw new Error(`applicationId tidak valid: ${id}`);
    }

    const current = await repo.findById(numericId);
    if (!current) {
      throw new Error(
        `Application dengan id ${numericId} tidak ditemukan — score gagal disinkronkan`,
      );
    }

    const updated = await repo.updateSkor(numericId, score);

    const expected =
      score === null || score === undefined ? null : Number(score);
    if (updated.skor !== expected) {
      throw new Error(
        `Update score untuk application ${numericId} tidak sesuai ` +
          `(diharapkan ${expected}, tersimpan ${updated.skor})`,
      );
    }

    return updated;
  },

  // =====================================================
  // GET APPLICATION FILE BY ID
  // =====================================================
  async getApplicationFileById(id) {
    return repo.findFileById(id);
  },
};
