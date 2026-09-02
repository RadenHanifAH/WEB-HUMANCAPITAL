// src/modules/auth/mail.service.js
const axios = require("axios");

/* =========================
   Helper: From
   ========================= */
function getFrom() {
  const name = process.env.MAIL_FROM_NAME || "Human Capital";
  const email = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;
  return { name, email };
}

/* =========================================================
   ✅ Brevo (Sendinblue) HTTP API client
   Dipakai menggantikan Nodemailer SMTP karena banyak hosting
   (Railway, Vercel, dll) memblokir/membatasi outbound SMTP
   di port 587/465, sedangkan HTTPS (port 443) tidak diblokir.
   ========================================================= */
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const brevoEnabled = !!process.env.BREVO_API_KEY;

if (!brevoEnabled) {
  console.log(
    "[MAIL] BREVO_API_KEY belum dikonfigurasi di .env. Email tidak akan bisa terkirim."
  );
}

/* =========================================================
   ✅ Generic sender — dipakai oleh modul lain (mis. schedules)
   supaya tidak perlu bikin client Brevo sendiri lagi.
   Signature sama persis seperti versi SMTP sebelumnya, jadi
   pemanggil (sendOtpEmail, sendResetPasswordEmail, dll) tidak
   perlu diubah.
   ========================================================= */
async function sendMail({ to, subject, html, text }) {
  if (!brevoEnabled) {
    throw new Error("BREVO_API_KEY belum dikonfigurasi. Cek .env / environment variables.");
  }

  const from = getFrom();
  if (!from.email) throw new Error("MAIL_FROM_EMAIL belum di-set");

  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: { name: from.name, email: from.email },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text, // opsional, Brevo boleh terima salah satu (html/text)
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000, // 10 detik, biar tidak menggantung lama kalau ada masalah
      }
    );

    console.log("[MAIL] SEND SUCCESS", {
      to,
      subject,
      messageId: response.data?.messageId,
    });

    return {
      messageId: response.data?.messageId,
      accepted: [to],
      rejected: [],
      provider: "brevo",
    };
  } catch (e) {
    console.error("[MAIL] SEND FAILED", {
      to,
      subject,
      message: e?.response?.data?.message || e?.message,
      status: e?.response?.status,
      data: e?.response?.data,
    });
    throw e;
  }
}

/* =========================================================
   Public functions (khusus auth: OTP & reset password)
   — TIDAK ADA PERUBAHAN di bagian ini, tetap sama seperti kode asli
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