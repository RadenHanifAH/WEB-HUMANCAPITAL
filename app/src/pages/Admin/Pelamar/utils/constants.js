export const API_URL_APPLICANTS = "web-humancapital.railway.internal/api/applications";
export const API_URL_JOBS = "web-humancapital.railway.internal/api/jobs";

export const statusOptions = [
  { value: "", label: "Status" },
  { value: "screaning", label: "Screaning" },
  { value: "interview-hc", label: "Interview HC" },
  { value: "psikotes", label: "Psikotes/Technical Test" }, // ✅ label baru
  { value: "final-interview", label: "Final Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export const stageFlow = [
  { stage: "Screaning" },
  { stage: "Interview HC" },
  { stage: "Psikotes/Technical Test" }, // ✅ stage baru di UI
  { stage: "Final Interview" },
];

// ✅ tahap yang tidak boleh isi score
export const blockedScoreStages = ["screaning", "interview-hc"];
