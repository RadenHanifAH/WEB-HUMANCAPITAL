const service = require("./application.service");

module.exports = {
  // =========================
  // PELAMAR APPLY
  // POST /api/applications/job
  // =========================
  async apply(req, res) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const { jobId } = req.body;
      const userId = req.user.id;
      const role = req.user.role;

      if (!jobId)
        return res.status(400).json({ message: "Job ID wajib dikirim" });

      const result = await service.applyJob(userId, jobId, role);

      return res.status(201).json({
        message: "Lamaran berhasil dikirim",
        data: result,
      });
    } catch (err) {
      console.error("Apply Error:", err);

      if (err.code === "ACTIVE_APPLICATION_EXISTS") {
        return res.status(400).json({
          message: err.message,
          active: err.active || null,
        });
      }

      if (err.code === "PROFILE_INCOMPLETE") {
        return res.status(400).json({
          message: err.message,
          code: "PROFILE_INCOMPLETE",
        });
      }

      if (err.code === "CV_REQUIRED") {
        return res.status(400).json({ message: err.message });
      }

      return res.status(500).json({
        message: "Gagal mengirim lamaran",
        error: err.message,
      });
    }
  },

  // =========================
  // CEK KELENGKAPAN PROFIL SEBELUM MELAMAR
  // GET /api/applications/profile-readiness
  // =========================
  async checkProfileReadiness(req, res) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const data = await service.checkProfileReadiness(
        req.user.id,
        req.user.role,
      );

      return res.json({
        message: "Status kelengkapan profil",
        data,
      });
    } catch (err) {
      console.error("checkProfileReadiness Error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // =========================
  // CHECK APPLICATION
  // GET /api/applications/check/:jobId
  // =========================
  async checkApplication(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.id;
      const jobId = Number(req.params.jobId);

      const application = await service.checkUserApplication(userId, jobId);

      if (!application) {
        return res.json({ alreadyApplied: false });
      }

      // ⚠️ FIX: nama field disesuaikan persis kolom Prisma
      // (tahap, tanggal_melamar), bukan lagi stage/appliedAt.
      return res.json({
        alreadyApplied: true,
        application: {
          id: application.id,
          status: application.status,
          tahap: application.tahap,
          tanggal_melamar: application.tanggal_melamar,
        },
      });
    } catch (err) {
      console.error("checkApplication Error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // =========================
  // ADMIN GET ALL
  // GET /api/applications
  // =========================
  async getAll(req, res) {
    try {
      const applications = await service.getAllApplications();

      // ⚠️ FIX: seluruh key sekarang persis nama kolom/relasi Prisma.
      // Tidak ada lagi userId/name/avatar/position/stage/score/appliedDate.
      const formattedApplications = applications.map((app) => {
        return {
          id: app.id,
          pengguna_id: app.pengguna_id,
          lowongan_id: app.lowongan_id,

          status: app.status,
          tahap: app.tahap,
          skor: app.skor,
          tanggal_melamar: app.tanggal_melamar,

          nama_cv: app.nama_cv || null,
          nama_portofolio: app.nama_portofolio || null,

          cvDownloadUrl: app.nama_cv
            ? `/api/applications/${app.id}/file?type=cv`
            : null,

          portfolioDownloadUrl: app.nama_portofolio
            ? `/api/applications/${app.id}/file?type=portfolio`
            : null,

          // ✅ Relasi pengguna & lowongan dikirim apa adanya (nested),
          // sesuai bentuk relasi di schema.prisma.
          pengguna: app.pengguna
            ? {
                id: app.pengguna.id,
                nama: app.pengguna.nama,
                email: app.pengguna.email,
                profil: app.pengguna.profil || null,
              }
            : null,

          lowongan: app.lowongan
            ? {
                id: app.lowongan.id,
                judul: app.lowongan.judul,
              }
            : null,

          // ✅ Relasi turunan pengguna, nama field persis Prisma
          pengalaman_kerja: app.pengguna?.pengalaman_kerja || [],
          pendidikan: app.pengguna?.pendidikan || [],
          organisasi: app.pengguna?.organisasi || [],
          sertifikat: app.pengguna?.sertifikat || [],
          keahlian_pengguna: app.pengguna?.keahlian_pengguna || [],

          // ✅ Jadwal wawancara milik lamaran ini, field persis Prisma
          jadwal_wawancara: (app.jadwal_wawancara || []).map((s) => ({
            id: s.id,
            jenis: s.jenis,
            tanggal_waktu: s.tanggal_waktu,
            status: s.status,
            sudah_selesai: s.sudah_selesai,
            status_kehadiran: s.status_kehadiran,
          })),
        };
      });

      return res.json({
        message: "Daftar lamaran",
        data: formattedApplications,
      });
    } catch (err) {
      console.error("GetAll Error:", err);
      return res.status(500).json({ error: err.message });
    }
  },

  // =========================
  // ADMIN DOWNLOAD FILE
  // GET /api/applications/:id/file?type=cv|portfolio
  // =========================
  async downloadFile(req, res) {
    try {
      const { id } = req.params;
      const { type = "cv" } = req.query;

      const app = await service.getApplicationFileById(id);
      if (!app)
        return res.status(404).json({ message: "Lamaran tidak ditemukan" });

      let base64, name, mime;

      if (type === "portfolio") {
        base64 = app.data_portofolio;
        name = app.nama_portofolio || "portfolio.pdf";
        mime = app.mime_portofolio || "application/pdf";
      } else {
        base64 = app.data_cv;
        name = app.nama_cv || "cv.pdf";
        mime = app.mime_cv || "application/pdf";
      }

      if (!base64)
        return res.status(404).json({ message: `File ${type} tidak tersedia` });

      const buffer = Buffer.from(base64, "base64");

      res.setHeader("Content-Type", mime);
      res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
      return res.status(200).send(buffer);
    } catch (err) {
      console.error("downloadFile Error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // =========================
  // ADMIN UPDATE STATUS
  // PUT /api/applications/:id/status
  // =========================
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const { id } = req.params;

      if (!status)
        return res.status(400).json({ message: "status wajib dikirim" });

      const updated = await service.updateApplicationStatus(id, status);

      return res.json({
        message: "Status & tahap lamaran diperbarui",
        data: updated,
      });
    } catch (err) {
      console.error("UpdateStatus Error:", err);
      return res.status(500).json({ error: err.message });
    }
  },

  // =========================
  // ADMIN UPDATE SCORE
  // PUT /api/applications/:id/score
  // =========================
  async updateScore(req, res) {
    try {
      const { score } = req.body;
      const { id } = req.params;

      const updated = await service.updateApplicationScore(id, score);

      return res.json({
        message: "Score lamaran diperbarui",
        data: updated,
      });
    } catch (err) {
      console.error("UpdateScore Error:", err);
      return res.status(500).json({ error: err.message });
    }
  },

  // =========================
  // USER TIMELINE
  // GET /api/applications/me/latest
  // =========================
  async getMyLatest(req, res) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const userId = req.user.id;
      const data = await service.getMyTimelineApplication(userId);

      return res.json({
        message: "Timeline application",
        data: data || null,
      });
    } catch (err) {
      console.error("getMyLatest Error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  // =========================
  // USER LIST LAMARAN
  // GET /api/applications/me
  // =========================
  async getMyApplications(req, res) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const userId = req.user.id;
      const items = await service.getMyApplications(userId);

      return res.json({
        message: "My applications",
        data: items,
      });
    } catch (err) {
      console.error("getMyApplications Error:", err);
      return res.status(500).json({ message: err.message });
    }
  },
};