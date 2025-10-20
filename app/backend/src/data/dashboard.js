// app/backend/src/data/dashboard.js

// Data Pelamar (Total, Hari Ini, Diterima)
const totalApplications = 0;
const applicationsToday = 0;
const acceptedThisMonth = 0;


const positions = [
    { id: 1, title: "Frontend Developer", department: "IT", status: "open" },
    { id: 2, title: "Backend Developer", department: "IT", status: "closed" },
    { id: 3, title: "UI/UX Designer", department: "Design", status: "open" },
    { id: 4, title: "Product Manager", department: "Product", status: "open" },
];

// Data Lamaran Terbaru
const latestApplications = [
    { id: 1, name: "Ahmad Rizki", position: "Frontend Developer", time: "2 jam lalu", status: "Under Review" },
    { id: 2, name: "Sari Indah", position: "UI/UX Designer", time: "4 jam lalu", status: "Interview HC" },
    { id: 3, name: "Budi Santoso", position: "Backend Developer", time: "6 jam lalu", status: "Under Review" },
    { id: 4, name: "Alda Putri", position: "Product Manager", time: "8 jam lalu", status: "Psikotes" },
];

// Data Pipeline Rekrutmen
const pipeline = [
    { title: "Under Review", icon: "clock", color: "text-orange-500", value: 0, count: 0 },
    { title: "Interview HC", icon: "user-check", color: "text-blue-500", value: 0, count: 0 },
    { title: "Psikotes", icon: "alert-circle", color: "text-purple-500", value: 0, count: 0 },
    { title: "Final Interview", icon: "trending-up", color: "text-green-500", value: 0, count: 0 },
];

module.exports = {
    positions,
    totalApplications,
    applicationsToday,
    acceptedThisMonth,
    latestApplications,
    pipeline,
};