const schedulesService = require("./schedules.service");

class SchedulesController {
  applicants = async (req, res) => {
    try {
      const { q = "" } = req.query;
      const items = await schedulesService.listApplicants({ q });
      res.status(200).json({ items });
    } catch (e) {
      res.status(500).json({ message: "Gagal memuat kandidat", error: e.message });
    }
  };

  applicantsByStage = async (req, res) => {
    try {
      const { type } = req.query;
      if (!type) return res.status(400).json({ message: "type wajib diisi" });
      const items = await schedulesService.listApplicantsByStage({ type });
      res.status(200).json({ items });
    } catch (e) {
      res.status(500).json({ message: "Gagal memuat kandidat", error: e.message });
    }
  };

  list = async (req, res) => {
    try {
      const { date = "", type = "all", page = 1, pageSize = 10 } = req.query;
      const data = await schedulesService.listSchedules({
        date, type, page: Number(page), pageSize: Number(pageSize),
      });
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ message: "Gagal memuat jadwal", error: e.message });
    }
  };

  getById = async (req, res) => {
    try {
      const data = await schedulesService.getScheduleById(req.params.id);
      res.status(200).json(data);
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  };

  create = async (req, res) => {
    try {
      const result = await schedulesService.createSchedule(req.body);
      res.status(201).json({ message: "Jadwal dibuat", data: result });
    } catch (e) {
      res.status(400).json({ message: "Gagal membuat jadwal", error: e.message });
    }
  };

  bulkCreate = async (req, res) => {
    try {
      const result = await schedulesService.bulkCreateSchedule(req.body);
      res.status(201).json({ message: "Jadwal berhasil dibuat", ...result });
    } catch (e) {
      res.status(400).json({ message: "Gagal membuat jadwal", error: e.message });
    }
  };

  complete = async (req, res) => {
    try {
      const result = await schedulesService.completeSchedule(req.params.id);
      res.status(200).json({ message: "Jadwal dikonfirmasi selesai", data: result });
    } catch (e) {
      res.status(400).json({ message: "Gagal konfirmasi jadwal", error: e.message });
    }
  };

  confirmApplicant = async (req, res) => {
    try {
      const { attendanceStatus, absentReason } = req.body;
      const data = await schedulesService.confirmAttendance(req.params.id, {
        attendanceStatus, absentReason,
      });
      res.status(200).json({ message: "Konfirmasi kehadiran berhasil", data });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  };

  markNoShow = async (req, res) => {
    try {
      const { reason } = req.body;
      const data = await schedulesService.markNoShowByHR(req.params.id, { reason });
      res.status(200).json({
        message: "Kandidat ditandai tidak hadir, lamaran otomatis ditolak",
        data,
      });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  };

  markExpired = async (req, res) => {
    try {
      const data = await schedulesService.markExpiredAsAbsent(req.params.id);
      res.status(200).json({ message: "Jadwal ditandai tidak hadir (kedaluwarsa)", data });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  };

  // Endpoint baru untuk menolak lamaran
  reject = async (req, res) => {
    try {
      const result = await schedulesService.rejectSchedule(req.params.id);
      res.status(200).json({ message: "Lamaran berhasil ditolak", data: result });
    } catch (e) {
      res.status(400).json({ message: "Gagal menolak lamaran", error: e.message });
    }
  };

  delete = async (req, res) => {
    try {
      await schedulesService.deleteSchedule(req.params.id);
      res.status(200).json({ message: "Jadwal dihapus" });
    } catch (e) {
      res.status(400).json({ message: "Gagal hapus jadwal", error: e.message });
    }
  };
}

module.exports = new SchedulesController();