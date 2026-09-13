// src/modules/auth/mail.service.js
const nodemailer = require("nodemailer");

/* =========================
   Helper: From
   ========================= */
function getFrom() {
  const name = process.env.MAIL_FROM_NAME || "Human Capital";
  const email = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;
  return { name, email };
}

/* =========================================================
   Gmail SMTP transporter (via nodemailer)
   Catatan: beberapa hosting (Railway, Vercel serverless, dll)
   memblokir outbound port 587/465. Kalau nanti kamu deploy ke
   platform seperti itu dan email gagal terkirim tanpa error
   jelas / timeout, kemungkinan besar itu penyebabnya — solusi
   balik ke provider berbasis HTTPS API (Brevo, Resend, dll).
   ========================================================= */
const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

if (!smtpConfigured) {
  console.log(
    "[MAIL] SMTP_USER / SMTP_PASS belum dikonfigurasi di .env. Email tidak akan bisa terkirim."
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true kalau pakai port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* =========================================================
   Generic sender — dipakai oleh modul lain (mis. schedules)
   ========================================================= */
async function sendMail({ to, subject, html, text }) {
  if (!smtpConfigured) {
    throw new Error("SMTP_USER/SMTP_PASS belum dikonfigurasi. Cek .env / environment variables.");
  }

  const from = getFrom();
  if (!from.email) throw new Error("MAIL_FROM_EMAIL belum di-set");

  try {
    const info = await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to,
      subject,
      html,
      text,
    });

    console.log("[MAIL] SEND SUCCESS", {
      to,
      subject,
      messageId: info.messageId,
    });

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      provider: "gmail-smtp",
    };
  } catch (e) {
    console.error("[MAIL] SEND FAILED", {
      to,
      subject,
      message: e?.message,
      code: e?.code,
      responseCode: e?.responseCode,
      command: e?.command,
      response: e?.response,
    });
    throw e;
  }
}

/* =========================================================
   Public functions (khusus auth: OTP & reset password)
   — TIDAK ADA PERUBAHAN, tetap sama seperti kode asli
   ========================================================= */
async function sendOtpEmail(to, otp) {
  const subject = "Kode OTP Verifikasi Email";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Verifikasi Email</h2>
      <p>Kode OTP kamu:</p>
      <div style="font-size:26px;font-weight:800;letter-spacing:6px">${otp}</div>
      <p>OTP berlaku <b>5 menit</b>.</p>
      <p>Jika kamu tidak meminta OTP, abaikan email ini.</p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

async function sendResetPasswordEmail(to, resetLink) {
  const subject = "Reset Password";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Reset Password</h2>
      <p>Klik link berikut untuk reset password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Link berlaku <b>15 menit</b>.</p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

/* =========================================================
   BARU 1 — Email jadwal wawancara ke PELAMAR
   ========================================================= */
async function sendJadwalWawancaraEmail(to, data) {
  const subject = `Undangan ${data.jenisLabel} - ${data.posisi} | Syaamil Group`;

  const lokasiSection = data.tautanRapat
    ? `<tr>
         <td style="padding:8px 0;color:#64748b;vertical-align:top;width:130px">Tautan Rapat</td>
         <td style="padding:8px 0"><a href="${data.tautanRapat}" style="color:#059669;font-weight:700;word-break:break-all">${data.tautanRapat}</a></td>
       </tr>`
    : `<tr>
         <td style="padding:8px 0;color:#64748b;vertical-align:top;width:130px">Lokasi</td>
         <td style="padding:8px 0;font-weight:700">${data.lokasi || "-"}</td>
       </tr>`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#334155;max-width:560px">
      <h2 style="margin:0 0 4px;color:#0f172a">Undangan ${data.jenisLabel}</h2>
      <p style="margin:0 0 16px">Halo <b>${data.namaPelamar}</b>,</p>

      <p style="margin:0 0 16px">
        Lamaran kamu untuk posisi <b>${data.posisi}</b> telah lanjut ke tahap selanjutnya.
        Berikut detail jadwalnya:
      </p>

      <table style="border-collapse:collapse;width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:12px 16px;color:#64748b;width:130px">Kegiatan</td>
          <td style="padding:12px 16px;font-weight:700">${data.jenisLabel}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#64748b;border-top:1px solid #e2e8f0">Waktu</td>
          <td style="padding:12px 16px;font-weight:700;border-top:1px solid #e2e8f0">${data.tanggalWaktu}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#64748b;border-top:1px solid #e2e8f0">Durasi</td>
          <td style="padding:12px 16px;border-top:1px solid #e2e8f0">&plusmn; ${data.durasiMenit || 60} menit</td>
        </tr>
        ${lokasiSection}
      </table>

      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:14px 18px;margin:18px 0">
        <p style="margin:0">
          <b>Penting:</b> Mohon konfirmasi kehadiranmu (Hadir / Tidak Bisa Hadir)
          melalui menu <b>"Lamaran Saya"</b> di website Syaamil Group —
          bukan dengan membalas email ini.
        </p>
      </div>

      <p style="margin:0 0 4px">Terima kasih,<br/><b>Human Capital — Syaamil Group</b></p>
      <p style="margin:0;color:#94a3b8;font-size:12px">Email ini dikirim otomatis oleh sistem, mohon tidak dibalas.</p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

/* =========================================================
   BARU 2 — Notifikasi konfirmasi kehadiran ke HRD
   ========================================================= */
async function sendKonfirmasiKehadiranEmail(to, data) {
  const hadir = data.status === "hadir";

  const subject = hadir
    ? `[Konfirmasi Hadir] ${data.namaPelamar} - ${data.posisi}`
    : `[Tidak Bisa Hadir] ${data.namaPelamar} - ${data.posisi}`;

  const kotakStatus = hadir
    ? `<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:14px 18px;margin:18px 0">
         <p style="margin:0;color:#065f46"><b>${data.namaPelamar} mengonfirmasi HADIR</b> pada jadwal di atas.</p>
       </div>`
    : `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;margin:18px 0">
         <p style="margin:0;color:#991b1b"><b>${data.namaPelamar} menyatakan TIDAK BISA HADIR.</b></p>
         ${data.alasan ? `<p style="margin:8px 0 0;color:#991b1b"><b>Alasan:</b> ${data.alasan}</p>` : ""}
       </div>`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#334155;max-width:560px">
      <h2 style="margin:0 0 4px;color:#0f172a">Konfirmasi Kehadiran Pelamar</h2>
      <p style="margin:0 0 16px">Pelamar telah merespons jadwal berikut:</p>

      <table style="border-collapse:collapse;width:100%;background:#f8fafc;border:1px solid #e2e8f0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:12px 16px;color:#64748b;width:130px">Pelamar</td>
          <td style="padding:12px 16px;font-weight:700">${data.namaPelamar}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#64748b;border-top:1px solid #e2e8f0">Posisi</td>
          <td style="padding:12px 16px;border-top:1px solid #e2e8f0">${data.posisi}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#64748b;border-top:1px solid #e2e8f0">Kegiatan</td>
          <td style="padding:12px 16px;border-top:1px solid #e2e8f0">${data.jenisLabel || "-"}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#64748b;border-top:1px solid #e2e8f0">Jadwal</td>
          <td style="padding:12px 16px;border-top:1px solid #e2e8f0">${data.tanggalWaktu || "-"}</td>
        </tr>
      </table>

      ${kotakStatus}

      <p style="margin:0;color:#94a3b8;font-size:12px">Notifikasi otomatis dari sistem rekrutmen Syaamil Group.</p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

module.exports = {
  sendMail,
  sendOtpEmail,
  sendResetPasswordEmail,
  sendJadwalWawancaraEmail,
  sendKonfirmasiKehadiranEmail,
};