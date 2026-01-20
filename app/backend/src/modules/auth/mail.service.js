// src/modules/auth/mail.service.js
const axios = require("axios");
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
   ✅ OPTION A: Brevo API (recommended for Railway hosting)
   - Uses HTTPS (443) so it won't be blocked like SMTP 587
   ========================================================= */
const BREVO_API_KEY = process.env.BREVO_API_KEY;

async function sendViaBrevoApi({ to, subject, html }) {
  const from = getFrom();
  if (!from.email) throw new Error("MAIL_FROM_EMAIL belum di-set");

  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: from.name, email: from.email },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
          accept: "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("[BREVO API] SENT", {
      to,
      messageId: res?.data?.messageId,
    });

    return res.data;
  } catch (e) {
    console.error("[BREVO API] FAILED", {
      to,
      message: e?.message,
      status: e?.response?.status,
      data: e?.response?.data,
    });
    throw e;
  }
}

/* =========================================================
   ✅ OPTION B: SMTP (fallback - usually works locally)
   ========================================================= */
const port = Number(process.env.SMTP_PORT || 587);
const secure = port === 465;

const smtpEnabled = !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

const transporter = smtpEnabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

      pool: true,
      maxConnections: 2,
      maxMessages: 50,

      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 15000,

      // TLS helper
      requireTLS: true,
      tls: {
        servername: process.env.SMTP_HOST,
        rejectUnauthorized: false,
      },
    })
  : null;

// Jangan verify SMTP kalau di production Railway (karena diblok & bikin startup error)
async function verifySmtpIfSafe() {
  const isProd = process.env.NODE_ENV === "production";

  // ✅ kalau ada BREVO_API_KEY, kita pakai API saja (no need verify SMTP)
  if (BREVO_API_KEY) {
    console.log("[MAIL] Using Brevo API (SMTP skipped)");
    return;
  }

  // ✅ di production & SMTP sering diblok -> skip verify
  if (isProd) {
    console.log("[MAIL] Production detected. SMTP verify skipped to avoid timeouts.");
    return;
  }

  if (!transporter) {
    console.log("[MAIL] SMTP not configured. Skipping verify.");
    return;
  }

  try {
    await transporter.verify();
    console.log("[SMTP] READY", {
      host: process.env.SMTP_HOST,
      port,
      secure,
      user: process.env.SMTP_USER,
    });
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
   Public functions
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

  // ✅ priority: Brevo API
  if (BREVO_API_KEY) {
    return sendViaBrevoApi({ to, subject, html });
  }

  // ✅ fallback: SMTP
  if (!transporter) {
    throw new Error("SMTP belum dikonfigurasi dan BREVO_API_KEY tidak ada.");
  }

  try {
    const from = getFrom();
    const info = await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to,
      subject,
      html,
    });

    console.log("[SMTP] OTP SENT", {
      to,
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
    });

    return info;
  } catch (e) {
    console.error("[MAIL] OTP SEND FAILED", {
      to,
      message: e?.message,
      code: e?.code,
      responseCode: e?.responseCode,
      command: e?.command,
      response: e?.response,
    });
    throw e;
  }
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

  // ✅ priority: Brevo API
  if (BREVO_API_KEY) {
    return sendViaBrevoApi({ to, subject, html });
  }

  // ✅ fallback: SMTP
  if (!transporter) {
    throw new Error("SMTP belum dikonfigurasi dan BREVO_API_KEY tidak ada.");
  }

  try {
    const from = getFrom();
    const info = await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to,
      subject,
      html,
    });

    console.log("[SMTP] RESET SENT", {
      to,
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
    });

    return info;
  } catch (e) {
    console.error("[MAIL] RESET SEND FAILED", {
      to,
      message: e?.message,
      code: e?.code,
      responseCode: e?.responseCode,
      command: e?.command,
      response: e?.response,
    });
    throw e;
  }
}

module.exports = { sendOtpEmail, sendResetPasswordEmail };
