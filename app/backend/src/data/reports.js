// --- DUMMY DATA UNTUK REPORTS DASHBOARD ---

// Statistik utama
export const metricsDummy = {
  totalApplications: 1234,
  conversionRate: 23.5,
  avgProcessTime: 14,
  accepted: 89,
  pipeline: {
    review: 156,
    interview: 89,
    psikotes: 34,
    final: 12,
  },
  topPositions: [
    { position: "Frontend Developer", count: 234, percentage: 85 },
    { position: "Backend Developer", count: 189, percentage: 70 },
    { position: "UI/UX Designer", count: 156, percentage: 60 },
    { position: "Product Manager", count: 98, percentage: 40 },
    { position: "Data Analyst", count: 67, percentage: 25 },
    { position: "Cloud Engineer", count: 55, percentage: 20 },
    { position: "Mobile Developer", count: 42, percentage: 15 },
  ],
};

// --- TREND LAMARAN (BERDASARKAN PERIODE) ---
export const trendDummy = {
  daily: {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    applications: [15, 20, 18, 30, 25, 10, 5],
  },
  weekly: {
    labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
    applications: [120, 150, 100, 180],
  },
  monthly: {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ],
    applications: [50, 75, 60, 90, 80, 110, 100, 95, 85, 70, 65, 55],
  },
  yearly: {
    labels: ["2025", "2026", "2027"],
    applications: [1500, 1650, 1800],
  },
};

// --- LAMARAN BERDASARKAN POSISI (PIE / DOUGHNUT) ---
export const positionDummy = {
  daily: {
    labels: ["Frontend", "Backend", "UI/UX", "Product"],
    applications: [20, 15, 10, 5],
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
  },
  weekly: {
    labels: ["Frontend", "Backend", "UI/UX", "Product"],
    applications: [100, 80, 60, 40],
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
  },
  monthly: {
    labels: ["Frontend", "Backend", "UI/UX", "Product"],
    applications: [234, 189, 156, 98],
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
  },
  yearly: {
    labels: ["Frontend", "Backend", "UI/UX", "Product"],
    applications: [500, 400, 300, 200],
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
  },
};

// --- HASIL AKHIR (DITERIMA VS DITOLAK) ---
export const acceptanceDummy = {
  daily: {
    labels: ["Diterima", "Ditolak"],
    applications: [10, 5],
    colors: ["rgba(16, 185, 129, 0.8)", "rgba(239, 68, 68, 0.8)"],
  },
  weekly: {
    labels: ["Diterima", "Ditolak"],
    applications: [30, 15],
    colors: ["rgba(16, 185, 129, 0.8)", "rgba(239, 68, 68, 0.8)"],
  },
  monthly: {
    labels: ["Diterima", "Ditolak"],
    applications: [89, 43],
    colors: ["rgba(16, 185, 129, 0.8)", "rgba(239, 68, 68, 0.8)"],
  },
  yearly: {
    labels: ["2025", "2026", "2027"],
    applications: [150, 165, 180],
    colors: [
      "rgba(59, 130, 246, 0.8)",
      "rgba(59, 130, 246, 0.8)",
      "rgba(59, 130, 246, 0.8)",
    ],
  },
};
