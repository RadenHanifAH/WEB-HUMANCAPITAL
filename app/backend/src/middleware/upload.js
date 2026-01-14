const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(), // ✅ masuk RAM
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // kalau kamu mau khusus PDF:
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("File harus PDF"), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
