// src/utils/mailer.js
const nodemailer = require("nodemailer");
const axios = require("axios");

const isProd = process.env.NODE_ENV === "production";

/* =====================================================
   🟢 BREVO API (PRODUCTION – RECOMMENDED)
   ===================================================== */
async function sendWithBrevo({ to, subject, html, text }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY belum di-set");

  const senderName = process.env.MAIL_FROM_NAME || "Human Capital";
  const senderEmail = process.env.MAIL_FROM_EMAIL;

  const res = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    },
    {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      timeout: 10_000,
    }
  );

  return {
    messageId: res.data?.messageId || null,
    provider: "brevo",
  };
}

/* =====================================================
   🟡 SMTP (DEV / LOCAL)
   ===================================================== */
function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false") === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 2,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/* =====================================================
   ✉️ PUBLIC API
   ===================================================== */
async function sendEmail({ to, subject, text, html }) {
  // ✅ production pakai API (CEPAT & STABIL)
  if (isProd) {
    return sendWithBrevo({ to, subject, text, html });
  }

  // 🧪 local dev pakai SMTP
  const transporter = getSmtpTransporter();

  const fromName = process.env.MAIL_FROM_NAME || "Human Capital";
  const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });

  return {
    messageId: info.messageId,
    provider: "smtp",
  };
}

module.exports = { sendEmail };
