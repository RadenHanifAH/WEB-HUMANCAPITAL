import express from 'express';
import reportsController from './reports.controller.js';

const router = express.Router();

// Endpoint: /api/reports/metrics
router.get('/metrics', reportsController.getRecruitmentMetrics);

// Endpoint: /api/reports/charts?period=daily
router.get('/charts', reportsController.getChartData);

export default router;