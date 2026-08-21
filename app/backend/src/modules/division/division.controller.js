// src/modules/division/division.controller.js
const divisionService = require("./division.service");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { notifyAdmins } = require("../notifications/notify.helper");
const { NOTIFICATION_TYPES } = require("../notifications/notifications.service");

module.exports = {
  async getDivisiDashboard(req, res) {
    try {
      const pengguna_id = req.user?.id;
      const data = await divisionService.getDashboardData(pengguna_id);
      return res.status(200).json({
        success: true,
        message: "Dashboard divisi berhasil dimuat",
        data,
      });
    } catch (e) {
      console.error("Divisi Dashboard Error:", e);
      return res.status(500).json({
        success: false,
        message: "Gagal memuat dashboard divisi",
        error: e?.message || "Unknown error",
      });
    }
  },

  async getPengajuanList(req, res) {
    try {
      const pengguna_id = req.user?.id;
      const { search = "", status = "", page = "1", limit = "10" } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where = {
        pengguna_id,
        ...(search && {
          posisi: { contains: search },
        }),
        ...(status && { status }),
      };

      const [items, total] = await Promise.all([
        prisma.pengajuan_sdm.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip,
          take,
        }),
        prisma.pengajuan_sdm.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: { items, total },
      });
    } catch (e) {
      console.error("Pengajuan List Error:", e);
      return res.status(500).json({
        success: false,
        message: "Gagal memuat daftar pengajuan",
        error: e?.message,
      });
    }
  },

  async getPengajuanById(req, res) {
    try {
      const { id } = req.params;
      const item = await prisma.pengajuan_sdm.findUnique({
        where: { id: parseInt(id) },
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Pengajuan tidak ditemukan",
        });
      }

      return res.status(200).json({ success: true, data: item });
    } catch (e) {
      console.error("Pengajuan Detail Error:", e);
      return res.status(500).json({
        success: false,
        message: "Gagal memuat detail pengajuan",
        error: e?.message,
      });
    }
  },

  async createPengajuan(req, res) {
    try {
      const pengguna_id = req.user?.id;
      const body = req.body;

      const item = await prisma.pengajuan_sdm.create({
        data: {
          pengguna_id,
          departemen: body.departemen ?? "",
          tanggal_permintaan: body.tanggal_permintaan
            ? new Date(body.tanggal_permintaan)
            : new Date(),
          posisi: body.posisi ?? "",
          lokasi: body.lokasi ?? "", // ✅ TAMBAHKAN INI
          alasan: body.alasan ?? "",
          jumlah: body.jumlah ?? 1,
          status_karyawan: body.status_karyawan ?? "",
          tugas_utama: body.tugas_utama ?? [],
          usia_min: body.usia_min ? parseInt(body.usia_min) : null,
          usia_maks: body.usia_maks ? parseInt(body.usia_maks) : null,
          status_perkawinan: body.status_perkawinan ?? [],
          pendidikan_terakhir: body.pendidikan_terakhir ?? "S1 (Sarjana)",
          keahlian: body.keahlian ?? [],
          pengalaman: body.pengalaman ?? "",
          bahasa_asing: body.bahasa_asing ?? "",
          level_bahasa_asing: body.level_bahasa_asing ?? "Ahli",
          keahlian_komputer: body.keahlian_komputer ?? [],
          fasilitas: body.fasilitas ?? [],
          peta_kekuatan: body.peta_kekuatan ?? [],
          status: body.status ?? "DRAFT",
        },
      });

      if (item.status === "PENDING") {
        notifyAdmins({
          type: NOTIFICATION_TYPES.PENGAJUAN_SUBMITTED,
          title: `Pengajuan SDM Baru - ${item.posisi || "Tanpa Judul"}`,
          message: `Divisi ${item.departemen || "-"} mengajukan permintaan ${item.jumlah} karyawan untuk posisi ${item.posisi || "-"}.`,
          actionUrl: "pengajuan-sdm",
          metadata: { pengajuanId: item.id },
        });
      }

      return res.status(201).json({
        success: true,
        message: "Pengajuan berhasil dibuat",
        data: item,
      });
    } catch (e) {
      console.error("Create Pengajuan Error:", e);
      return res.status(500).json({
        success: false,
        message: "Gagal membuat pengajuan",
        error: e?.message,
      });
    }
  },

  async updatePengajuan(req, res) {
    try {
      const { id } = req.params;
      const body = req.body;

      const existing = await prisma.pengajuan_sdm.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Pengajuan tidak ditemukan",
        });
      }

      if (!["DRAFT", "PENDING"].includes(existing.status)) {
        return res.status(400).json({
          success: false,
          message: "Hanya pengajuan berstatus DRAFT atau PENDING yang dapat diubah",
        });
      }

      const updated = await prisma.pengajuan_sdm.update({
        where: { id: parseInt(id) },
        data: {
          departemen: body.departemen ?? existing.departemen,
          tanggal_permintaan: body.tanggal_permintaan
            ? new Date(body.tanggal_permintaan)
            : existing.tanggal_permintaan,
          posisi: body.posisi ?? existing.posisi,
          lokasi: body.lokasi ?? existing.lokasi, // ✅ TAMBAHKAN INI
          alasan: body.alasan ?? existing.alasan,
          jumlah: body.jumlah ?? existing.jumlah,
          status_karyawan: body.status_karyawan ?? existing.status_karyawan,
          tugas_utama: body.tugas_utama ?? existing.tugas_utama,
          usia_min:
            body.usia_min !== undefined
              ? parseInt(body.usia_min)
              : existing.usia_min,
          usia_maks:
            body.usia_maks !== undefined
              ? parseInt(body.usia_maks)
              : existing.usia_maks,
          status_perkawinan: body.status_perkawinan ?? existing.status_perkawinan,
          pendidikan_terakhir:
            body.pendidikan_terakhir ?? existing.pendidikan_terakhir,
          keahlian: body.keahlian ?? existing.keahlian,
          pengalaman: body.pengalaman ?? existing.pengalaman,
          bahasa_asing: body.bahasa_asing ?? existing.bahasa_asing,
          level_bahasa_asing: body.level_bahasa_asing ?? existing.level_bahasa_asing,
          keahlian_komputer: body.keahlian_komputer ?? existing.keahlian_komputer,
          fasilitas: body.fasilitas ?? existing.fasilitas,
          peta_kekuatan: body.peta_kekuatan ?? existing.peta_kekuatan,
          status: body.status ?? existing.status,
        },
      });

      if (existing.status === "DRAFT" && updated.status === "PENDING") {
        notifyAdmins({
          type: NOTIFICATION_TYPES.PENGAJUAN_SUBMITTED,
          title: `Pengajuan SDM Baru - ${updated.posisi || "Tanpa Judul"}`,
          message: `Divisi ${updated.departemen || "-"} mengajukan permintaan ${updated.jumlah} karyawan untuk posisi ${updated.posisi || "-"}.`,
          actionUrl: "pengajuan-sdm",
          metadata: { pengajuanId: updated.id },
        });
      }

      return res.status(200).json({
        success: true,
        message: "Pengajuan berhasil diperbarui",
        data: updated,
      });
    } catch (e) {
      console.error("Update Pengajuan Error:", e);
      return res.status(500).json({
        success: false,
        message: "Gagal memperbarui pengajuan",
        error: e?.message,
      });
    }
  },

  async deletePengajuan(req, res) {
    try {
      const { id } = req.params;

      const existing = await prisma.pengajuan_sdm.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Pengajuan tidak ditemukan",
        });
      }

      if (!["DRAFT", "REJECTED"].includes(existing.status)) {
        return res.status(400).json({
          success: false,
          message: "Hanya pengajuan berstatus DRAFT atau REJECTED yang bisa dihapus",
        });
      }

      await prisma.pengajuan_sdm.delete({ where: { id: parseInt(id) } });

      return res.status(200).json({
        success: true,
        message: "Pengajuan berhasil dihapus",
      });
    } catch (e) {
      console.error("Delete Pengajuan Error:", e);
      return res.status(500).json({
        success: false,
        message: "Gagal menghapus pengajuan",
        error: e?.message,
      });
    }
  },

  async submitPengajuan(req, res) {
    try {
      const { id } = req.params;

      const existing = await prisma.pengajuan_sdm.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Pengajuan tidak ditemukan",
        });
      }

      if (existing.status !== "DRAFT") {
        return res.status(400).json({
          success: false,
          message: "Hanya pengajuan berstatus DRAFT yang bisa disubmit",
        });
      }

      const updated = await prisma.pengajuan_sdm.update({
        where: { id: parseInt(id) },
        data: { status: "PENDING", dikirim: new Date() },
      });

      notifyAdmins({
        type: NOTIFICATION_TYPES.PENGAJUAN_SUBMITTED,
        title: `Pengajuan SDM Baru - ${updated.posisi || "Tanpa Judul"}`,
        message: `Divisi ${updated.departemen || "-"} mengajukan permintaan ${updated.jumlah} karyawan untuk posisi ${updated.posisi || "-"}.`,
        actionUrl: "pengajuan-sdm",
        metadata: { pengajuanId: updated.id },
      });

      return res.status(200).json({
        success: true,
        message: "Pengajuan berhasil disubmit",
        data: updated,
      });
    } catch (e) {
      console.error("Submit Pengajuan Error:", e);
      return res.status(500).json({
        success: false,
        message: "Gagal submit pengajuan",
        error: e?.message,
      });
    }
  },
};