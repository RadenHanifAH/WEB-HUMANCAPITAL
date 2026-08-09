const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");
const CERTIFICATE_DIR = path.join(UPLOAD_ROOT, "certificates");

// Pastikan folder tujuan ada
if (!fs.existsSync(CERTIFICATE_DIR)) {
  fs.mkdirSync(CERTIFICATE_DIR, { recursive: true });
}

const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

// Bersihkan nama file asli dari karakter yang tidak aman untuk nama file di disk,
// tapi tetap dipertahankan bentuknya supaya masih bisa dibaca manusia.
const sanitizeOriginalName = (name) => {
  const base = String(name || "file")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, ""); // buang aksen/diakritik

  return base
    .replace(/[^a-zA-Z0-9.\-_ ]/g, "") // hanya izinkan karakter aman
    .trim()
    .replace(/\s+/g, "_") // spasi -> underscore
    .slice(0, 100); // batasi panjang supaya nama file tidak kepanjangan
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CERTIFICATE_DIR);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || "anon";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    const safeOriginalName = sanitizeOriginalName(file.originalname);
    const finalName = `cert-${userId}-${unique}__${safeOriginalName}`;

    cb(null, finalName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error("Format file harus JPG, PNG, atau PDF"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, samakan dengan frontend
});

// Path relatif yang disimpan ke DB & dikirim ke client, contoh:
// /uploads/certificates/cert-1-xxx__Nama_Asli.pdf
const toPublicPath = (filename) => `/uploads/certificates/${filename}`;

// Hapus file lama dari disk (dipakai saat update/replace atau delete record)
const removeCertificateFile = (publicPath) => {
  if (!publicPath) return;
  const filename = path.basename(publicPath);
  const fullPath = path.join(CERTIFICATE_DIR, filename);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Gagal menghapus file sertifikat:", err.message);
    }
  });
};

module.exports = {
  uploadCertificate: upload.single("certificateFile"),
  toPublicPath,
  removeCertificateFile,
};