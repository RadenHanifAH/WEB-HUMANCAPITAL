const prisma = require("../../config/prisma");
const repo = require("./messages.repository");
const { sendEmail } = require("../../utils/mailer");

class MessagesService {
  normalizeStatus(status) {
    const allowed = ["queued", "sent", "failed"];
    return allowed.includes(status) ? status : null;
  }

  normalizeDirection(direction) {
    const allowed = ["outgoing", "incoming"];
    return allowed.includes(direction) ? direction : null;
  }

  async listMessages(query) {
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize || 10)));

    const q = (query.q || "").trim() || null;
    const status = this.normalizeStatus(query.status);
    const direction = this.normalizeDirection(query.direction);

    const [items, total] = await Promise.all([
      repo.findMany({ q, status, direction, page, pageSize }),
      repo.count({ q, status, direction }),
    ]);

    return {
      page,
      pageSize,
      total,
      items,
    };
  }

  async sendMessage({ recipientEmail, subject, body }) {
    if (!recipientEmail || !subject || !body) {
      throw new Error("recipientEmail, subject, dan body wajib diisi");
    }

    const user = await prisma.user.findUnique({
      where: { email: recipientEmail },
      select: { id: true, name: true, email: true },
    });

    // 1) simpan dulu ke DB (queued)
    const created = await repo.create({
      userId: user?.id ?? null,
      recipientName: user?.name ?? null,
      recipientEmail,
      subject,
      body,
      status: "queued",
      direction: "outgoing",
      provider: "nodemailer",
    });

    // 2) kirim email
    try {
      const text = body;
      const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5">
        <h3 style="margin:0 0 12px 0;">${escapeHtml(subject)}</h3>
        <p style="white-space: pre-wrap; margin:0;">${escapeHtml(body)}</p>
        <hr style="margin:16px 0; border:none; border-top:1px solid #eee;" />
        <small style="color:#666;">Pesan ini dikirim otomatis oleh sistem Human Capital.</small>
      </div>
    `;

      const info = await sendEmail({
        to: recipientEmail,
        subject,
        text,
        html,
      });

      // 3) update status sent
      const updated = await repo.update(created.id, {
        status: "sent",
        sentAt: new Date(),
        providerId: info.messageId || null,
        errorMessage: null,
      });

      return {
        ok: true,
        data: updated,
      };
    } catch (err) {
      // 4) update status failed
      const failed = await repo.update(created.id, {
        status: "failed",
        errorMessage: err?.message || String(err),
      });

      // ✅ jangan throw — tetap return data failed agar muncul di manajemen pesan
      return {
        ok: false,
        data: failed,
        error: err?.message || String(err),
      };
    }
  }

  // ✅ hapus 1 pesan
  async deleteMessageById(id) {
    const exists = await repo.findById(id);
    if (!exists) throw new Error("Message not found");

    await repo.deleteById(id);
    return true;
  }

  // ✅ hapus all/bulk (bisa sesuai filter q/status/direction)
  async deleteBulkMessages(query) {
    const q = (query.q || "").trim() || null;
    const status = this.normalizeStatus(query.status);
    const direction = this.normalizeDirection(query.direction);

    const deleted = await repo.deleteMany({ q, status, direction });
    return { deleted };
  }
}

// helper minimal
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = new MessagesService();
