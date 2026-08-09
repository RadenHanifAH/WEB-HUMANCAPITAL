const fs = require("fs");
const path = require("path");
const repo = require("./documents.repository");

const UPLOAD_DIR = path.join(__dirname, "../../../uploads/documents");

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// Hapus file fisik lama di disk (dipakai saat CV/portofolio diganti)
const removeOldFile = (oldUrl) => {
  if (!oldUrl) return;
  if (!oldUrl.startsWith("/uploads/documents/")) return; // jangan hapus link eksternal

  const fileName = path.basename(oldUrl);
  const filePath = path.join(UPLOAD_DIR, fileName);

  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Gagal menghapus file lama:", err.message);
    }
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

  const existing = await repo.getByUserId(userId);
  if (existing?.url_cv) removeOldFile(existing.url_cv);

  const url_cv = `/uploads/documents/${file.filename}`;
  const nama_cv = file.originalname;

  return repo.upsertCv(userId, { url_cv, nama_cv });
};

/**
 * Set portofolio via FILE upload
 */
const uploadPortfolioFile = async (userId, file) => {
  if (!file) {
    throw new Error("File portofolio wajib diunggah (PDF)");
  }

  const existing = await repo.getByUserId(userId);
  if (existing?.url_portofolio) removeOldFile(existing.url_portofolio);

  const url_portofolio = `/uploads/documents/${file.filename}`;
  const nama_portofolio = file.originalname;

  return repo.upsertPortfolio(userId, { url_portofolio, nama_portofolio });
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

  const existing = await repo.getByUserId(userId);
  // Kalau sebelumnya berupa file upload, hapus file lama karena diganti link
  if (existing?.url_portofolio) removeOldFile(existing.url_portofolio);

  return repo.upsertPortfolio(userId, {
    url_portofolio: link.trim(),
    nama_portofolio: null, // null artinya ini link, bukan file upload
  });
};

const deleteCv = async (userId) => {
  const existing = await repo.getByUserId(userId);
  if (existing?.url_cv) removeOldFile(existing.url_cv);
  return repo.deleteCv(userId);
};

const deletePortfolio = async (userId) => {
  const existing = await repo.getByUserId(userId);
  if (existing?.url_portofolio) removeOldFile(existing.url_portofolio);
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