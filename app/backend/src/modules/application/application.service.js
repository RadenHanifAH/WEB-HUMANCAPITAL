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

  if (slug === "interview-hc" || slug === "interviewhc") return "Interview HC";

  if (
    slug === "psikotes" ||
    slug === "psychotest" ||
    slug === "psycho-test" ||
    slug.includes("technical")
  )
    return "Psikotes/technical test";

  if (slug === "final-interview" || slug === "finalinterview")
    return "Final Interview";

  if (slug.includes("offering")) return "Offering/Final Result";

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

  if (low === "interview hc" || low === "interview-hc" || low === "interviewhc")
    return "Interview HC";

  if (
    low === "psikotes" ||
    low === "psychotest" ||
    low === "psycho test" ||
    low.includes("technical")
  )
    return "Psikotes/technical test";

  if (low === "final interview" || low === "final-interview" || low === "finalinterview")
    return "Final Interview";

  if (low.includes("offering")) return "Offering/Final Result";

  if (low === "accepted" || low.includes("accept") || low.includes("hired"))
    return "Offering/Final Result";

  if (low === "rejected" || low.includes("reject")) return "Screaning";

  return "Screaning";
}

module.exports = {
  /**
   * ✅ apply job: BLOCK kalau masih ada lamaran aktif (belum final)
   * ✅ simpan file CV/portfolio ke DB (Base64)
   */
  async applyJob(userId, jobId, cvPayload, portfolioPayload) {
    const active = await repo.findActiveByUserId(userId);

    if (active && !isFinalStatus(active.status)) {
      const err = new Error(
        "Anda masih memiliki lamaran yang sedang diproses. Anda hanya bisa melamar lagi setelah lamaran sebelumnya ditolak atau diterima."
      );
      err.code = "ACTIVE_APPLICATION_EXISTS";
      err.active = active;
      throw err;
    }

    // ✅ CV wajib
    if (!cvPayload?.data) {
      const err = new Error("CV wajib diupload (PDF)");
      err.code = "CV_REQUIRED";
      throw err;
    }

    // Buffer -> base64
    const cvBase64 = Buffer.isBuffer(cvPayload.data)
      ? cvPayload.data.toString("base64")
      : null;

    const portfolioBase64 =
      portfolioPayload?.data && Buffer.isBuffer(portfolioPayload.data)
        ? portfolioPayload.data.toString("base64")
        : null;

    return repo.create({
      userId: Number(userId),
      jobId: Number(jobId),

      cvData: cvBase64,
      cvName: cvPayload?.name || null,
      cvMime: cvPayload?.mime || "application/pdf",
      cvSize: cvPayload?.size || null,

      portfolioData: portfolioBase64,
      portfolioName: portfolioPayload?.name || null,
      portfolioMime: portfolioPayload?.mime || null,
      portfolioSize: portfolioPayload?.size || null,

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

  async getMyTimelineApplication(userId) {
    const active = await repo.findActiveByUserId(userId);
    if (active) return active;

    const latest = await repo.findLatestByUserId(userId);
    return latest || null;
  },

  async updateApplicationStatus(id, status) {
    const rawStatus = normalizeText(status);
    const low = rawStatus.toLowerCase();

    const current = await repo.findById(id);
    if (!current) throw new Error("Application tidak ditemukan");

    if (low === "rejected" || low.includes("reject")) {
      const lastStage = current.stage || "Screaning";
      const rejectedStatus = `rejected-at-${toKebab(lastStage)}`;

      const updated = await repo.updateStatusAndStage(id, rejectedStatus, lastStage);

      if (archivesRepo?.upsertArchiveFromApplication) {
        await archivesRepo.upsertArchiveFromApplication(Number(id));
      }
      return updated;
    }

    if (low === "accepted" || low.includes("accept") || low.includes("hired")) {
      const finalStage = "Offering/Final Result";
      const updated = await repo.updateStatusAndStage(id, "Accepted", finalStage);

      if (archivesRepo?.upsertArchiveFromApplication) {
        await archivesRepo.upsertArchiveFromApplication(Number(id));
      }
      return updated;
    }

    const stage = mapStatusToStage(rawStatus);
    return repo.updateStatusAndStage(id, rawStatus, stage);
  },

  async updateApplicationScore(id, score) {
    return repo.updateScore(id, score);
  },

  // ✅ untuk download file admin
  async getApplicationFileById(id) {
    return repo.findFileById(id);
  },
};
