const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendResetPasswordEmail = async (to, resetLink) => {
  const subject = "Reset Password";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Reset Password</h2>
      <p>Klik tombol di bawah untuk membuat password baru:</p>
      <p>
        <a href="${resetLink}" 
           style="display:inline-block;padding:10px 16px;background:#0284c7;color:#fff;text-decoration:none;border-radius:8px;">
           Buat Password Baru
        </a>
      </p>
      <p>Link ini berlaku 15 menit.</p>
      <p>Jika kamu tidak meminta reset, abaikan email ini.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

module.exports = { sendResetPasswordEmail };
