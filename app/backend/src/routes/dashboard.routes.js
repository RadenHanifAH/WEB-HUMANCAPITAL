const express = require('express');
const router = express.Router();
const dashboardData = require('../data/dashboard');

// Endpoint: GET DATA DASHBOARD LENGKAP
router.get('/data', (req, res) => {
    const positions = dashboardData.positions; // ✅ Ambil dari file data

    const activePositions = positions.filter(p => p.status === 'open').length;
    const totalPositions = positions.length;

    res.status(200).json({
        lowongan: positions,
        activePositionsCount: activePositions,
        totalPositionsCount: totalPositions,
        stats: {
            totalApplications: dashboardData.totalApplications,
            applicationsToday: dashboardData.applicationsToday,
            acceptedThisMonth: dashboardData.acceptedThisMonth,
        },
        latestApplications: dashboardData.latestApplications,
        pipeline: dashboardData.pipeline,
    });
});

module.exports = router;
