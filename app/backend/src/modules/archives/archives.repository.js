const prisma = require("../../config/prisma");

function getFinalStatusFromApp(app) {
  const s = String(app.stage || app.status || "").toLowerCase();
  if (s.includes("accepted")) return "accepted";
  if (s.includes("rejected")) return "rejected";
  return null;
}

module.exports = {
  // ✅ ambil arsip dari tabel Archive (bukan Application)
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
      }),
    ]);

    return { total, items, page: Number(page), pageSize: Number(pageSize) };
  },

  // ✅ Hapus arsip dari tabel Archive
  async deleteArchiveById(id) {
    return prisma.archive.delete({ where: { id: Number(id) } });
  },

  // ✅ INI YANG BIKIN DATA MASUK KE DB ARCHIVE
  async upsertArchiveFromApplication(applicationId) {
    const app = await prisma.application.findUnique({
      where: { id: Number(applicationId) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
      },
    });

    if (!app) throw new Error("Application tidak ditemukan");

    const finalStatus = getFinalStatusFromApp(app);
    if (!finalStatus) return null; // belum accepted/rejected

    const data = {
      applicationId: app.id,
      userId: app.user?.id ?? null,
      jobId: app.job?.id ?? null,
      applicantName: app.user?.name || "Unknown",
      applicantEmail: app.user?.email || "-",
      position: app.job?.title || "Unknown Position",
      finalStatus,
      decisionDate: app.updatedAt || new Date(),
      notes: app.notes || null,
    };

    return prisma.archive.upsert({
      where: { applicationId: app.id },
      create: data,
      update: data,
    });
  },

  // ✅ migrasi data lama: tarik semua accepted/rejected dari Application -> Archive
  async syncFromApplications() {
    const apps = await prisma.application.findMany({
      where: {
        OR: [
          { stage: { contains: "accepted" } },
          { stage: { contains: "rejected" } },
          { status: { contains: "accepted" } },
          { status: { contains: "rejected" } },
        ],
      },
      select: { id: true },
    });

    let synced = 0;
    for (const a of apps) {
      const row = await this.upsertArchiveFromApplication(a.id);
      if (row) synced++;
    }

    return { synced };
  },
};
