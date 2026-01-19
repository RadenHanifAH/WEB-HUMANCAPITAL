const nodemailer = require("nodemailer");

const port = Number(process.env.SMTP_PORT || 587);
const secure = port === 465; // Gmail: 465 secure true, 587 false

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function verifySmtp() {
  try {
    await transporter.verify();
    console.log("[SMTP] READY", process.env.SMTP_HOST, port, "secure:", secure);
  } catch (e) {
    console.error("[SMTP] VERIFY ERROR:", e?.message || e);
  }
}
verifySmtp();

function getFrom() {
  const name = process.env.MAIL_FROM_NAME || "Human Capital";
  const email = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;
  return `"${name}" <${email}>`;
}

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

  return transporter.sendMail({
    from: getFrom(),
    to,
    subject,
    html,
  });
}

module.exports = { sendOtpEmail };
