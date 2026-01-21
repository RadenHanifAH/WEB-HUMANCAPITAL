const axios = require("axios");

/* =========================
   Helper: From
   ========================= */
function getFrom() {
  const name = process.env.MAIL_FROM_NAME || "Human Capital";
  const email = process.env.MAIL_FROM_EMAIL;
  return { name, email };
}

const BREVO_API_KEY = process.env.BREVO_API_KEY;

async function sendViaBrevoApi({ to, subject, html }) {
  const from = getFrom();

  if (!BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY belum di-set");
  }
  if (!from.email) {
    throw new Error("MAIL_FROM_EMAIL belum di-set");
  }

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
      },
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

  return sendViaBrevoApi({ to, subject, html });
}

async function sendResetPasswordEmail(to, resetLink) {
  const subject = "Reset Password";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Reset Password</h2>
      <p>Klik link berikut untuk reset password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Link berlaku <b>15 menit</b>.</p>
      <p>Jika kamu tidak merasa meminta reset password, abaikan email ini.</p>
    </div>
  `;

  return sendViaBrevoApi({ to, subject, html });
}

module.exports = { sendOtpEmail, sendResetPasswordEmail };
