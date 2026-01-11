// app/backend/src/app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const authRoutes = require("./modules/auth/auth.routes");
const jobsRoutes = require("./modules/jobs/job.routes");
const applicationRoutes = require("./modules/application/application.routes");
const reportsRoutes = require("./modules/reports/reports.routes");
const messagesRoutes = require("./modules/messages/messages.routes");
const schedulesRoutes = require("./modules/schedules/schedules.routes");
const archivesRoutes = require("./modules/archives/archives.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const settingsRoutes = require("./modules/settings/settings.routes");

const app = express();

// ✅ 1) cookie parser dulu
app.use(cookieParser());

// ✅ 2) cors untuk credentials
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ 3) body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/schedules", schedulesRoutes);
app.use("/api/archives", archivesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes); // ✅ DIGABUNG DI SINI


app.get("/", (req, res) => {
  res.status(200).send("✅ HR Backend Service Running");
});

module.exports = app;
