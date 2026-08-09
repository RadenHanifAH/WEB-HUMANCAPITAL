const repo = require("./archives.repository");

function mapArchiveItem(row) {
  const profil = row.pengguna?.profil;
  const nama = row.pengguna?.nama;
  const userEmail = row.pengguna?.email;

  return {
    id: row.id,
    applicationId: row.lamaran_id,
    lamaranId: row.lamaran_id,

    name: nama || row.nama_pelamar || "-",
    email: userEmail || row.email_pelamar || "-",

    profile: profil
      ? {
          NIK: profil.nik || null,
          gender: profil.jenis_kelamin || null,
          nomorHp: profil.nomor_hp || null,
          tempatLahir: profil.tempat_lahir || null,
          tanggalLahir: profil.tanggal_lahir || null,
          alamat: profil.alamat || null,
          fotoProfile: profil.foto_profil || null,
          about: profil.tentang || null,
        }
      : null,

    user: row.pengguna
      ? { nama: row.pengguna.nama, email: row.pengguna.email }
      : null,

    job: row.lowongan ? { title: row.lowongan.judul } : null,

    position: row.posisi,
    finalStatus: row.status_akhir === "Diterima" ? "hired" : "rejected",
    decisionDate: row.tanggal_keputusan,
    // ✅ FIX: notes dihapus karena catatan sudah dihapus dari schema

    cvDownloadUrl: row.lamaran_id
      ? `/api/archives/${row.id}/file?type=cv`
      : null,
    portfolioDownloadUrl: row.lamaran_id
      ? `/api/archives/${row.id}/file?type=portfolio`
      : null,

    workExperiences: row.pengguna?.pengalaman_kerja || [],
    educations: row.pengguna?.pendidikan || [],
    organizations: row.pengguna?.organisasi || [],
    certificates: row.pengguna?.sertifikat || [],
    skills: row.pengguna?.keahlian_pengguna || [],
  };
}

async function getArchives(params) {
  // ❌ Auto-sync sudah tidak aktif
  // try {
  //   await repo.syncFromApplications();
  // } catch (e) {
  //   console.error("Auto-sync archive gagal:", e?.message || e);
  // }

  const res = await repo.findArchives(params);

  const ids = (res.items || []).map((x) => x.id);
  try {
    await repo.syncSnapshotFromUserProfileByIds(ids);
  } catch (e) {
    console.error("Sync snapshot archive failed:", e?.message || e);
  }

  return {
    total: res.total,
    page: res.page,
    pageSize: res.pageSize,
    items: (res.items || []).map(mapArchiveItem),
  };
}

async function getArchivePositions() {
  return repo.getDistinctPositions();
}

async function getArchiveDetail(id) {
  const row = await repo.findArchiveById(id);
  if (!row) throw new Error("Arsip tidak ditemukan");
  return mapArchiveItem(row);
}

async function downloadArchiveFile(id, type = "cv") {
  const app = await repo.findFileByArchiveId(id);
  if (!app) throw new Error("File tidak ditemukan");

  let base64, name, mime;

  if (type === "portfolio") {
    base64 = app.data_portofolio;
    name = app.nama_portofolio || "portfolio.pdf";
    mime = app.mime_portofolio || "application/pdf";
  } else {
    base64 = app.data_cv;
    name = app.nama_cv || "cv.pdf";
    mime = app.mime_cv || "application/pdf";
  }

  if (!base64) throw new Error(`File ${type} tidak tersedia`);

  return { base64, name, mime };
}

async function removeArchive(id) {
  return repo.deleteArchiveById(id);
}

async function syncArchives() {
  return repo.syncFromApplications();
}

async function archiveIfFinal(lamaranId) {
  return repo.upsertArchiveFromApplication(lamaranId);
}

function escapeCSV(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function escapeCSVAsText(v) {
  if (v === null || v === undefined || v === "") return "";
  const s = String(v).replace(/"/g, '""');
  return `="${s}"`;
}

function formatDateId(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID");
}

function generateArchiveCSV(items) {
  const headers = [
    "Nama",
    "Email",
    "NIK",
    "No. HP",
    "Posisi",
    "Status",
    "Tanggal Keputusan",
  ];
  const rows = items.map((a) => {
    const statusLabel = a.finalStatus === "hired" ? "Diterima" : "Ditolak";
    return [
      escapeCSV(a.name),
      escapeCSV(a.email),
      escapeCSVAsText(a.profile?.NIK),
      escapeCSVAsText(a.profile?.nomorHp),
      escapeCSV(a.position),
      escapeCSV(statusLabel),
      escapeCSV(formatDateId(a.decisionDate)),
    ].join(",");
  });
  return [headers.map(escapeCSV).join(","), ...rows].join("\n");
}

module.exports = {
  getArchives,
  getArchivePositions,
  getArchiveDetail,
  downloadArchiveFile,
  removeArchive,
  syncArchives,
  archiveIfFinal,
  generateArchiveCSV,
};