const nodemailer = require("nodemailer");

const port = Number(process.env.SMTP_PORT || 587);
const secure = port === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // ✅ biar tidak nge-hang terlalu lama
  pool: true,
  maxConnections: 2,
  maxMessages: 50,

  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 15000,

  // ✅ bantu di hosting / TLS issues
  requireTLS: true,
  tls: {
    servername: process.env.SMTP_HOST,
    rejectUnauthorized: false,
  },
});

// ✅ verifikasi SMTP saat startup (penting untuk production)
async function verifySmtp() {
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
verifySmtp();

function getFrom() {
  const name = process.env.MAIL_FROM_NAME || "Human Capital";
  const email = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;
  return `"${name}" <${email}>`;
}

async function sendOtpEmail(to, otp) {
  try {
    return await transporter.sendMail({
      from: getFrom(),
      to,
      subject: "Kode OTP Verifikasi Email",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>Verifikasi Email</h2>
          <p>Kode OTP kamu:</p>
          <div style="font-size:26px;font-weight:800;letter-spacing:6px">${otp}</div>
          <p>OTP berlaku <b>5 menit</b>.</p>
          <p>Jika kamu tidak meminta OTP, abaikan email ini.</p>
        </div>
      `,
    });
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
  try {
    return await transporter.sendMail({
      from: getFrom(),
      to,
      subject: "Reset Password",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>Reset Password</h2>
          <p>Klik link berikut untuk reset password:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Link berlaku <b>15 menit</b>.</p>
        </div>
      `,
    });
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
