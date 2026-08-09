const { notificationsService } = require("./notifications.service");

const notificationsController = {
  // GET /api/notifications/recent?limit=5
  async getRecent(req, res) {
    try {
      const userId = req.user?.id || null;
      const limit = Number(req.query.limit) || 5;
      const data = await notificationsService.getRecent(userId, limit);
      res.json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Gagal memuat notifikasi" });
    }
  },

  // GET /api/notifications?page=1&pageSize=20&isRead=false&type=new_applicant
  async getAll(req, res) {
    try {
      const userId = req.user?.id || null;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;
      const isRead =
        req.query.isRead === "true"
          ? true
          : req.query.isRead === "false"
          ? false
          : undefined;
      const type = req.query.type || undefined;

      const data = await notificationsService.getAll({
        userId,
        page,
        pageSize,
        isRead,
        type,
      });
      res.json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Gagal memuat semua notifikasi" });
    }
  },

  // PATCH /api/notifications/:id/read
  async markAsRead(req, res) {
    try {
      const id = Number(req.params.id);
      const updated = await notificationsService.markAsRead(id);
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Gagal menandai notifikasi sudah dibaca" });
    }
  },

  // PATCH /api/notifications/read-all
  async markAllAsRead(req, res) {
    try {
      const userId = req.user?.id || null;
      await notificationsService.markAllAsRead(userId);
      res.json({ message: "Semua notifikasi ditandai sudah dibaca" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Gagal menandai semua notifikasi" });
    }
  },

  // DELETE /api/notifications/:id
  async remove(req, res) {
    try {
      const id = Number(req.params.id);
      await notificationsService.remove(id);
      res.json({ message: "Notifikasi dihapus" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Gagal menghapus notifikasi" });
    }
  },
};

module.exports = notificationsController;