const repo = require("./documents.repository");
const prisma = require("../../config/prisma");

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// ✅ Ubah file upload (buffer di memory, dari multer.memoryStorage())
// menjadi Data URI base64, supaya tersimpan langsung di kolom DB
// (url_cv / url_portofolio) — tidak lagi ditulis ke disk lokal server,
// jadi tidak akan hilang saat Railway redeploy/restart container.
const fileToDataUri = (file) => {
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
};

const guessMimeFromName = (name) => {
  if (!name) return "application/pdf";
  const ext = String(name).toLowerCase().split(".").pop();
  if (ext === "pdf") return "application/pdf";
  return "application/octet-stream";
};

// ✅ NEW: sinkronkan CV/portofolio yang baru diupload ke SEMUA lamaran
// milik user yang masih AKTIF (belum Ditolak / belum Diterima). Supaya
// admin yang membuka detail lamaran ("Lamaran Saya") juga melihat versi
// CV/portofolio TERBARU, bukan snapshot lama di saat user pertama kali
// melamar.
//
// Lamaran yang statusnya sudah final (Ditolak / Diterima) SENGAJA tidak
// disentuh — supaya riwayat CV yang dipakai HR mengambil keputusan tetap
// utuh sebagai snapshot historis. Kalau ke depan mau semua ikut
// disinkronkan (termasuk yang sudah final), tinggal hapus filter status
// di bawah.
const syncActiveApplications = async (userId, { field, base64, mime, name, size }) => {
  if (!base64) return;

  const isCv = field === "cv";

  const data = isCv
    ? {
        data_cv: base64,
        mime_cv: mime,
        nama_cv: name,
        ukuran_cv: size,
      }
    : {
        data_portofolio: base64,
        mime_portofolio: mime,
        nama_portofolio: name,
        ukuran_portofolio: size,
      };

  await prisma.lamaran.updateMany({
    where: {
      pengguna_id: Number(userId),
      status: { not: "Diterima" },
      NOT: { status: { startsWith: "rejected-at-" } },
    },
    data,
  });
};

const getDocuments = (userId) => repo.getByUserId(userId);

/**
 * Upload CV (selalu berupa file PDF yang diupload, bukan link)
 */
const uploadCv = async (userId, file) => {
  if (!file) {
    throw new Error("File CV wajib diunggah (PDF)");
  }

  // Tidak perlu lagi removeOldFile() — tidak ada file fisik di disk,
  // upsert ke DB otomatis menimpa Data URI lama dengan yang baru.
  const url_cv = fileToDataUri(file);
  const nama_cv = file.originalname;

  const result = await repo.upsertCv(userId, { url_cv, nama_cv });

  // ✅ Sinkronkan ke lamaran aktif milik user ini
  await syncActiveApplications(userId, {
    field: "cv",
    base64: file.buffer.toString("base64"),
    mime: file.mimetype || guessMimeFromName(nama_cv),
    name: nama_cv,
    size: file.buffer.length,
  });

  return result;
};

/**
 * Set portofolio via FILE upload
 */
const uploadPortfolioFile = async (userId, file) => {
  if (!file) {
    throw new Error("File portofolio wajib diunggah (PDF)");
  }

  const url_portofolio = fileToDataUri(file);
  const nama_portofolio = file.originalname;

  const result = await repo.upsertPortfolio(userId, {
    url_portofolio,
    nama_portofolio,
  });

  // ✅ Sinkronkan ke lamaran aktif milik user ini
  await syncActiveApplications(userId, {
    field: "portfolio",
    base64: file.buffer.toString("base64"),
    mime: file.mimetype || guessMimeFromName(nama_portofolio),
    name: nama_portofolio,
    size: file.buffer.length,
  });

  return result;
};

/**
 * Set portofolio via LINK eksternal (misal Google Drive, Behance, dll)
 */
const setPortfolioLink = async (userId, link) => {
  if (!link || !link.trim()) {
    throw new Error("Link portofolio wajib diisi");
  }

  if (!isValidUrl(link.trim())) {
    throw new Error("Link portofolio tidak valid, gunakan format URL (https://...)");
  }

  // ⚠️ Catatan: portofolio berupa LINK eksternal tidak disimpan sebagai
  // file/base64, jadi tidak ada yang perlu disinkronkan ke tabel lamaran
  // (kolom data_portofolio di lamaran memang khusus untuk file upload).
  return repo.upsertPortfolio(userId, {
    url_portofolio: link.trim(),
    nama_portofolio: null, // null artinya ini link, bukan file upload
  });
};

const deleteCv = async (userId) => {
  return repo.deleteCv(userId);
};

const deletePortfolio = async (userId) => {
  return repo.deletePortfolio(userId);
};

module.exports = {
  getDocuments,
  uploadCv,
  uploadPortfolioFile,
  setPortfolioLink,
  deleteCv,
  deletePortfolio,
};