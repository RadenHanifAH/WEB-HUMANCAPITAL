export const API_URL_APPLICANTS = "http://localhost:4000/api/applications";
export const API_URL_JOBS = "http://localhost:4000/api/jobs";

export const statusOptions = [
  { value: "", label: "Status" },
  { value: "under-review", label: "Under Review" },
  { value: "interview-hc", label: "Interview HC" },
  { value: "psikotes", label: "Psikotes" },
  { value: "final-interview", label: "Final Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export const stageFlow = [
  { status: "under-review", stage: "Under Review" },
  { status: "interview-hc", stage: "Interview HC" },
  { status: "psikotes", stage: "Psikotes" },
  { status: "final-interview", stage: "Final Interview" },
];

export const blockedScoreStages = ["under-review", "interview-hc"];