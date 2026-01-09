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

const app = express();

// ===== Middleware Global =====
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ⛔ JSON hanya untuk non-upload
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ WAJIB: serve folder uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/schedules", schedulesRoutes);
app.use("/api/archives", archivesRoutes);



// ===== Default =====
app.get("/", (req, res) => {
  res.status(200).send("✅ HR Backend Service Running");
});

module.exports = app;
