const prisma = require("../../config/prisma");

// ✅ FIX: deteksi status Diterima/Ditolak (nama baru) sekaligusAccepted/Rejected (lama)
function detectFinalStatus(app) {
  const s = String(app.status || "").toLowerCase();
  const st = String(app.tahap || "").toLowerCase();

  const isAccepted =
    s.includes("accept") ||
    st.includes("accept") ||
    s.includes("hired") ||
    st.includes("hired") ||
    s.includes("diterima") ||
    st.includes("diterima") ||
    st === "final result";

  if (isAccepted) {
    return "Diterima";
  }

  const isRejected =
    s.includes("reject") ||
    st.includes("reject") ||
    s.includes("ditolak") ||
    st.includes("ditolak");

  if (isRejected) {
    return "Ditolak";
  }

  return null;
}

module.exports = {
  detectFinalStatus,

  // ✅ LIST ARCHIVES
  async findArchives({ q, status, position, page = 1, pageSize = 10 }) {
    const text = (q || "").trim();
    const s = (status || "all").toLowerCase();
    const pos = (position || "all").trim();

    const where = {};
    
    if (s !== "all") {
      if (s === "accepted" || s === "hired" || s === "diterima") {
        where.status_akhir = "Diterima";
      } else if (s === "rejected" || s === "ditolak") {
        where.status_akhir = "Ditolak";
      }
    }
    
    if (pos && pos.toLowerCase() !== "all") where.posisi = pos;

    if (text) {
      // ✅ FIX: Hapus catatan dari filter pencarian
      where.OR = [
        { nama_pelamar: { contains: text } },
        { email_pelamar: { contains: text } },
        { posisi: { contains: text } },
        { status_akhir: { contains: text } },
      ];
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [total, items] = await Promise.all([
      prisma.arsip.count({ where }),
      prisma.arsip.findMany({
        where,
        orderBy: { tanggal_keputusan: "desc" },
        skip,
        take,
        include: {
          pengguna: { include: { profil: true } },
          lowongan: true,
        },
      }),
    ]);

    return { total, items, page: Number(page), pageSize: Number(pageSize) };
  },

  // ✅ NEW: daftar posisi unik yang pernah muncul di arsip
  async getDistinctPositions() {
    const rows = await prisma.arsip.findMany({
      distinct: ["posisi"],
      select: { posisi: true },
      orderBy: { posisi: "asc" },
    });
    return rows.map((r) => r.posisi).filter(Boolean);
  },

  // ✅ GET 1 ARCHIVE detail
  async findArchiveById(id) {
    return prisma.arsip.findUnique({
      where: { id: Number(id) },
      include: {
        pengguna: {
          include: {
            profil: true,
            pengalaman_kerja: { orderBy: { tahun_mulai: "desc" } },
            pendidikan: { orderBy: { tanggal_mulai: "desc" } },
            organisasi: { orderBy: { tanggal_mulai: "desc" } },
            sertifikat: { orderBy: { diterbitkan: "desc" } },
            keahlian_pengguna: true,
          },
        },
        lowongan: true,
      },
    });
  },

  // ✅ DELETE 1 ARCHIVE
  async deleteArchiveById(id) {
    return prisma.arsip.delete({ where: { id: Number(id) } });
  },

  // ✅ AMBIL FILE CV/PORTFOLIO dari lamaran milik archive ini
  async findFileByArchiveId(id) {
    const archive = await prisma.arsip.findUnique({
      where: { id: Number(id) },
      select: { lamaran_id: true },
    });
    if (!archive?.lamaran_id) return null;

    return prisma.lamaran.findUnique({
      where: { id: archive.lamaran_id },
      select: {
        id: true,
        data_cv: true,
        nama_cv: true,
        mime_cv: true,
        data_portofolio: true,
        nama_portofolio: true,
        mime_portofolio: true,
      },
    });
  },

  // ✅ UPSERT archive dari 1 lamaran
  async upsertArchiveFromApplication(lamaranId) {
    const app = await prisma.lamaran.findUnique({
      where: { id: Number(lamaranId) },
      include: {
        pengguna: {
          select: {
            id: true,
            nama: true,
            email: true,
            profil: true,
          },
        },
        lowongan: { select: { id: true, judul: true } },
      },
    });

    if (!app) throw new Error("Lamaran tidak ditemukan");

    const finalStatus = detectFinalStatus(app);
    if (!finalStatus) return null;

    const data = {
      lamaran_id: app.id,
      pengguna_id: app.pengguna?.id ?? null,
      lowongan_id: app.lowongan?.id ?? null,
      nama_pelamar: app.pengguna?.nama || "Unknown",
      email_pelamar: app.pengguna?.email || "-",
      posisi: app.lowongan?.judul || "Unknown Position",
      status_akhir: finalStatus,
      tanggal_keputusan: new Date(),
      updated_at: new Date(),
    };

    return prisma.arsip.upsert({
      where: { lamaran_id: app.id },
      create: data,
      update: data,
    });
  },

  // ✅ SYNC semua Diterima/Ditolak dari Lamaran -> Arsip
  async syncFromApplications() {
    const apps = await prisma.lamaran.findMany({
      select: { id: true, status: true, tahap: true },
    });

    const filtered = apps.filter((a) => detectFinalStatus(a) !== null);

    let synced = 0;
    for (const a of filtered) {
      const row = await module.exports.upsertArchiveFromApplication(a.id);
      if (row) synced++;
    }

    return { totalFound: filtered.length, synced };
  },

  // ✅ Sync snapshot nama/email per IDs
  async syncSnapshotFromUserProfileByIds(archiveIds = []) {
    const ids = (Array.isArray(archiveIds) ? archiveIds : [])
      .map((x) => Number(x))
      .filter(Boolean);

    if (!ids.length) return { updated: 0 };

    const rows = await prisma.arsip.findMany({
      where: { id: { in: ids } },
      include: { pengguna: { include: { profil: true } } },
    });

    let updated = 0;

    for (const a of rows) {
      const newName = a.pengguna?.nama || a.nama_pelamar;
      const newEmail = a.pengguna?.email || a.email_pelamar;

      const needUpdate =
        (newName && newName !== a.nama_pelamar) ||
        (newEmail && newEmail !== a.email_pelamar);

      if (!needUpdate) continue;

      await prisma.arsip.update({
        where: { id: a.id },
        data: {
          nama_pelamar: newName || a.nama_pelamar,
          email_pelamar: newEmail || a.email_pelamar,
        },
      });

      updated++;
    }

    return { updated };
  },

  // ✅ Sync snapshot semua arsip
  async syncSnapshotAll() {
    const rows = await prisma.arsip.findMany({
      where: { pengguna_id: { not: null } },
      include: { pengguna: { include: { profil: true } } },
    });

    let updated = 0;

    for (const a of rows) {
      const newName = a.pengguna?.nama || a.nama_pelamar;
      const newEmail = a.pengguna?.email || a.email_pelamar;

      const needUpdate =
        (newName && newName !== a.nama_pelamar) ||
        (newEmail && newEmail !== a.email_pelamar);

      if (!needUpdate) continue;

      await prisma.arsip.update({
        where: { id: a.id },
        data: {
          nama_pelamar: newName || a.nama_pelamar,
          email_pelamar: newEmail || a.email_pelamar,
        },
      });

      updated++;
    }

    return { totalChecked: rows.length, updated };
  },
};