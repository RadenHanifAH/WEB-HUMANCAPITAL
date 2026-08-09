const repo = require("./settings.repository");

class SettingsService {
  async getSettings() {
    return repo.getSingleton();
  }

  async updateGeneral(payload) {
    return repo.update({
      nama_perusahaan: payload.nama_perusahaan ?? undefined,
      website: payload.website ?? undefined,
      lokasi: payload.lokasi ?? undefined,
      zona_waktu: payload.zona_waktu ?? undefined,
    });
  }

  async updateNotifications(payload) {
    return repo.update({
      email_pembaruan_sistem_aktif:
        typeof payload.email_pembaruan_sistem_aktif === "boolean"
          ? payload.email_pembaruan_sistem_aktif
          : undefined,
    });
  }

  // ✅ Tambahan: dipanggil controller tab "system"
  async updateSystem(payload) {
    return repo.update({
      nama_perusahaan: payload.nama_perusahaan ?? undefined,
      website: payload.website ?? undefined,
      lokasi: payload.lokasi ?? undefined,
      zona_waktu: payload.zona_waktu ?? undefined,
      email_pembaruan_sistem_aktif:
        typeof payload.email_pembaruan_sistem_aktif === "boolean"
          ? payload.email_pembaruan_sistem_aktif
          : undefined,
    });
  }
}

module.exports = new SettingsService();