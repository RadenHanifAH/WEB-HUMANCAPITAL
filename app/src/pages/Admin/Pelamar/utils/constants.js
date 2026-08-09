export const API_APPLICANTS = "/applications";
export const API_JOBS = "/jobs";

export const statusOptions = [
  { value: "", label: "Status" },
  { value: "screaning", label: "Screaning" },
  { value: "interview-pertama", label: "Interview Pertama" },
  { value: "psikotes", label: "Psikotes" },
  { value: "interview-kedua", label: "Interview Kedua" },
  { value: "accepted", label: "Diterima" },
  { value: "rejected", label: "Ditolak" },
];

export const stageFlow = [
  { stage: "Screaning" },
  { stage: "Interview Pertama" },
  { stage: "Psikotes" },
  { stage: "Interview Kedua" },
];

// ✅ tahap yang tidak boleh isi score
export const blockedScoreStages = ["screaning", "interview-pertama"];