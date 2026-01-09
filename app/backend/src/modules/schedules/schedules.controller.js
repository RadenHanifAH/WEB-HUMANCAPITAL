// backend/src/modules/schedules/schedules.controller.js
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

  list = async (req, res) => {
    try {
      const { date = "", type = "all", page = 1, pageSize = 10 } = req.query;

      const data = await schedulesService.listSchedules({
        date,
        type,
        page: Number(page),
        pageSize: Number(pageSize),
      });

      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ message: "Gagal memuat jadwal", error: e.message });
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

  complete = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await schedulesService.completeSchedule(id);
      res.status(200).json({ message: "Jadwal dikonfirmasi selesai", data: result });
    } catch (e) {
      res.status(400).json({ message: "Gagal konfirmasi jadwal", error: e.message });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      await schedulesService.deleteSchedule(id);
      res.status(200).json({ message: "Jadwal dihapus" });
    } catch (e) {
      res.status(400).json({ message: "Gagal hapus jadwal", error: e.message });
    }
  };
}

module.exports = new SchedulesController();
