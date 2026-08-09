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
   ✅ Nodemailer SMTP transporter
   ========================================================= */
const port = Number(process.env.SMTP_PORT || 587);
const secure = String(process.env.SMTP_SECURE || "false") === "true" || port === 465;

const smtpEnabled =
  !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

let transporter = null;

if (smtpEnabled) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure, // true kalau port 465, false kalau 587 (STARTTLS)

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },

    tls: {
      rejectUnauthorized: false,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

// Verify SMTP saat startup (skip di production biar startup tidak lambat/timeout kalau port diblokir hosting)
async function verifySmtpIfSafe() {
  const isProd = process.env.NODE_ENV === "production";

  if (!transporter) {
    console.log("[MAIL] SMTP belum dikonfigurasi (cek SMTP_HOST/SMTP_USER/SMTP_PASS di .env). Email tidak akan bisa terkirim.");
    return;
  }

  if (isProd) {
    console.log("[MAIL] Production detected. SMTP verify di-skip untuk menghindari timeout.");
    return;
  }

  try {
    // ✅ Verifikasi tetap jalan seperti biasa (memastikan koneksi SMTP
    // valid saat startup), hanya saja log "[SMTP] READY {...}" yang tadinya
    // muncul di terminal SUDAH DIHAPUS sesuai permintaan.
    await transporter.verify();
  } catch (e) {
    console.error("[SMTP] VERIFY FAILED", {
      message: e?.message,
      code: e?.code,
      responseCode: e?.responseCode,
      command: e?.command,
      response: e?.response,
    });
  }
}
verifySmtpIfSafe();

/* =========================================================
   ✅ Generic sender — dipakai oleh modul lain (mis. schedules)
   supaya tidak perlu bikin transporter Nodemailer sendiri lagi.
   ========================================================= */
async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    throw new Error("SMTP belum dikonfigurasi. Cek SMTP_HOST, SMTP_USER, SMTP_PASS di .env.");
  }

  const from = getFrom();
  if (!from.email) throw new Error("MAIL_FROM_EMAIL belum di-set");

  try {
    const info = await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("[SMTP] MAIL SENT", {
      to,
      subject,
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
      response: info?.response,
    });

    // ⚠️ Nodemailer kadang tidak throw walau server SMTP menolak alamat
    // tujuan — cek manual di sini supaya tidak silent-fail.
    if (info?.rejected && info.rejected.length > 0) {
      throw new Error(`Email ditolak oleh server SMTP untuk: ${info.rejected.join(", ")}`);
    }

    return {
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
      provider: "smtp",
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

module.exports = { sendMail, sendOtpEmail, sendResetPasswordEmail };