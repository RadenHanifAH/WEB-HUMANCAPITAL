const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Tentukan folder berdasarkan fieldname
    // CV masuk ke /uploads/cvs, Portfolio masuk ke /uploads/portfolios
    const folder = file.fieldname === "cv" ? "cvs" : "portfolios";
    const uploadPath = path.join(__dirname, `../uploads/${folder}`);

    // Buat folder secara otomatis jika belum ada (opsional tapi disarankan)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("File harus PDF"), false);
  }
};

const uploadFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Naikkan ke 5MB jika perlu (portofolio biasanya lebih besar)
  },
});

module.exports = uploadFiles;