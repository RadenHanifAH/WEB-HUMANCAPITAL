const repo = require("./archives.repository");

function mapArchiveItem(row) {
  return {
    id: row.id,
    applicationId: row.applicationId,
    name: row.applicantName,
    email: row.applicantEmail,
    avatar: `https://i.pravatar.cc/100?u=${encodeURIComponent(row.applicantEmail || row.applicationId)}`,
    position: row.position,
    finalStatus: row.finalStatus === "accepted" ? "hired" : "rejected",
    decisionDate: row.decisionDate,
    notes: row.notes || "",
  };
}

async function getArchives(params) {
  const res = await repo.findArchives(params);
  return {
    total: res.total,
    page: res.page,
    pageSize: res.pageSize,
    items: res.items.map(mapArchiveItem),
  };
}

async function removeArchive(id) {
  return repo.deleteArchiveById(id);
}

async function syncArchives() {
  return repo.syncFromApplications();
}

// CSV fungsi kamu boleh tetap
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
