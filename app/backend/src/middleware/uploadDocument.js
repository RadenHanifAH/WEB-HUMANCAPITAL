// src/middleware/uploadDocument.js
//
// ✅ UPDATE: sekarang pakai memoryStorage — dokumen profil (CV/portofolio)
// disimpan sebagai Data URI Base64 langsung di kolom DB (url_cv /
// url_portofolio, tipe LONGTEXT), BUKAN lagi ke disk. File dari sini
// diproses documents.service.js lewat file.buffer, bukan file.filename.
// Ini penting khususnya untuk Railway, karena disk container-nya
// ephemeral (hilang tiap redeploy) — jadi file tidak boleh disimpan
// ke disk sama sekali kalau mau persisten.

const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "cv" && file.mimetype !== "application/pdf") {
    return cb(new Error("CV harus berformat PDF"));
  }

  if (file.fieldname === "portfolio" && file.mimetype !== "application/pdf") {
    return cb(new Error("Portofolio harus berformat PDF"));
  }

  cb(null, true);
};

const uploadDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ✅ PENTING: export instance Multer mentah (BUKAN object berisi fungsi
// wrapper). documents.routes.js memanggil uploadDocument.fields([...]),
// yang HANYA ada di instance Multer asli seperti ini.
module.exports = uploadDocument;