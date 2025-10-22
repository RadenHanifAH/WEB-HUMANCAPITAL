// app/backend/src/app.js
const express = require('express');
const cors = require('cors');

// Import semua routes
const dashboardRoutes = require('./routes/dashboard.routes'); // Dashboard
const jobsRoutes = require('./routes/jobs.routes');           // Lowongan kerja
const applicantsRoutes = require('./routes/applicants.routes'); // Pelamar kerja

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Global Routing =====
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applicants', applicantsRoutes); 
// Endpoint Pelamar: http://localhost:4000/api/applicants

// ===== Default Route =====
app.get('/', (req, res) => {
  res.status(200).send('✅ HR Backend Service Running. Akses /api/dashboard, /api/jobs, atau /api/applicants');
});

// ===== Export App =====
module.exports = app;
