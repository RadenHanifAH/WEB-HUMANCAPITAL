// src/middleware/uploadDocument.js
//
// Middleware ini TERPISAH dari middleware/upload.js yang dipakai module
// application (yang menyimpan ke memory/buffer untuk disimpan sebagai
// Base64 di DB). Middleware ini menyimpan file ke DISK, karena dokumen
// profil disimpan sebagai path/URL, bukan Base64.

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "../../uploads/documents");

// Pastikan folder upload ada
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || "unknown";
    const ext = path.extname(file.originalname);
    const fieldPrefix = file.fieldname; // "cv" atau "portfolio"
    const timestamp = Date.now();

    cb(null, `${fieldPrefix}_${userId}_${timestamp}${ext}`);
  },
});

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB
});

// ✅ PENTING: export instance Multer mentah (BUKAN object berisi fungsi
// wrapper). documents.routes.js memanggil uploadDocument.fields([...]),
// yang HANYA ada di instance Multer asli seperti ini.
module.exports = uploadDocument;