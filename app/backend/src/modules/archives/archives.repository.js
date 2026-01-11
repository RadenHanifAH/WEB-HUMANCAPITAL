const prisma = require("../../config/prisma");

function detectFinalStatus(app) {
  const s = String(app.status || "").toLowerCase();
  const st = String(app.stage || "").toLowerCase();

  // accepted
  if (
    s.includes("accept") ||
    st.includes("accept") ||
    s.includes("hired") ||
    st.includes("hired")
  ) {
    return "accepted";
  }

  // rejected
  if (s.includes("reject") || st.includes("reject")) {
    return "rejected";
  }

  return null;
}

module.exports = {
  // ✅ LIST ARCHIVES (join user.profile + job)
  async findArchives({ q, status, page = 1, pageSize = 10 }) {
    const text = (q || "").trim();
    const s = (status || "all").toLowerCase();

    const where = {};
    if (s !== "all") where.finalStatus = s;

    if (text) {
      where.OR = [
        { applicantName: { contains: text } },
        { applicantEmail: { contains: text } },
        { position: { contains: text } },
        { finalStatus: { contains: text } },
        { notes: { contains: text } },
      ];
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [total, items] = await Promise.all([
      prisma.archive.count({ where }),
      prisma.archive.findMany({
        where,
        orderBy: { decisionDate: "desc" },
        skip,
        take,
        include: {
          user: { include: { profile: true } }, // ✅ biar bisa ambil fullName & fotoProfile
          job: true,
        },
      }),
    ]);

    return { total, items, page: Number(page), pageSize: Number(pageSize) };
  },

  // ✅ DELETE 1 ARCHIVE
  async deleteArchiveById(id) {
    return prisma.archive.delete({ where: { id: Number(id) } });
  },

  // ✅ UPSERT archive dari 1 application
  async upsertArchiveFromApplication(applicationId) {
    const app = await prisma.application.findUnique({
      where: { id: Number(applicationId) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
      },
    });

    if (!app) throw new Error("Application tidak ditemukan");

    const finalStatus = detectFinalStatus(app);
    if (!finalStatus) return null;

    const data = {
      applicationId: app.id,
      userId: app.user?.id ?? null,
      jobId: app.job?.id ?? null,
      applicantName: app.user?.name || "Unknown",
      applicantEmail: app.user?.email || "-",
      position: app.job?.title || "Unknown Position",
      finalStatus, // accepted / rejected
      decisionDate: app.updatedAt || new Date(),
      notes: app.notes || null,
    };

    return prisma.archive.upsert({
      where: { applicationId: app.id },
      create: data,
      update: data,
    });
  },

  // ✅ SYNC semua accepted/rejected dari Application -> Archive (migrasi data lama)
  async syncFromApplications() {
    const apps = await prisma.application.findMany({
      where: {
        OR: [
          { status: { contains: "accept", mode: "insensitive" } },
          { stage: { contains: "accept", mode: "insensitive" } },
          { status: { contains: "reject", mode: "insensitive" } },
          { stage: { contains: "reject", mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    let synced = 0;
    for (const a of apps) {
      const row = await this.upsertArchiveFromApplication(a.id);
      if (row) synced++;
    }

    return { totalFound: apps.length, synced };
  },

  // ============================================================
  // ✅ NEW: UPDATE SNAPSHOT NAME/EMAIL IN ARCHIVE (ikut profile)
  // ============================================================

  // ✅ update snapshot hanya untuk archive yang sedang tampil (by ids)
  async syncSnapshotFromUserProfileByIds(archiveIds = []) {
    const ids = (Array.isArray(archiveIds) ? archiveIds : [])
      .map((x) => Number(x))
      .filter(Boolean);

    if (!ids.length) return { updated: 0 };

    // ambil archive yang diminta + join user & profile
    const rows = await prisma.archive.findMany({
      where: { id: { in: ids } },
      include: { user: { include: { profile: true } } },
    });

    let updated = 0;

    for (const a of rows) {
      // target snapshot terbaru
      const newName =
        a.user?.profile?.fullName ||
        a.user?.name ||
        a.applicantName;

      const newEmail =
        a.user?.email ||
        a.applicantEmail;

      const needUpdate =
        (newName && newName !== a.applicantName) ||
        (newEmail && newEmail !== a.applicantEmail);

      if (!needUpdate) continue;

      await prisma.archive.update({
        where: { id: a.id },
        data: {
          applicantName: newName || a.applicantName,
          applicantEmail: newEmail || a.applicantEmail,
        },
      });

      updated++;
    }

    return { updated };
  },

  // ✅ update snapshot untuk SEMUA archive (kalau kamu mau 1x sync besar)
  async syncSnapshotAll() {
    const rows = await prisma.archive.findMany({
      where: { userId: { not: null } },
      include: { user: { include: { profile: true } } },
    });

    let updated = 0;

    for (const a of rows) {
      const newName =
        a.user?.profile?.fullName ||
        a.user?.name ||
        a.applicantName;

      const newEmail =
        a.user?.email ||
        a.applicantEmail;

      const needUpdate =
        (newName && newName !== a.applicantName) ||
        (newEmail && newEmail !== a.applicantEmail);

      if (!needUpdate) continue;

      await prisma.archive.update({
        where: { id: a.id },
        data: {
          applicantName: newName || a.applicantName,
          applicantEmail: newEmail || a.applicantEmail,
        },
      });

      updated++;
    }

    return { totalChecked: rows.length, updated };
  },
};
