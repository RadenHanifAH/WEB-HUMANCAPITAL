const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const repo = require("./settings.repository");

const BACKUP_DIR = path.join(__dirname, "../../uploads/backups");

function ensureDir() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Parse DATABASE_URL=mysql://root:raden23@localhost:3306/human_capital
function parseDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL belum di-set di .env");

  const u = new URL(raw);

  const user = decodeURIComponent(u.username || "");
  const password = decodeURIComponent(u.password || "");
  const host = u.hostname || "localhost";
  const port = u.port ? Number(u.port) : 3306;
  const database = (u.pathname || "").replace("/", "");

  if (!user) throw new Error("DATABASE_URL username kosong");
  if (!database) throw new Error("DATABASE_URL database kosong");

  return { user, password, host, port, database };
}

class SettingsService {
  async getSettings() {
    return repo.getSingleton();
  }

  async updateGeneral(payload) {
    const data = {
      companyName: payload.companyName ?? undefined,
      website: payload.website ?? undefined,
      location: payload.location ?? undefined,
      timezone: payload.timezone ?? undefined,
      lastUpdate: new Date().toISOString(),
    };
    return repo.update(data);
  }

  async updateNotifications(payload) {
    const data = {
      systemUpdateEmailEnabled:
        typeof payload.systemUpdateEmailEnabled === "boolean"
          ? payload.systemUpdateEmailEnabled
          : undefined,
      lastUpdate: new Date().toISOString(),
    };
    return repo.update(data);
  }

  async updateSystem(payload) {
    const data = {
      systemVersion: payload.systemVersion ?? undefined,
      database: payload.database ?? undefined,
      lastUpdate: new Date().toISOString(),
    };
    return repo.update(data);
  }

  async runBackup() {
    ensureDir();

    const cfg = parseDatabaseUrl();

    const now = new Date();
    const stamp =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      "_" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");

    const filename = `backup_${cfg.database}_${stamp}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    // tulis output dump ke file
    const writeStream = fs.createWriteStream(filepath, { encoding: "utf8" });

    // mysqldump args
    const args = [
      `-h${cfg.host}`,
      `-P${cfg.port}`,
      `-u${cfg.user}`,
      `-p${cfg.password}`, // hati-hati: ada di args (ok untuk local dev)
      "--routines",
      "--events",
      "--triggers",
      cfg.database,
    ];

    const dump = spawn("mysqldump", args, { shell: true });

    let stderr = "";
    dump.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    dump.stdout.pipe(writeStream);

    const exitCode = await new Promise((resolve, reject) => {
      dump.on("error", reject);
      dump.on("close", resolve);
    });

    writeStream.close();

    // Kalau gagal, hapus file kosong & lempar error
    if (exitCode !== 0) {
      try {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      } catch {}
      throw new Error(stderr || `mysqldump gagal exitCode=${exitCode}`);
    }

    // Update settings DB
    const updated = await repo.update({
      lastBackupAt: new Date(),
      lastBackupFile: filename,
      lastUpdate: new Date().toISOString(),
      database: "MySQL",
    });

    return { filename, lastBackupAt: updated.lastBackupAt };
  }

  async getBackupFilePath(filename) {
    // basic protection path traversal
    if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      throw new Error("Filename tidak valid");
    }

    const full = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(full)) throw new Error("File tidak ada");
    return full;
  }
}

module.exports = new SettingsService();
