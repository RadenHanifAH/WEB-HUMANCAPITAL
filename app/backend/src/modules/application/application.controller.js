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

      if (!jobId) return res.status(400).json({ message: "Job ID wajib dikirim" });

      const cvUrl = req.files?.["cv"]?.[0]
        ? `/uploads/cvs/${req.files["cv"][0].filename}`
        : null;

      const portfolioUrl = req.files?.["portfolio"]?.[0]
        ? `/uploads/portfolios/${req.files["portfolio"][0].filename}`
        : null;

      const result = await service.applyJob(userId, jobId, cvUrl, portfolioUrl);

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

      return res.status(500).json({
        message: "Gagal mengirim lamaran",
        error: err.message,
      });
    }
  },

  // =========================
  // ADMIN GET ALL
  // GET /api/applications
  // =========================
  async getAll(req, res) {
    try {
      const applications = await service.getAllApplications();

      const formattedApplications = applications.map((app) => ({
        id: app.id,

        name: app.user.profile?.fullName || app.user.name,
        email: app.user.email,
        experience: app.user.experience,
        avatar: app.user.profile?.fotoProfile,

        position: app.job.title,

        status: app.status,
        stage: app.stage,
        score: app.score,
        appliedDate: app.appliedAt,
        cvUrl: app.cvUrl,
        portfolioUrl: app.portfolioUrl,

        profile: app.user.profile || null,
      }));

      return res.json({ message: "Daftar lamaran", data: formattedApplications });
    } catch (err) {
      console.error("GetAll Error:", err);
      return res.status(500).json({ error: err.message });
    }
  },

  // =========================
  // ADMIN UPDATE STATUS
  // PUT /api/applications/:id/status
  // ✅ stage otomatis mengikuti status di service
  // =========================
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const { id } = req.params;

      if (!status) {
        return res.status(400).json({ message: "status wajib dikirim" });
      }

      const updated = await service.updateApplicationStatus(id, status);

      return res.json({
        message: "Status & stage lamaran diperbarui",
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
