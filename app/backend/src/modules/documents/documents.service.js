const repo = require("./documents.repository");

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

  return repo.upsertCv(userId, { url_cv, nama_cv });
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