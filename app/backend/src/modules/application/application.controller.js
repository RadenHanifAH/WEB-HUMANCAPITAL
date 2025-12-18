// backend/src/modules/application/application.controller.js
const service = require("./application.service");

module.exports = {
  async apply(req, res) {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const { jobId } = req.body;
      const userId = req.user.id;

      if (!jobId)
        return res.status(400).json({ message: "Job ID wajib dikirim" });

      // ✅ Logika baru untuk mengambil banyak file
      // ✅ Gunakan pengecekan yang aman agar tidak crash jika portfolio kosong
      const cvUrl = req.files?.["cv"]?.[0]
        ? `/uploads/cvs/${req.files["cv"][0].filename}`
        : null;

      const portfolioUrl = req.files?.["portfolio"]?.[0]
        ? `/uploads/portfolios/${req.files["portfolio"][0].filename}`
        : null;

      // ✅ Kirim portfolioUrl ke service (jangan null lagi)
      const created = await service.applyJob(
        userId,
        jobId,
        cvUrl,
        portfolioUrl
      );

      res.status(201).json({
        message: "Lamaran berhasil dikirim",
        data: created,
      });
    } catch (err) {
      console.error("Apply Error:", err);
      res
        .status(500)
        .json({ message: "Gagal mengirim lamaran", error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const applications = await service.getAllApplications();

      const formattedApplications = applications.map((app) => ({
        id: app.id,

        // User
        name: app.user.name,
        email: app.user.email,
        experience: app.user.experience,
        avatar: app.user.profile?.fotoProfile,

        // Job
        position: app.job.title,

        // Application
        status: app.status,
        stage: app.stage,
        score: app.score,
        appliedDate: app.appliedAt,
        cvUrl: app.cvUrl,
        portfolioUrl: app.portfolioUrl,
      }));

      res.json({
        message: "Daftar lamaran",
        data: formattedApplications,
      });
    } catch (err) {
      console.error("GetAll Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status, stage } = req.body;
      const { id } = req.params;

      const updated = await service.updateApplicationStatus(id, status, stage);

      res.json({
        message: "Status lamaran diperbarui",
        data: updated,
      });
    } catch (err) {
      console.error("UpdateStatus Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async updateScore(req, res) {
    try {
      const { score } = req.body;
      const { id } = req.params;

      const updated = await service.updateApplicationScore(id, score);

      res.json({
        message: "Score lamaran diperbarui",
        data: updated,
      });
    } catch (err) {
      console.error("UpdateScore Error:", err);
      res.status(500).json({ error: err.message });
    }
  },
};
