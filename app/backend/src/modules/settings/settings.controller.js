const service = require("./settings.service");

class SettingsController {
  get = async (req, res) => {
    try {
      const data = await service.getSettings();
      return res.status(200).json({ message: "Settings fetched", data });
    } catch (e) {
      return res.status(500).json({ message: "Gagal memuat settings", error: e.message });
    }
  };

  updateGeneral = async (req, res) => {
    try {
      const data = await service.updateGeneral(req.body || {});
      return res.status(200).json({ message: "General settings updated", data });
    } catch (e) {
      return res.status(500).json({ message: "Gagal update general settings", error: e.message });
    }
  };

  updateNotifications = async (req, res) => {
    try {
      const data = await service.updateNotifications(req.body || {});
      return res.status(200).json({ message: "Notification settings updated", data });
    } catch (e) {
      return res.status(500).json({ message: "Gagal update notification settings", error: e.message });
    }
  };

  updateSystem = async (req, res) => {
    try {
      const data = await service.updateSystem(req.body || {});
      return res.status(200).json({ message: "System settings updated", data });
    } catch (e) {
      return res.status(500).json({ message: "Gagal update system settings", error: e.message });
    }
  };

  // ✅ create dump file
  backup = async (req, res) => {
    try {
      const result = await service.runBackup();
      return res.status(200).json({
        message: "Backup success",
        data: result, // { filename, lastBackupAt }
      });
    } catch (e) {
      console.error("BACKUP ERROR:", e);
      return res.status(500).json({ message: "Gagal backup", error: e.message });
    }
  };

  // ✅ download dump file
  downloadBackup = async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = await service.getBackupFilePath(filename);

      // force download
      return res.download(filePath, filename);
    } catch (e) {
      return res.status(404).json({ message: "File backup tidak ditemukan", error: e.message });
    }
  };
}

module.exports = new SettingsController();
