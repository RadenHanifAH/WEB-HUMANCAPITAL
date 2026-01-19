// ✅ endpoint saja (tanpa localhost) karena axiosInstance sudah punya baseURL

export const API_APPLICANTS = "/applications";
export const API_JOBS = "/jobs";

export const statusOptions = [
  { value: "", label: "Status" },
  { value: "screaning", label: "Screaning" },
  { value: "interview-hc", label: "Interview HC" },
  { value: "psikotes", label: "Psikotes/Technical Test" },
  { value: "final-interview", label: "Final Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export const stageFlow = [
  { stage: "Screaning" },
  { stage: "Interview HC" },
  { stage: "Psikotes/Technical Test" },
  { stage: "Final Interview" },
];

// ✅ tahap yang tidak boleh isi score
export const blockedScoreStages = ["screaning", "interview-hc"];
