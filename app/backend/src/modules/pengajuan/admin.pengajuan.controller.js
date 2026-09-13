const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { notifyUser, notifyAdmins } = require("../notifications/notify.helper");
const {
  NOTIFICATION_TYPES,
} = require("../notifications/notifications.service");
const { logActivity, getClientIp } = require("../activity-log/activityLog.helper");

function mapStatusKaryawanToJobType(statusKaryawan = "") {
  const s = (statusKaryawan || "").toLowerCase();
  if (s.includes("tetap")) return "FullTime";
  if (s.includes("paruh") || s.includes("part")) return "PartTime";
  if (s.includes("magang") || s.includes("intern")) return "Internship";
  if (s.includes("lepas") || s.includes("freelance")) return "Freelance";
  if (s.includes("kontrak") || s.includes("contract")) return "Contract";
  return null;
}

// p = row dari model pengajuan_sdm (snake_case, sesuai schema.prisma)
function buildJobDraftFromPengajuan(p) {
  const tugasUtama = Array.isArray(p.tugas_utama) ? p.tugas_utama : [];
  const keahlian = Array.isArray(p.keahlian) ? p.keahlian : [];
  const pendidikanTerakhir = Array.isArray(p.pendidikan_terakhir)
    ? p.pendidikan_terakhir
    : [];
  const kemampuanBahasaAsing = Array.isArray(p.kemampuan_bahasa_asing)
    ? p.kemampuan_bahasa_asing
    : [];
  const komputerSkills = Array.isArray(p.keahlian_komputer)
    ? p.keahlian_komputer
    : [];
  const fasilitas = Array.isArray(p.fasilitas) ? p.fasilitas : [];

  const descriptionParts = [];

  descriptionParts.push(
    `Kami membuka kesempatan bagi Anda untuk bergabung sebagai ${p.posisi || "anggota tim"} di divisi ${p.departemen || "kami"}. ` +
      `Posisi ini terbuka untuk ${p.jumlah || 1} orang dengan status ${p.status_karyawan || "karyawan"}.`,
  );

  if (tugasUtama.length) {
    descriptionParts.push(
      `Tanggung jawab utama Anda meliputi:\n${tugasUtama.map((t) => `• ${t}`).join("\n")}`,
    );
  }

  if (fasilitas.length) {
    descriptionParts.push(
      `Kami menawarkan berbagai fasilitas dan benefit, di antaranya:\n${fasilitas.map((f) => `• ${f}`).join("\n")}`,
    );
  }

  const requirementParts = [];

  requirementParts.push(
    `Pendidikan minimal ${pendidikanTerakhir.length ? pendidikanTerakhir.join(" / ") : "S1"}`,
  );

  if (p.jurusan) {
    requirementParts.push(`Jurusan: ${p.jurusan}`);
  }

  if (p.usia_min || p.usia_maks) {
    requirementParts.push(
      `Usia antara ${p.usia_min ?? "-"} hingga ${p.usia_maks ?? "-"} tahun`,
    );
  }

  if (p.status_perkawinan) {
    requirementParts.push(`Status pernikahan: ${p.status_perkawinan}`);
  }

  if (p.pengalaman) {
    requirementParts.push(`Memiliki pengalaman di bidang ${p.pengalaman}`);
  }

  if (keahlian.length) {
    requirementParts.push(`Menguasai ${keahlian.join(", ")}`);
  }

  if (p.bahasa_asing) {
    requirementParts.push(
      `Mampu berbahasa ${p.bahasa_asing} minimal level ${
        kemampuanBahasaAsing.length ? kemampuanBahasaAsing.join("/") : "dasar"
      }`,
    );
  }

  if (komputerSkills.length) {
    requirementParts.push(
      `Menguasai aplikasi komputer: ${komputerSkills.join(", ")}`,
    );
  }

  if (p.syarat_lain) {
    requirementParts.push(p.syarat_lain);
  }

  requirementParts.push(`Berkomitmen, jujur, dan mampu bekerja dalam tim`);

  const defaultDeadline = p.tgl_terpenuhi
    ? new Date(p.tgl_terpenuhi)
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d;
      })();

  // Field-field ini harus cocok dengan model `lowongan` di schema.prisma
  return {
    pengajuan_sdm_id: p.id,
    judul: p.posisi || "Tanpa Judul",
    departemen: p.departemen || null,
    lokasi: p.lokasi || "Bandung",
    jenis: mapStatusKaryawanToJobType(p.status_karyawan) || "FullTime",
    deskripsi: descriptionParts.join("\n\n"),
    persyaratan: requirementParts.join("\n"),
    tenggat: defaultDeadline,
    status: "draft",
  };
}

