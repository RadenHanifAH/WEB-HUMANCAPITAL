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

  // ✅ penting: biar tidak nge-hang
  pool: true,
  maxConnections: 2,
  maxMessages: 50,

  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,

  // ✅ kadang Gmail butuh ini
  tls: {
    servername: process.env.SMTP_HOST,
  },
});

function getFrom() {
  const name = process.env.MAIL_FROM_NAME || "Human Capital";
  const email = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;
  return `"${name}" <${email}>`;
}

async function sendOtpEmail(to, otp) {
  return transporter.sendMail({
    from: getFrom(),
    to,
    subject: "Kode OTP Verifikasi Email",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Verifikasi Email</h2>
        <p>Kode OTP kamu:</p>
        <div style="font-size:26px;font-weight:800;letter-spacing:6px">${otp}</div>
        <p>OTP berlaku <b>5 menit</b>.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };
