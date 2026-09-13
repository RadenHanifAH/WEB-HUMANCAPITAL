// src/modules/activity-log/activityLog.helper.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── Label mapping untuk field yang enak dibaca manusia ──────────────────────

const FIELD_LABELS = {
  // pengajuan_sdm
  departemen: "Departemen",
  tanggal_permintaan: "Tanggal Permintaan",
  posisi: "Posisi",
  lokasi: "Lokasi",
  alasan: "Alasan Permintaan",
  jumlah: "Jumlah",
  jenis_kelamin: "Jenis Kelamin",
  level_pangkat: "Level / Pangkat",
  rentang_gaji: "Rentang Gaji",
  tgl_terpenuhi: "Tgl Terpenuhi",
  status_karyawan: "Status Karyawan",
  status_karyawan_keterangan: "Keterangan Status Karyawan",
  tugas_utama: "Tugas Utama",
  usia_min: "Usia Minimal",
  usia_maks: "Usia Maksimal",
  status_perkawinan: "Status Perkawinan",
  pendidikan_terakhir: "Pendidikan Terakhir",
  jurusan: "Jurusan",
  keahlian: "Keahlian",
  pengalaman: "Pengalaman",
  syarat_lain: "Syarat Lain",
  bahasa_asing: "Bahasa Asing",
  kemampuan_bahasa_asing: "Kemampuan Bahasa Asing",
  keahlian_komputer: "Keahlian Komputer",
  fasilitas: "Fasilitas",
  peta_kekuatan: "Peta Kekuatan Karyawan",
  status: "Status",
  catatan_admin: "Catatan Admin",
  ditinjau: "Tanggal Ditinjau",
  dikirim: "Tanggal Kirim",

  // lowongan
  judul: "Judul Lowongan",
  jenis: "Jenis Lowongan",
  deskripsi: "Deskripsi",
  persyaratan: "Persyaratan",
  tenggat: "Tenggat",
  departemen: "Departemen",

  // user
  nama: "Nama",
  email: "Email",
  peran: "Role",
  divisi: "Divisi",
  status_akun: "Status Akun",
  password: "Password",

  // lamaran
  tahap: "Tahap",
  skor: "Skor",
  tanggal_melamar: "Tanggal Melamar",
  nama_cv: "Nama CV",
  nama_portofolio: "Nama Portofolio",

  // arsip
  nama_pelamar: "Nama Pelamar",
  email_pelamar: "Email Pelamar",
  posisi: "Posisi",
  status_akhir: "Status Akhir",
  tanggal_keputusan: "Tanggal Keputusan",

  // jadwal_wawancara
  tanggal_waktu: "Tanggal & Waktu",
  durasi_menit: "Durasi (menit)",
  lokasi: "Lokasi",
  tautan_rapat: "Tautan Rapat",
  sudah_selesai: "Sudah Selesai",
  status_kehadiran: "Status Kehadiran",
  alasan_tidak_hadir: "Alasan Tidak Hadir",
  dikonfirmasi_oleh_pelamar: "Dikonfirmasi Pelamar",
  waktu_konfirmasi: "Waktu Konfirmasi",

  // hasil psikotes / wawancara
  kesimpulan: "Kesimpulan",
  skor_akhir: "Skor Akhir",
  tanggal_tes: "Tanggal Tes",
  tanggal_wawancara: "Tanggal Wawancara",
  jabatan_dilamar: "Jabatan Dilamar",
  pendidikan_terakhir: "Pendidikan Terakhir",
  tanggal_lahir: "Tanggal Lahir",
};

const SKIP_FIELDS = [
  "updated_at",
  "created_at",
  "id",
  "password",
  "hash_token_reset_password",
  "hash_refresh_token",
  "reset_password_kadaluarsa",
  "login_terakhir",
  "data_cv",
  "data_portofolio",
  "data_dokumen_pendukung",
  "mime_cv",
  "mime_portofolio",
  "mime_dokumen_pendukung",
  "ukuran_cv",
  "ukuran_portofolio",
  "ukuran_dokumen_pendukung",
];

// ✅ NEW: label tampilan pengganti untuk pelaku dengan role "pelamar".
// Sesuai permintaan: aksi yang secara teknis dipicu oleh pelamar (mis. klik
// link konfirmasi kehadiran di email) tetap dicatat di kolom `pengguna_id`
// (jadi masih bisa ditelusuri lewat relasi `pengguna` kalau perlu), TAPI
// nama_pelaku & peran_pelaku yang tersimpan/ditampilkan di log diseragamkan
// jadi "Administrator" / "admin".
const PELAMAR_DISPLAY_OVERRIDE = {
  nama: "Administrator",
  peran: "admin",
};

// ─── Helper: format value agar readable ───────────────────────────────────────

function formatValue(val) {
  if (val === null || val === undefined) return null;
  if (val === "") return "(kosong)";
  if (typeof val === "boolean") return val ? "Ya" : "Tidak";
  if (val instanceof Date) return val.toISOString();
  if (Array.isArray(val)) return val.length ? val : null;
  if (typeof val === "object") {
    try {
      const str = JSON.stringify(val);
      return str === "{}" ? null : val;
    } catch {
      return String(val);
    }
  }
  return val;
}

// ─── Helper: bandingkan dua snapshot, return field yang berubah ───────────────

function getChangedFields(before, after) {
  if (!before || !after) return [];

  const changes = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of keys) {
    if (SKIP_FIELDS.includes(key)) continue;

    const beforeVal = formatValue(before[key] ?? null);
    const afterVal = formatValue(after[key] ?? null);

    if (JSON.stringify(beforeVal) === JSON.stringify(afterVal)) continue;

    changes.push({
      field: key,
      label: FIELD_LABELS[key] || key,
      dari: beforeVal,
      ke: afterVal,
      tipe: "changed",
    });
  }

  return changes;
}

// ─── Helper: compute diff untuk semua jenis aksi ──────────────────────────────
// CREATE  → semua field di data_sesudah ditandai sebagai "added"
// DELETE  → semua field di data_sebelum ditandai sebagai "removed"
// UPDATE  → hanya field yang nilainya berubah
// APPROVE/REJECT/SUBMIT → sama kayak UPDATE

function computeChanges(aksi, data_sebelum, data_sesudah) {
  const upperAksi = String(aksi || "").toUpperCase();

  // CREATE → semua field baru
  if (upperAksi === "CREATE" && data_sesudah) {
    return Object.entries(data_sesudah)
      .filter(([key]) => !SKIP_FIELDS.includes(key))
      .map(([key, val]) => ({
        field: key,
        label: FIELD_LABELS[key] || key,
        dari: null,
        ke: formatValue(val),
        tipe: "added",
      }));
  }

  // DELETE → semua field dihapus
  if (upperAksi === "DELETE" && data_sebelum) {
    return Object.entries(data_sebelum)
      .filter(([key]) => !SKIP_FIELDS.includes(key))
      .map(([key, val]) => ({
        field: key,
        label: FIELD_LABELS[key] || key,
        dari: formatValue(val),
        ke: null,
        tipe: "removed",
      }));
  }

  // UPDATE / APPROVE / REJECT / SUBMIT → hanya field yang berubah
  return getChangedFields(data_sebelum, data_sesudah);
}

// ─── Core: tulis log aktivitas ke database ─────────────────────────────────────

async function logActivity({
  pengguna_id = null,
  aksi,
  modul,
  target_id = null,
  deskripsi = "",
  data_sebelum = null,
  data_sesudah = null,
  ip_address = null,
}) {
  try {
    let nama_pelaku = "Sistem";
    let peran_pelaku = "system";

    if (pengguna_id) {
      const pelaku = await prisma.pengguna.findUnique({
        where: { id: Number(pengguna_id) },
        select: { nama: true, peran: true },
      });
      if (pelaku) {
        nama_pelaku = pelaku.nama;
        peran_pelaku = pelaku.peran;

        // ✅ NEW: kalau yang melakukan aksi ini akunnya berperan "pelamar"
        // (mis. pelamar klik link konfirmasi kehadiran dari email),
        // tampilkan sebagai Administrator, bukan nama pelamar.
        // pengguna_id tetap disimpan apa adanya supaya identitas asli
        // masih bisa ditelusuri lewat relasi `pengguna` kalau dibutuhkan.
        if (peran_pelaku === "pelamar") {
          nama_pelaku = PELAMAR_DISPLAY_OVERRIDE.nama;
          peran_pelaku = PELAMAR_DISPLAY_OVERRIDE.peran;
        }
      }
    }

    // ✅ Compute diff perubahan SEKARANG, simpan ke kolom `perubahan`
    const perubahan = computeChanges(aksi, data_sebelum, data_sesudah);

    await prisma.log_aktivitas.create({
      data: {
        pengguna_id: pengguna_id ? Number(pengguna_id) : null,
        nama_pelaku,
        peran_pelaku,
        aksi,
        modul,
        target_id: target_id !== null ? Number(target_id) : null,
        deskripsi,
        data_sebelum: data_sebelum ?? undefined,
        data_sesudah: data_sesudah ?? undefined,
        perubahan: perubahan.length > 0 ? perubahan : undefined,
        ip_address,
      },
    });
  } catch (err) {
    console.error("❌ Gagal menulis log_aktivitas:", err.message);
  }
}

// ─── Helper: ambil IP dari request Express ────────────────────────────────────

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || null;
}

// ─── Helper: format ringkasan satu baris untuk display generik ────────────────

function formatLogSummary(log) {
  const pelaku = log.nama_pelaku || "Sistem";
  const changes =
    log.perubahan || getChangedFields(log.data_sebelum, log.data_sesudah);

  switch (log.aksi) {
    case "CREATE":
      return `${pelaku} membuat data baru`;
    case "UPDATE":
      if (!changes.length)
        return `${pelaku} memperbarui data (tidak ada perubahan nilai)`;
      if (changes.length === 1) return `${pelaku} mengubah ${changes[0].label}`;
      return `${pelaku} mengubah ${changes.length} field`;
    case "DELETE":
      return `${pelaku} menghapus data`;
    case "APPROVE":
      return `${pelaku} menyetujui pengajuan`;
    case "REJECT":
      return `${pelaku} menolak pengajuan`;
    case "SUBMIT":
      return `${pelaku} mengirim pengajuan untuk ditinjau`;
    default:
      return log.deskripsi || `${pelaku} melakukan ${log.aksi}`;
  }
}

module.exports = {
  logActivity,
  getClientIp,
  getChangedFields,
  computeChanges,
  formatLogSummary,
  formatValue,
  FIELD_LABELS,
};