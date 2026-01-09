const repo = require("./application.repository");

// Timeline steps yang valid (harus sama persis dengan HiringTimeline)
const VALID_STAGES = [
  "Under Review",
  "Interview HC",
  "Psikotes",
  "Final Interview",
  "Offering/Final Result",
];

// Mapping untuk status yang bentuknya slug/bervariasi
function mapStatusToStage(statusRaw) {
  const s = String(statusRaw || "").trim();

  // kalau sudah sama persis dengan stage valid
  if (VALID_STAGES.includes(s)) return s;

  // normalisasi lowercase untuk mapping
  const low = s.toLowerCase();

  // status bentuk slug / variasi umum
  if (low === "under-review" || low === "under review" || low === "under_review")
    return "Under Review";

  if (low === "interview hc" || low === "interview-hc" || low === "interviewhc")
    return "Interview HC";

  if (low === "psikotes" || low === "psycho test" || low === "psychotest")
    return "Psikotes";

  if (low === "final interview" || low === "final-interview" || low === "finalinterview")
    return "Final Interview";

  // accepted / rejected diarahkan ke final stage
  if (low.includes("accept") || low.includes("reject"))
    return "Offering/Final Result";

  // fallback default
  return "Under Review";
}

module.exports = {
  async applyJob(userId, jobId, cvUrl, portfolioUrl) {
    return repo.create({
      userId: Number(userId),
      jobId: Number(jobId),
      cvUrl,
      portfolioUrl,
      status: "under-review",
      stage: "Under Review",
    });
  },

  async getAllApplications() {
    return repo.findAll();
  },

  async getMyTimelineApplication(userId) {
    const active = await repo.findActiveByUserId(userId);
    if (active) return active;
    return repo.findLatestByUserId(userId);
  },

  // ✅ ADMIN UPDATE: stage selalu mengikuti status
  async updateApplicationStatus(id, status) {
    const stage = mapStatusToStage(status);

    // 🔥 ini yang kamu minta:
    // status = apapun yang admin pilih
    // stage = hasil mapping dari status
    return repo.updateStatusAndStage(id, status, stage);
  },

  async updateApplicationScore(id, score) {
    return repo.updateScore(id, score);
  },
};
