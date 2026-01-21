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
   ✅ SMTP CONFIG (GMAIL)
   ========================================================= */
const port = Number(process.env.SMTP_PORT || 587);
const secure = port === 465;

const smtpEnabled =
  !!process.env.SMTP_HOST &&
  !!process.env.SMTP_USER &&
  !!process.env.SMTP_PASS;

if (!smtpEnabled) {
  console.error("[MAIL] SMTP belum dikonfigurasi dengan benar");
}

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

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,

      requireTLS: true,
      tls: {
        servername: process.env.SMTP_HOST,
        rejectUnauthorized: false,
      },
    })
  : null;

/* =========================================================
   ✅ VERIFY SMTP (AMAN UNTUK GMAIL)
   ========================================================= */
async function verifySmtp() {
  if (!transporter) return;

  try {
    await transporter.verify();
    console.log("[SMTP] READY", {
      host: process.env.SMTP_HOST,
      port,
      user: process.env.SMTP_USER,
    });
  } catch (e) {
    console.error("[SMTP] VERIFY FAILED", {
      message: e?.message,
      code: e?.code,
      response: e?.response,
    });
  }
}

verifySmtp();

/* =========================================================
   ✅ SEND HELPER
   ========================================================= */
async function sendMail({ to, subject, html }) {
  if (!transporter) {
    throw new Error("SMTP transporter tidak tersedia");
  }

  const from = getFrom();

  // 🔐 PENTING: Gmail WAJIB from = SMTP_USER
  const info = await transporter.sendMail({
    from: `"${from.name}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log("[SMTP] SENT", {
    to,
    messageId: info?.messageId,
    accepted: info?.accepted,
    rejected: info?.rejected,
    response: info?.response,
  });

  return info;
}

/* =========================================================
   ✅ PUBLIC FUNCTIONS
   ========================================================= */
async function sendOtpEmail(to, otp) {
  const subject = "Kode OTP Verifikasi Email";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>Verifikasi Email</h2>
      <p>Kode OTP kamu:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px">
        ${otp}
      </div>
      <p>OTP berlaku <b>5 menit</b>.</p>
      <p>Jika kamu tidak meminta OTP, abaikan email ini.</p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

async function sendResetPasswordEmail(to, resetLink) {
  const subject = "Reset Password";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>Reset Password</h2>
      <p>Klik link berikut untuk reset password:</p>
      <p>
        <a href="${resetLink}" target="_blank">
          ${resetLink}
        </a>
      </p>
      <p>Link berlaku <b>15 menit</b>.</p>
      <p>Jika kamu tidak merasa meminta reset password, abaikan email ini.</p>
    </div>
  `;

  return sendMail({ to, subject, html });
}

module.exports = {
  sendOtpEmail,
  sendResetPasswordEmail,
};
