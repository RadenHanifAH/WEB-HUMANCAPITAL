const penilaianService = require("./penilaian.service");
// ✅ NEW: notifikasi ke admin — hasil psikotest/interview tersimpan.
const { notifyAdmins } = require("../notifications/notify.helper");
const { NOTIFICATION_TYPES } = require("../notifications/notifications.service");
// 📝 LOG: tambahan untuk Log Aktivitas
const { logActivity, getClientIp } = require("../activity-log/activityLog.helper");

class PenilaianController {
  // ================= PREFILL =================

  // GET /penilaian/prefill/:applicationId
  getPrefillData = async (req, res) => {
    try {
      const { applicationId } = req.params;
      const data =
        await penilaianService.getApplicationForPrefill(applicationId);
      if (!data)
        return res
          .status(404)
          .json({ message: "Data lamaran tidak ditemukan" });
      res.status(200).json({ item: data });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Gagal mengambil data lamaran", error: e.message });
    }
  };

  // ================= SEARCH KANDIDAT =================

  // GET /penilaian/search-candidates?q=budi&stage=interview-pertama
  searchCandidates = async (req, res) => {
    try {
      const { q = "", stage } = req.query;
      const items = await penilaianService.searchCandidates(q, stage);
      res.status(200).json({ items });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Gagal mencari kandidat", error: e.message });
    }
  };

  // ================= PSIKOTEST =================

  // GET /penilaian/psikotest
  listPsikotest = async (req, res) => {
    try {
      const { q = "", page = 1, pageSize = 10 } = req.query;
      const { items, total } = await penilaianService.listPsikotest({
        q,
        page,
        pageSize,
      });
      res.status(200).json({ items, total });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Gagal memuat data psikotest", error: e.message });
    }
  };

  // GET /penilaian/psikotest/:id
  getPsikotest = async (req, res) => {
    try {
      const { id } = req.params;
      const item = await penilaianService.getPsikotest(id);
      if (!item)
        return res
          .status(404)
          .json({ message: "Data psikotest tidak ditemukan" });
      res.status(200).json({ item });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Gagal mengambil data psikotest", error: e.message });
    }
  };

  // GET /penilaian/psikotest/by-application/:applicationId
  getPsikotestByApplication = async (req, res) => {
    try {
      const { applicationId } = req.params;
      const item =
        await penilaianService.getPsikotestByApplication(applicationId);
      res.status(200).json({ item });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Gagal mengambil data psikotest", error: e.message });
    }
  };

  // POST /penilaian/psikotest
  createPsikotest = async (req, res) => {
    try {
      const item = await penilaianService.saveOrUpdatePsikotest(req.body);

      // 📝 LOG: hasil psikotest disimpan
      logActivity({
        pengguna_id: req.user?.id,
        aksi: "CREATE",
        modul: "penilaian",
        target_id: item?.id || null,
        deskripsi: `Menyimpan hasil psikotest untuk ${item?.nama_pelamar || "-"} (${item?.posisi || "-"}) — kesimpulan: ${item?.kesimpulan || "-"}`,
        data_sebelum: null,
        data_sesudah: item || null,
        ip_address: getClientIp(req),
      });

      notifyAdmins({
        type: NOTIFICATION_TYPES.ASSESSMENT_SAVED,
        title: `Hasil Psikotest Tersimpan - ${item.nama_pelamar}`,
        message: `Hasil psikotest untuk ${item.nama_pelamar} (${item.posisi}) telah disimpan dengan kesimpulan "${item.kesimpulan}".`,
        actionUrl: "schedule-dokumen-penilaian",
        metadata: { psikotestId: item.id, applicationId: item.lamaran_id },
      });

      res
        .status(201)
        .json({ message: "Hasil psikotest berhasil disimpan", item });
    } catch (e) {
      res
        .status(400)
        .json({ message: e.message || "Gagal menyimpan hasil psikotest" });
    }
  };

  // PUT /penilaian/psikotest/:id
  updatePsikotest = async (req, res) => {
    try {
      const { id } = req.params;
      const item = await penilaianService.saveOrUpdatePsikotest({
        ...req.body,
        id,
      });

      // 📝 LOG: hasil psikotest diperbarui
      logActivity({
        pengguna_id: req.user?.id,
        aksi: "UPDATE",
        modul: "penilaian",
        target_id: item?.id || Number(id) || id,
        deskripsi: `Memperbarui hasil psikotest untuk ${item?.nama_pelamar || "-"} — kesimpulan: ${item?.kesimpulan || "-"}`,
        data_sebelum: null,
        data_sesudah: item || null,
        ip_address: getClientIp(req),
      });

      res
        .status(200)
        .json({ message: "Hasil psikotest berhasil diperbarui", item });
    } catch (e) {
      res
        .status(400)
        .json({ message: e.message || "Gagal memperbarui hasil psikotest" });
    }
  };

  // DELETE /penilaian/psikotest/:id
  deletePsikotest = async (req, res) => {
    try {
      const { id } = req.params;

      // snapshot sebelum hapus (best-effort)
      let existing = null;
      try {
        existing = await penilaianService.getPsikotest(id);
      } catch (e) {
        existing = null;
      }

      await penilaianService.removePsikotest(id);

      // 📝 LOG: hasil psikotest dihapus
      logActivity({
        pengguna_id: req.user?.id,
        aksi: "DELETE",
        modul: "penilaian",
        target_id: Number(id) || id,
        deskripsi: `Menghapus hasil psikotest ${existing?.nama_pelamar || `(ID: ${id})`}`,
        data_sebelum: existing || null,
        data_sesudah: null,
        ip_address: getClientIp(req),
      });

      res.status(200).json({ message: "Hasil psikotest berhasil dihapus" });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Gagal menghapus hasil psikotest", error: e.message });
    }
  };

