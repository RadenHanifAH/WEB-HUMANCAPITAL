const schedulesService = require("./schedules.service");
const { logActivity, getClientIp } = require("../activity-log/activityLog.helper");

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

  mySchedules = async (req, res) => {
    try {
      const items = await schedulesService.listMySchedules(req.user?.id);
      res.status(200).json({ items });
    } catch (e) {
      res.status(500).json({ message: "Gagal memuat jadwal Anda", error: e.message });
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

      logActivity({
        pengguna_id: req.user?.id,
        aksi: "CREATE",
        modul: "wawancara",
        target_id: result?.id || null,
        deskripsi: `Membuat jadwal wawancara baru`,
        data_sebelum: null,
        data_sesudah: result || null,
        ip_address: getClientIp(req),
      });

      res.status(201).json({ message: "Jadwal dibuat", data: result });
    } catch (e) {
      res.status(400).json({ message: "Gagal membuat jadwal", error: e.message });
    }
  };

  bulkCreate = async (req, res) => {
    try {
      const result = await schedulesService.bulkCreateSchedule(req.body);

      logActivity({
        pengguna_id: req.user?.id,
        aksi: "CREATE",
        modul: "wawancara",
        target_id: null,
        deskripsi: `Membuat jadwal wawancara massal`,
        data_sebelum: null,
        data_sesudah: result || null,
        ip_address: getClientIp(req),
      });

      res.status(201).json({ message: "Jadwal berhasil dibuat", ...result });
    } catch (e) {
      res.status(400).json({ message: "Gagal membuat jadwal", error: e.message });
    }
  };

  complete = async (req, res) => {
    try {
      const result = await schedulesService.completeSchedule(req.params.id);

      logActivity({
        pengguna_id: req.user?.id,
        aksi: "UPDATE",
        modul: "wawancara",
        target_id: Number(req.params.id) || req.params.id,
        deskripsi: `Mengonfirmasi jadwal wawancara selesai`,
        data_sebelum: null,
        data_sesudah: result?.data || result || null,
        ip_address: getClientIp(req),
      });

      res.status(200).json({ message: "Jadwal dikonfirmasi selesai", data: result });
    } catch (e) {
      res.status(400).json({ message: "Gagal konfirmasi jadwal", error: e.message });
    }
  };

  // ✅ FIX: sekarang meneruskan `token` dari body request (dikirim oleh
  // halaman konfirmasi publik lewat link email) ke service, sebagai
  // alternatif dari `req.user?.id` yang hanya tersedia kalau memang
  // sedang login.
  confirmApplicant = async (req, res) => {
    try {
      const { attendanceStatus, absentReason, token } = req.body;
      const data = await schedulesService.confirmAttendance(req.params.id, {
        attendanceStatus,
        absentReason,
        token, // bukti kepemilikan dari link email, tidak butuh login
        penggunaId: req.user?.id, // fallback untuk pemakaian dari sesi login (mis. "Lamaran Saya")
      });

      logActivity({
        pengguna_id: req.user?.id,
        aksi: "UPDATE",
        modul: "wawancara",
        target_id: Number(req.params.id) || req.params.id,
        deskripsi: `Konfirmasi kehadiran jadwal wawancara — status: ${attendanceStatus || "-"}`,
        data_sebelum: null,
        data_sesudah: data || null,
        ip_address: getClientIp(req),
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

      logActivity({
        pengguna_id: req.user?.id,
        aksi: "UPDATE",
        modul: "wawancara",
        target_id: Number(req.params.id) || req.params.id,
        deskripsi: `Menandai kandidat tidak hadir pada jadwal${reason ? ` — Alasan: ${reason}` : ""}`,
        data_sebelum: null,
        data_sesudah: data || null,
        ip_address: getClientIp(req),
      });

      res.status(200).json({
        message: "Kandidat ditandai tidak hadir",
        data,
      });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  };

  markExpired = async (req, res) => {
    try {
      const data = await schedulesService.markExpiredAsAbsent(req.params.id);

      logActivity({
        pengguna_id: req.user?.id,
        aksi: "UPDATE",
        modul: "wawancara",
        target_id: Number(req.params.id) || req.params.id,
        deskripsi: `Menandai jadwal wawancara kedaluwarsa / tidak hadir`,
        data_sebelum: null,
        data_sesudah: data || null,
        ip_address: getClientIp(req),
      });

      res.status(200).json({ message: "Jadwal ditandai tidak hadir (kedaluwarsa)", data });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  };

  reject = async (req, res) => {
    try {
      const result = await schedulesService.rejectSchedule(req.params.id);

      logActivity({
        pengguna_id: req.user?.id,
        aksi: "REJECT",
        modul: "wawancara",
        target_id: Number(req.params.id) || req.params.id,
        deskripsi: `Menolak lamaran dari jadwal wawancara`,
        data_sebelum: null,
        data_sesudah: result?.data || result || null,
        ip_address: getClientIp(req),
      });

      res.status(200).json({ message: "Lamaran berhasil ditolak", data: result });
    } catch (e) {
      res.status(400).json({ message: "Gagal menolak lamaran", error: e.message });
    }
  };

  delete = async (req, res) => {
    try {
      let existing = null;
      try {
        existing = await schedulesService.getScheduleById(req.params.id);
      } catch (e) {
        existing = null;
      }

      await schedulesService.deleteSchedule(req.params.id);

      logActivity({
        pengguna_id: req.user?.id,
        aksi: "DELETE",
        modul: "wawancara",
        target_id: Number(req.params.id) || req.params.id,
        deskripsi: `Menghapus jadwal wawancara`,
        data_sebelum: existing || null,
        data_sesudah: null,
        ip_address: getClientIp(req),
      });

      res.status(200).json({ message: "Jadwal dihapus" });
    } catch (e) {
      res.status(400).json({ message: "Gagal hapus jadwal", error: e.message });
    }
  };
}

module.exports = new SchedulesController();