module.exports = {
  // ── GET /api/admin/pengajuan/stats ─────────────────────────────
  async getStats(req, res) {
    try {
      const [total, pending, approved, rejected, draft] = await Promise.all([
        prisma.pengajuan_sdm.count(),
        prisma.pengajuan_sdm.count({ where: { status: "PENDING" } }),
        prisma.pengajuan_sdm.count({ where: { status: "APPROVED" } }),
        prisma.pengajuan_sdm.count({ where: { status: "REJECTED" } }),
        prisma.pengajuan_sdm.count({ where: { status: "DRAFT" } }),
      ]);

      return res.status(200).json({
        success: true,
        data: { total, pending, approved, rejected, draft },
      });
    } catch (e) {
      console.error("Admin Stats Error:", e);
      return res
        .status(500)
        .json({
          success: false,
          message: "Gagal memuat statistik",
          error: e?.message,
        });
    }
  },

  // ── GET /api/admin/pengajuan ───────────────────────────────────
  async getList(req, res) {
    try {
      const { search = "", status = "", page = "1", limit = "10" } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where = {
        ...(search && {
          OR: [
            { posisi: { contains: search } },
            { departemen: { contains: search } },
          ],
        }),
        ...(status && { status }),
      };

      const [items, total] = await Promise.all([
        prisma.pengajuan_sdm.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip,
          take,
          include: {
            pengguna: {
              select: { id: true, nama: true, email: true },
            },
          },
        }),
        prisma.pengajuan_sdm.count({ where }),
      ]);

      return res.status(200).json({ success: true, data: { items, total } });
    } catch (e) {
      console.error("Admin List Error:", e);
      return res
        .status(500)
        .json({
          success: false,
          message: "Gagal memuat daftar pengajuan",
          error: e?.message,
        });
    }
  },

  // ── GET /api/admin/pengajuan/:id ──────────────────────────────
  async getById(req, res) {
    try {
      const id = parseInt(req.params.id);

      const item = await prisma.pengajuan_sdm.findUnique({
        where: { id },
        include: {
          pengguna: { select: { id: true, nama: true, email: true } },
          lowongan: true,
        },
      });

      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Pengajuan tidak ditemukan" });
      }

      return res.status(200).json({ success: true, data: item });
    } catch (e) {
      console.error("Admin Detail Error:", e);
      return res
        .status(500)
        .json({
          success: false,
          message: "Gagal memuat detail pengajuan",
          error: e?.message,
        });
    }
  },

  // ── POST /api/admin/pengajuan/:id/approve ─────────────────────
  async approve(req, res) {
    try {
      const id = parseInt(req.params.id);
      const catatan = req.body?.catatan ?? null;
      const pengguna_id = req.user?.id;

      const existing = await prisma.pengajuan_sdm.findUnique({ where: { id } });

      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Pengajuan tidak ditemukan" });
      }
      if (existing.status !== "PENDING") {
        return res.status(400).json({
          success: false,
          message: "Hanya pengajuan berstatus PENDING yang dapat disetujui",
        });
      }

      // Cek apakah pengajuan ini sudah punya lowongan terkait via relasi
      if (existing.lowongan) {
        return res.status(400).json({
          success: false,
          message: "Pengajuan ini sudah memiliki lowongan terkait",
        });
      }

      const jobPayload = buildJobDraftFromPengajuan(existing);

      // Transaksi: buat lowongan siap-publish + update status pengajuan sekaligus
      const [updated, newJob] = await prisma.$transaction(async (tx) => {
        const job = await tx.lowongan.create({
          data: { ...jobPayload, dibuat_oleh: pengguna_id ?? null },
          include: { pengajuan_sdm: true },
        });

        const updatedPengajuan = await tx.pengajuan_sdm.update({
          where: { id },
          data: {
            status: "APPROVED",
            catatan_admin: catatan,
            ditinjau: new Date(),
            diubah_oleh: pengguna_id ?? null,
          },
        });

        return [updatedPengajuan, job];
      });

      // 📝 Log: pengajuan disetujui + lowongan otomatis dibuat
      logActivity({
        pengguna_id,
        aksi: "APPROVE",
        modul: "pengajuan_sdm",
        target_id: updated.id,
        deskripsi: `Menyetujui pengajuan SDM "${updated.posisi || "-"}" dan membuat draft lowongan (ID lowongan #${newJob.id})${catatan ? ` — Catatan: ${catatan}` : ""}`,
        data_sebelum: existing,
        data_sesudah: updated,
        ip_address: getClientIp(req),
      });

      notifyUser(updated.pengguna_id, {
        type: NOTIFICATION_TYPES.PENGAJUAN_APPROVED,
        title: `Pengajuan SDM Disetujui - ${updated.posisi || "-"}`,
        message: `Pengajuan Anda untuk posisi ${updated.posisi || "-"} telah disetujui dan lowongan telah dipublikasikan.`,
        actionUrl: "pengajuan-sdm",
        metadata: { pengajuanId: updated.id, jobId: newJob.id },
      });

      notifyAdmins({
        type: NOTIFICATION_TYPES.JOB_CREATED,
        title: `Jangan Lupa Edit Lowongan - ${newJob.judul}`,
        message: `Lowongan "${newJob.judul}" dibuat otomatis dari pengajuan SDM dan masih berstatus draft. Silakan cek & edit detailnya (lokasi, tenggat, deskripsi) sebelum dipublikasikan.`,
        actionUrl: "jobs",
        metadata: { jobId: newJob.id, pengajuanId: updated.id },
      });

      return res.status(200).json({
        success: true,
        message: "Pengajuan disetujui & lowongan berhasil dipublikasikan",
        data: { pengajuan: updated, job: newJob },
      });
    } catch (e) {
      console.error("Admin Approve Error:", e);
      return res
        .status(500)
        .json({
          success: false,
          message: "Gagal menyetujui pengajuan",
          error: e?.message,
        });
    }
  },

  // ── POST /api/admin/pengajuan/:id/reject ──────────────────────
  async reject(req, res) {
    try {
      const id = parseInt(req.params.id);
      const catatan = req.body?.catatan ?? "";
      const pengguna_id = req.user?.id;

      if (!catatan.trim()) {
        return res.status(400).json({
          success: false,
          message: "Catatan wajib diisi saat menolak pengajuan",
        });
      }

      const existing = await prisma.pengajuan_sdm.findUnique({ where: { id } });

      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Pengajuan tidak ditemukan" });
      }
      if (existing.status !== "PENDING") {
        return res.status(400).json({
          success: false,
          message: "Hanya pengajuan berstatus PENDING yang dapat ditolak",
        });
      }

      const updated = await prisma.pengajuan_sdm.update({
        where: { id },
        data: {
          status: "REJECTED",
          catatan_admin: catatan,
          ditinjau: new Date(),
          diubah_oleh: pengguna_id ?? null,
        },
      });

      // 📝 Log: pengajuan ditolak, catatan alasan ikut tersimpan
      logActivity({
        pengguna_id,
        aksi: "REJECT",
        modul: "pengajuan_sdm",
        target_id: updated.id,
        deskripsi: `Menolak pengajuan SDM "${updated.posisi || "-"}" — Catatan: ${catatan}`,
        data_sebelum: existing,
        data_sesudah: updated,
        ip_address: getClientIp(req),
      });

      notifyUser(updated.pengguna_id, {
        type: NOTIFICATION_TYPES.PENGAJUAN_REJECTED,
        title: `Pengajuan SDM Ditolak - ${updated.posisi || "-"}`,
        message: `Pengajuan Anda untuk posisi ${updated.posisi || "-"} ditolak. Catatan: ${catatan}`,
        actionUrl: "pengajuan-sdm",
        metadata: { pengajuanId: updated.id },
      });

      return res.status(200).json({
        success: true,
        message: "Pengajuan berhasil ditolak",
        data: updated,
      });
    } catch (e) {
      console.error("Admin Reject Error:", e);
      return res
        .status(500)
        .json({
          success: false,
          message: "Gagal menolak pengajuan",
          error: e?.message,
        });
    }
  },
};