// app/backend/src/app.js
const express = require('express');
const cors = require('cors');
const dashboardRoutes = require('./routes/dashboard.routes'); // Asumsi ini sudah ada
const jobsRoutes = require('./routes/jobs.routes'); // Import router Lowongan Baru
const pelamarRoutes = require('./routes/pelamar.routes'); 


const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Global Routing
app.use('/api/dashboard', dashboardRoutes); 
app.use('/api/jobs', jobsRoutes); // Endpoint Lowongan Kerja: http://localhost:4000/api/jobs
app.use('/api/pelamar', pelamarRoutes); // <--- Tambahkan ini


// Default Route
app.get('/', (req, res) => {
    res.status(200).send('HR Backend Service Running. Akses /api/dashboard/data atau /api/jobs.');
});

module.exports = app;