const { sendMail } = require("../auth/mail.service"); // ✅ sekarang connect ke mail.service.js (bukan utils/mailer lagi)

// ✅ Key tetap sama (InterviewHC, Psikotes, FinalInterview) supaya konsisten
// dengan nilai yang tersimpan di kolom `type` tabel interviewschedule —
// yang berubah hanya teks labelnya sesuai permintaan.
const TYPE_LABEL = {
  InterviewHC: "Interview Pertama",
  Psikotes: "Psikotes",
  FinalInterview: "Interview Kedua",
};

const TYPE_COLOR = {
  InterviewHC: "#2563eb",
  Psikotes: "#7c3aed",
  FinalInterview: "#16a34a",
};

function formatDateTime(date, time) {
  const d = new Date(`${date}T${time}:00`);
  return (
    d.toLocaleString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }) + " WIB"
  );
}

function buildEmailHtml({
  applicantName,
  type,
  date,
  time,
  location,
  meetingLink,
  position,
  confirmUrl,
  scheduleId,
}) {
  const typeLabel = TYPE_LABEL[type] || type;
  const color = TYPE_COLOR[type] || "#0284c7";
  const dateTimeStr = formatDateTime(date, time);
  const isOnline = Boolean(meetingLink);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Undangan ${typeLabel}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:${color};padding:36px 40px;text-align:center;">
              <p style="margin:0 0 6px 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Undangan Seleksi</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">${typeLabel}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 6px 0;color:#64748b;font-size:14px;">Kepada Yth.</p>
              <p style="margin:0 0 24px 0;color:#0f172a;font-size:20px;font-weight:700;">${applicantName}</p>

              <p style="margin:0 0 24px 0;color:#475569;font-size:15px;line-height:1.7;">
                Kami mengundang Anda untuk mengikuti tahap seleksi <strong>${typeLabel}</strong>
                untuk posisi <strong>${position}</strong>. Berikut detail jadwal yang telah ditetapkan:
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Tahap</span><br/>
                          <span style="color:#0f172a;font-size:15px;font-weight:600;">${typeLabel}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Posisi</span><br/>
                          <span style="color:#0f172a;font-size:15px;font-weight:600;">${position}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;${isOnline ? "border-bottom:1px solid #e2e8f0;" : ""}">
                          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Waktu</span><br/>
                          <span style="color:#0f172a;font-size:15px;font-weight:600;">${dateTimeStr}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;${isOnline ? "border-bottom:1px solid #e2e8f0;" : ""}">
                          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Lokasi</span><br/>
                          <span style="color:#0f172a;font-size:15px;font-weight:600;">${location}</span>
                        </td>
                      </tr>
                      ${
                        isOnline
                          ? `<tr>
                        <td style="padding:8px 0;">
                          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Link Meeting</span><br/>
                          <a href="${meetingLink}" style="color:${color};font-size:15px;font-weight:600;word-break:break-all;">${meetingLink}</a>
                        </td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>

              ${
                isOnline
                  ? `<p style="margin:0 0 16px 0;color:#475569;font-size:14px;">
                Silakan bergabung ke ruang pertemuan daring melalui tombol di bawah ini pada waktu yang telah ditentukan:
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="border-radius:10px;overflow:hidden;">
                    <a href="${meetingLink}"
                      style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;
                             font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      🎥 Gabung Meeting
                    </a>
                  </td>
                </tr>
              </table>`
                  : ""
              }

              <!-- Confirm Button -->
              <p style="margin:0 0 16px 0;color:#475569;font-size:14px;">
                Mohon konfirmasi kehadiran Anda dengan menekan tombol di bawah ini:
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="border-radius:10px;overflow:hidden;border:1px solid ${color};">
                    <a href="${confirmUrl}"
                      style="display:inline-block;background:#ffffff;color:${color};text-decoration:none;
                             font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      ✅ Konfirmasi Kehadiran
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Email ini dikirim secara otomatis oleh sistem HR. Mohon tidak membalas email ini.
              </p>
              <p style="margin:6px 0 0 0;color:#cbd5e1;font-size:11px;">© Syaamil Group · HR System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

async function sendScheduleEmail({
  to,
  applicantName,
  type,
  date,
  time,
  location,
  meetingLink = null,
  position,
  scheduleId,
}) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const confirmUrl = `${frontendUrl}/confirm-schedule/${scheduleId}`;
  const typeLabel = TYPE_LABEL[type] || type;

  const html = buildEmailHtml({
    applicantName,
    type,
    date,
    time,
    location,
    meetingLink,
    position,
    confirmUrl,
    scheduleId,
  });

  const info = await sendMail({
    // ✅ pakai sendMail dari mail.service.js
    to,
    subject: `[Undangan] ${typeLabel} – ${position}`,
    html,
  });

  console.log(
    `📧 Email terkirim ke ${to} (${typeLabel})${meetingLink ? " — dengan link meeting" : ""}`,
    {
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
    }
  );
}

module.exports = { sendScheduleEmail };