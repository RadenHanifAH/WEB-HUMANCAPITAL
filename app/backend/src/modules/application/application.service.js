const repo = require("./application.repository");
const archivesRepo = require("../archives/archives.repository");

// Timeline steps (harus sama seperti di UI kamu)
const VALID_STAGES = [
  "Screaning",
  "Interview HC",
  "Psikotes/technical test",
  "Final Interview",
  "Offering/Final Result",
];

function normalizeText(val) {
  return String(val || "").trim();
}

function toKebab(val) {
  return normalizeText(val).toLowerCase().replace(/\s+/g, "-");
}

/**
 * ✅ Deteksi status final (diterima/ditolak/hired)
 */
function isFinalStatus(status = "") {
  const s = normalizeText(status).toLowerCase();
  return (
    s === "accepted" ||
    s === "rejected" ||
    s.includes("accept") ||
    s.includes("reject") ||
    s.includes("hired")
  );
}

/**
 * ✅ Ambil stage dari status "rejected-at-<stage>"
 * contoh: rejected-at-final-interview -> "Final Interview"
 */
function stageFromRejectedAt(statusRaw = "") {
  const s = normalizeText(statusRaw).toLowerCase();
  if (!s.startsWith("rejected-at-")) return null;

  const slug = s.replace("rejected-at-", "").trim();

  // mapping slug -> stage
  if (slug === "screaning" || slug === "screening" || slug === "under-review" || slug === "under_review")
    return "Screaning";

  if (slug === "interview-hc" || slug === "interviewhc" || slug === "interview-hc-")
    return "Interview HC";

  if (slug === "psikotes" || slug === "psychotest" || slug === "psycho-test" || slug.includes("technical"))
    return "Psikotes/technical test";

  if (slug === "final-interview" || slug === "finalinterview")
    return "Final Interview";

  if (slug.includes("offering")) return "Offering/Final Result";

  // fallback aman
  return "Screaning";
}

/**
 * ✅ mapping status normal -> stage
 * (kamu bebas tambah variasi status di sini)
 */
function mapStatusToStage(statusRaw = "") {
  const raw = normalizeText(statusRaw);
  const low = raw.toLowerCase();

  // kalau status berformat rejected-at-xxx
  const rejectedAtStage = stageFromRejectedAt(raw);
  if (rejectedAtStage) return rejectedAtStage;

  // kalau admin ngirim stage langsung
  if (VALID_STAGES.includes(raw)) return raw;

  // base mapping
  if (
    low === "screaning" ||
    low === "screening" ||
    low === "under-review" ||
    low === "under review" ||
    low === "under_review"
  ) {
    return "Screaning";
  }

  if (low === "interview hc" || low === "interview-hc" || low === "interviewhc") {
    return "Interview HC";
  }

  if (
    low === "psikotes" ||
    low === "psychotest" ||
    low === "psycho test" ||
    low.includes("technical")
  ) {
    return "Psikotes/technical test";
  }

  if (low === "final interview" || low === "final-interview" || low === "finalinterview") {
    return "Final Interview";
  }

  if (low.includes("offering")) {
    return "Offering/Final Result";
  }

  // ✅ Accepted / Rejected selalu masuk final stage (kalau kamu mau beda, ubah di sini)
  if (low === "accepted" || low.includes("accept") || low.includes("hired")) {
    return "Offering/Final Result";
  }

  if (low === "rejected" || low.includes("reject")) {
    // kalau ditolak tanpa format rejected-at-xxx, kita set ke stage terakhir user (biar akurat)
    // tapi default tetap "Screaning"
    return "Screaning";
  }

  // fallback
  return "Screaning";
}

module.exports = {
  /**
   * ✅ apply job: BLOCK kalau masih ada lamaran aktif (belum final)
   */
  async applyJob(userId, jobId, cvUrl, portfolioUrl) {
    const active = await repo.findActiveByUserId(userId);

    if (active && !isFinalStatus(active.status)) {
      const err = new Error(
        "Anda masih memiliki lamaran yang sedang diproses. Anda hanya bisa melamar lagi setelah lamaran sebelumnya ditolak atau diterima."
      );
      err.code = "ACTIVE_APPLICATION_EXISTS";
      err.active = active;
      throw err;
    }

    return repo.create({
      userId: Number(userId),
      jobId: Number(jobId),
      cvUrl,
      portfolioUrl,
      status: "Screaning",
      stage: "Screaning",
    });
  },

  async getAllApplications() {
    return repo.findAll();
  },

  async getMyApplications(userId) {
    return repo.findManyByUserId(userId);
  },

  /**
   * ✅ timeline: kalau ada active pakai itu, kalau tidak ada ambil latest
   */
  async getMyTimelineApplication(userId) {
    const active = await repo.findActiveByUserId(userId);
    if (active) return active;

    const latest = await repo.findLatestByUserId(userId);
    return latest || null;
  },

  /**
   * ✅ ADMIN UPDATE STATUS:
   * - stage selalu ikut status
   * - rejected akan otomatis menjadi "rejected-at-<lastStage>" supaya UI bisa tampil stop di stage terakhir
   * - accepted/hired -> final stage
   * - optional: upsert archive ketika final
   */
  async updateApplicationStatus(id, status) {
    const rawStatus = normalizeText(status);
    const low = rawStatus.toLowerCase();

    const current = await repo.findById(id);
    if (!current) throw new Error("Application tidak ditemukan");

    // ✅ REJECTED: simpan "rejected-at-<lastStage>" dan stage tetap stage terakhir
    if (low === "rejected" || low.includes("reject")) {
      const lastStage = current.stage || "Screaning";
      const rejectedStatus = `rejected-at-${toKebab(lastStage)}`;

      const updated = await repo.updateStatusAndStage(id, rejectedStatus, lastStage);

      // final -> archive
      if (archivesRepo?.upsertArchiveFromApplication) {
        await archivesRepo.upsertArchiveFromApplication(Number(id));
      }

      return updated;
    }

    // ✅ ACCEPTED/Hired: final stage
    if (low === "accepted" || low.includes("accept") || low.includes("hired")) {
      const finalStage = "Offering/Final Result";
      const updated = await repo.updateStatusAndStage(id, "Accepted", finalStage);

      if (archivesRepo?.upsertArchiveFromApplication) {
        await archivesRepo.upsertArchiveFromApplication(Number(id));
      }

      return updated;
    }

    // ✅ selain final: stage mengikuti mapping status
    const stage = mapStatusToStage(rawStatus);

    return repo.updateStatusAndStage(id, rawStatus, stage);
  },

  async updateApplicationScore(id, score) {
    return repo.updateScore(id, score);
  },
};
