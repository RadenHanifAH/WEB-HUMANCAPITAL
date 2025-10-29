// app/backend/src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser")

dotenv.config()

// Import semua routes
const authRoutes = require("./modules/auth/auth.routes")
const jobsRoutes = require('./modules/jobs/job.routes');           // Lowongan kerja
// const applicantsRoutes = require('./routes/applicants.routes'); // Pelamar kerja
// const reportsRoutes = require("./routes/reports.routes");

const app = express();

// ===== Middleware =====
app.use(
  cors({
    origin: "http://localhost:5173", // asal frontend kamu
    credentials: true, // ⬅ wajib biar cookie bisa dikirim
  })
);
app.use(express.json({ limit : "10mb"}));
app.use(cookieParser())

// ===== Global Routing =====
app.use("/api/auth", authRoutes)
// app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobsRoutes);
// app.use('/api/applicants', applicantsRoutes); 
// app.use("/api/reports", reportsRoutes);
// Endpoint Pelamar: http://localhost:4000/api/applicants

// ===== Default Route =====
app.get('/', (req, res) => {
  res.status(200).send('✅ HR Backend Service Running. Akses /api/dashboard, /api/jobs, /api/applicants, atau /api/reports');
});

// ===== Export App =====
module.exports = app;
