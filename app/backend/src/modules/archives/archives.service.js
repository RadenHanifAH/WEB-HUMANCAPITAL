const repo = require("./archives.repository");

function mapArchiveItem(row) {
  const profileName = row.user?.profile?.fullName;
  const userName = row.user?.name;
  const userEmail = row.user?.email;

  return {
    id: row.id,
    applicationId: row.applicationId,

    // ✅ nama mengikuti profile
    name: profileName || userName || row.applicantName || "-",
    email: userEmail || row.applicantEmail || "-",

    user: row.user
      ? {
          name: row.user.name,
          email: row.user.email,
          profile: row.user.profile
            ? {
                fullName: row.user.profile.fullName,
                fotoProfile: row.user.profile.fotoProfile,
              }
            : null,
        }
      : null,

    job: row.job ? { title: row.job.title } : null,

    position: row.position,
    finalStatus: row.finalStatus === "accepted" ? "hired" : "rejected",
    decisionDate: row.decisionDate,
    notes: row.notes || "",
  };
}

async function getArchives(params) {
  const res = await repo.findArchives(params);

  // ✅ AUTO UPDATE SNAPSHOT DI DB (agar HeidiSQL ikut berubah)
  // hanya update untuk item yang sedang ditampilkan (page ini)
  const ids = (res.items || []).map((x) => x.id);
  try {
    await repo.syncSnapshotFromUserProfileByIds(ids);
  } catch (e) {
    // jangan bikin list arsip gagal hanya karena sync snapshot gagal
    console.error("Sync snapshot archive failed:", e?.message || e);
  }

  // (opsional) ambil ulang supaya yang dikirim ke FE sudah updated dari DB
  // tapi sebenarnya tidak wajib karena map sudah pakai join profile juga
  // kalau mau benar-benar yakin snapshot sudah kepakai, uncomment ini:
  // const res2 = await repo.findArchives(params);
  // const items = res2.items || [];

  return {
    total: res.total,
    page: res.page,
    pageSize: res.pageSize,
    items: (res.items || []).map(mapArchiveItem),
  };
}

async function removeArchive(id) {
  return repo.deleteArchiveById(id);
}

async function syncArchives() {
  return repo.syncFromApplications();
}

function escapeCSV(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function formatDateId(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID");
}

function generateArchiveCSV(items) {
  const headers = ["Nama", "Email", "Posisi", "Status", "Tanggal Keputusan"];
  const rows = items.map((a) => {
    const statusLabel = a.finalStatus === "hired" ? "Diterima" : "Ditolak";
    return [
      escapeCSV(a.name),
      escapeCSV(a.email),
      escapeCSV(a.position),
      escapeCSV(statusLabel),
      escapeCSV(formatDateId(a.decisionDate)),
    ].join(",");
  });
  return [headers.map(escapeCSV).join(","), ...rows].join("\n");
}

module.exports = {
  getArchives,
  removeArchive,
  syncArchives,
  generateArchiveCSV,
};
