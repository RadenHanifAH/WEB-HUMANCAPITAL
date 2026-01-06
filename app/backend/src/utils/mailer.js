const nodemailer = require("nodemailer");

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false") === "true";

  if (!host) throw new Error("SMTP_HOST belum di-set di .env");
  if (!process.env.SMTP_USER) throw new Error("SMTP_USER belum di-set di .env");
  if (!process.env.SMTP_PASS) throw new Error("SMTP_PASS belum di-set di .env");

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail({ to, subject, text, html }) {
  const transporter = getTransporter();

  const fromName = process.env.MAIL_FROM_NAME || "Human Capital";
  const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });

  return info; // info.messageId dll
}

module.exports = { sendEmail };
