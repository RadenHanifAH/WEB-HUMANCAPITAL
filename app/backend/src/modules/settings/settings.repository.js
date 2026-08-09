// settings.repository.js
// ✅ Tidak ada import Prisma lagi. Data di-hardcode sesuai permintaan.

const DEFAULT_SETTINGS = {
  id: 1,
  nama_perusahaan: "Syaamil Group",
  website: "https://www.syaamilquran.com/",
  lokasi: "Bandung",
  zona_waktu: "WIB (UTC+7)",
  email_pembaruan_sistem_aktif: true,
  created_at: new Date(),
  updated_at: new Date(),
};

// In-memory store — perubahan selama server jalan tetap tersimpan,
// tapi reset ke DEFAULT kalau server restart.
// Kalau mau benar-benar readonly (abaikan semua update), pakai langsung DEFAULT_SETTINGS.
let settings = { ...DEFAULT_SETTINGS };

module.exports = {
  async getSingleton() {
    return { ...settings };
  },

  async update(data) {
    // Filter field yang ada di schema hardcoded saja
    const allowed = [
      "nama_perusahaan",
      "website",
      "lokasi",
      "zona_waktu",
      "email_pembaruan_sistem_aktif",
    ];

    const patch = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        patch[key] = data[key];
      }
    }

    settings = {
      ...settings,
      ...patch,
      updated_at: new Date(),
    };

    return { ...settings };
  },
};