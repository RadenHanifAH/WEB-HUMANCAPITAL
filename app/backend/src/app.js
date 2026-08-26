// app/backend/src/app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");

dotenv.config();

const authRoutes = require("./modules/auth/auth.routes");
const jobsRoutes = require("./modules/jobs/job.routes");
const applicationRoutes = require("./modules/application/application.routes");
const reportsRoutes = require("./modules/reports/reports.routes");
const schedulesRoutes = require("./modules/schedules/schedules.routes");
const archivesRoutes = require("./modules/archives/archives.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const settingsRoutes = require("./modules/settings/settings.routes");
const profileRoutes = require("./modules/profile/profile.routes");
const documentsRoutes = require("./modules/documents/documents.routes");
const divisionRoutes = require("./modules/division/division.routes"); // ✅ NEW
const adminPengajuanRoutes = require("./modules/pengajuan/admin.pengajuan.routes.js");
const penilaianRoutes = require("./modules/penilaian/penilaian.routes"); 
const usersRoutes = require("./modules/users/users.routes");
const notificationsRoutes = require("./modules/notifications/notifications.routes.js");

const app = express();

// ✅ 1) cookie parser dulu
app.use(cookieParser());

// ✅ 2) cors untuk credentials
app.use(
  cors({
    origin: ["https://syaamil-careers.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);

// ✅ 3) body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ serve uploads (folder ini juga menampung src/uploads/documents milik module documents)
const UPLOADS_DIR = path.join(__dirname, "uploads");
// console.log("=== DEBUG: serving uploads from:", UPLOADS_DIR);
// console.log(
//   "=== DEBUG: certificates folder exists?",
//   require("fs").existsSync(path.join(UPLOADS_DIR, "certificates")),
// );
// console.log(
//   "=== DEBUG: files in certificates:",
//   require("fs").existsSync(path.join(UPLOADS_DIR, "certificates"))
//     ? require("fs").readdirSync(path.join(UPLOADS_DIR, "certificates"))
//     : "FOLDER NOT FOUND",
// );
app.use("/api/uploads", express.static(path.join(__dirname, "..", "uploads")));
// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/profile/documents", documentsRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/schedules", schedulesRoutes);
app.use("/api/archives", archivesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/divisi", divisionRoutes); // ✅ NEW
app.use("/api/admin/pengajuan", adminPengajuanRoutes);
app.use("/api/penilaian", penilaianRoutes); // ✅ NEW
app.use("/api/users", usersRoutes);
app.use("/api/notifications", notificationsRoutes);


app.get("/", (req, res) => {
  res.status(200).send("✅ HR Backend Service Running");
});

// ✅ NEW: Error handler khusus Multer — menangkap error dari SEMUA middleware
// upload (uploadDocument milik module documents, uploadCertificate milik
// module profile, middleware upload milik module application, dst), supaya
// pesan error yang dikirim ke frontend jelas (mis. "Ukuran file maksimal
// 5MB"), bukan 500 generic tanpa keterangan seperti yang terjadi sebelumnya.
// Middleware error HARUS didaftarkan setelah semua route (Express mengenali
// middleware 4-argumen sebagai error handler dan hanya dipanggil saat ada
// error yang di-pass lewat next(err) — termasuk error yang dilempar Multer).
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Ukuran file terlalu besar. Maksimal 5MB.",
      });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    console.error("Unhandled error:", err);
    return res.status(500).json({ message: err.message || "Terjadi kesalahan pada server" });
  }
  next();
});

module.exports = app;