  // ================= INTERVIEW =================
  // stage: 1 = Interview Pertama, 2 = Interview Kedua

  // GET /penilaian/interview?stage=1
  listInterview = async (req, res) => {
    try {
      const { q = "", page = 1, pageSize = 10, stage } = req.query;
      const { items, total } = await penilaianService.listInterview({
        q,
        page,
        pageSize,
        stage,
      });
      res.status(200).json({ items, total });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Gagal memuat data wawancara", error: e.message });
    }
  };

  // GET /penilaian/interview/:id
  getInterview = async (req, res) => {
    try {
      const { id } = req.params;
      const item = await penilaianService.getInterview(id);
      if (!item)
        return res
          .status(404)
          .json({ message: "Data wawancara tidak ditemukan" });
      res.status(200).json({ item });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Gagal mengambil data wawancara", error: e.message });
    }
  };

  // GET /penilaian/interview/by-application/:applicationId?stage=1
  getInterviewByApplication = async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { stage } = req.query;
      const item = await penilaianService.getInterviewByApplication(
        applicationId,
        stage,
      );
      res.status(200).json({ item });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Gagal mengambil data wawancara", error: e.message });
    }
  };

  // POST /penilaian/interview  (body harus menyertakan `stage`: 1 atau 2)
  createInterview = async (req, res) => {
    try {
      const item = await penilaianService.saveOrUpdateInterview(req.body);

      // 📝 LOG: hasil interview disimpan
      logActivity({
        pengguna_id: req.user?.id,
        aksi: "CREATE",
        modul: "penilaian",
        target_id: item?.id || null,
        deskripsi: `Menyimpan hasil interview tahap ${item?.tahap ?? "-"} untuk ${item?.nama_pelamar || "-"} — kesimpulan: ${item?.kesimpulan || "-"}`,
        data_sebelum: null,
        data_sesudah: item || null,
        ip_address: getClientIp(req),
      });

      notifyAdmins({
        type: NOTIFICATION_TYPES.ASSESSMENT_SAVED,
        title: `Hasil Interview Tersimpan - ${item.nama_pelamar}`,
        message: `Hasil interview tahap ${item.tahap} untuk ${item.nama_pelamar} telah disimpan dengan kesimpulan "${item.kesimpulan}".`,
        actionUrl: "schedule-dokumen-penilaian",
        metadata: { interviewId: item.id, applicationId: item.lamaran_id },
      });

      res
        .status(201)
        .json({ message: "Hasil wawancara berhasil disimpan", item });
    } catch (e) {
      res
        .status(400)
        .json({ message: e.message || "Gagal menyimpan hasil wawancara" });
    }
  };

  // PUT /penilaian/interview/:id
  updateInterview = async (req, res) => {
    try {
      const { id } = req.params;
      const item = await penilaianService.saveOrUpdateInterview({
        ...req.body,
        id,
      });

      // 📝 LOG: hasil interview diperbarui
      logActivity({
        pengguna_id: req.user?.id,
        aksi: "UPDATE",
        modul: "penilaian",
        target_id: item?.id || Number(id) || id,
        deskripsi: `Memperbarui hasil interview tahap ${item?.tahap ?? "-"} untuk ${item?.nama_pelamar || "-"}`,
        data_sebelum: null,
        data_sesudah: item || null,
        ip_address: getClientIp(req),
      });

      res
        .status(200)
        .json({ message: "Hasil wawancara berhasil diperbarui", item });
    } catch (e) {
      res
        .status(400)
        .json({ message: e.message || "Gagal memperbarui hasil wawancara" });
    }
  };

  // DELETE /penilaian/interview/:id
  deleteInterview = async (req, res) => {
    try {
      const { id } = req.params;

      // snapshot sebelum hapus (best-effort)
      let existing = null;
      try {
        existing = await penilaianService.getInterview(id);
      } catch (e) {
        existing = null;
      }

      await penilaianService.removeInterview(id);

      // 📝 LOG: hasil interview dihapus
      logActivity({
        pengguna_id: req.user?.id,
        aksi: "DELETE",
        modul: "penilaian",
        target_id: Number(id) || id,
        deskripsi: `Menghapus hasil interview ${existing?.nama_pelamar || `(ID: ${id})`}`,
        data_sebelum: existing || null,
        data_sesudah: null,
        ip_address: getClientIp(req),
      });

      res.status(200).json({ message: "Hasil wawancara berhasil dihapus" });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Gagal menghapus hasil wawancara", error: e.message });
    }
  };

  // GET /penilaian/documents?q=budi
  listAssessmentDocuments = async (req, res) => {
    try {
      const { q = "" } = req.query;
      const items = await penilaianService.listAssessmentDocuments(q);
      res.status(200).json({ items });
    } catch (e) {
      res
        .status(500)
        .json({ message: "Gagal memuat dokumen penilaian", error: e.message });
    }
  };
}

module.exports = new PenilaianController();