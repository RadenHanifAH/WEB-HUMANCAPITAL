// routes/reports.routes.js
const express = require("express");
const { reports, getNextReportId } = require("../data/reports");

const router = express.Router();

/**
 * GET /api/reports
 * Mendapatkan semua laporan, dengan opsi filter
 * Query params:
 *  - period (misal: "Oktober 2025")
 *  - from / to (filter tanggal)
 */
router.get("/", (req, res) => {
  const { period, from, to } = req.query;
  let result = [...reports];

  if (period) {
    result = result.filter((r) =>
      r.period.toLowerCase().includes(period.toLowerCase())
    );
  }

  if (from && to) {
    result = result.filter(
      (r) =>
        new Date(r.createdAt) >= new Date(from) &&
        new Date(r.createdAt) <= new Date(to)
    );
  }

  res.json(result);
});

/**
 * GET /api/reports/:id
 * Mendapatkan detail laporan berdasarkan ID
 */
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const report = reports.find((r) => r.id === id);

  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json(report);
});

/**
 * POST /api/reports
 * Membuat laporan baru
 */
router.post("/", (req, res) => {
  const {
    title,
    period,
    totalApplicants,
    accepted,
    rejected,
    pending,
    topPositions,
  } = req.body;

  if (!title || !period)
    return res.status(400).json({ message: "Title and period are required" });

  const newReport = {
    id: getNextReportId(),
    title,
    period,
    totalApplicants: totalApplicants || 0,
    accepted: accepted || 0,
    rejected: rejected || 0,
    pending: pending || 0,
    topPositions: topPositions || [],
    createdAt: new Date().toISOString().split("T")[0],
  };

  reports.push(newReport);
  res.status(201).json(newReport);
});

/**
 * PUT /api/reports/:id
 * Mengedit laporan
 */
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const report = reports.find((r) => r.id === id);

  if (!report) return res.status(404).json({ message: "Report not found" });

  const {
    title,
    period,
    totalApplicants,
    accepted,
    rejected,
    pending,
    topPositions,
  } = req.body;

  report.title = title || report.title;
  report.period = period || report.period;
  report.totalApplicants = totalApplicants ?? report.totalApplicants;
  report.accepted = accepted ?? report.accepted;
  report.rejected = rejected ?? report.rejected;
  report.pending = pending ?? report.pending;
  report.topPositions = topPositions || report.topPositions;

  res.json(report);
});

/**
 * DELETE /api/reports/:id
 * Menghapus laporan berdasarkan ID
 */
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = reports.findIndex((r) => r.id === id);

  if (index === -1)
    return res.status(404).json({ message: "Report not found" });

  reports.splice(index, 1);
  res.json({ message: "Report deleted successfully" });
});

module.exports = router;
