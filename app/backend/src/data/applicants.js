// app/backend/src/data/applicants.js

// Data dummy untuk pelamar
let applicants = [
  {
    id: 1,
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    avatar: "https://i.pravatar.cc/100?img=3",
    position: "Frontend Developer",
    location: "Jakarta",
    experience: "3 Tahun",
    status: "under-review",
    stage: "Under Review",
    score: 80,
    appliedDate: "2025-10-20",
  },
  {
    id: 3,
    name: "Siti",
    email: "siti.rahmawati@example.com",
    avatar: "https://i.pravatar.cc/100?img=5",
    position: "UI/UX Designer",
    location: "Bandung",
    experience: "2 Tahun",
    status: "accepted",
    stage: "Accepted",
    score: 90,
    appliedDate: "2025-10-19",
  },
];

// Helper: auto-increment ID
const getNextId = () => {
  return applicants.length > 0 ? Math.max(...applicants.map((a) => a.id)) + 1 : 1;
};

// ✅ Gunakan CommonJS export (sesuai require di controller)
module.exports = {
  applicants,
  getNextId,
};
