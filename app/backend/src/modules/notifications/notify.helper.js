// app/backend/src/modules/notifications/notify.helper.js
const { notificationsService } = require("./notifications.service");

// Kirim notif ke SEMUA ADMIN, non-blocking — tidak pernah menggagalkan
// request utama kalau gagal.
function notifyAdmins(payload) {
  notificationsService
    .notifyAllAdmins(payload)
    .catch((err) =>
      console.error(`❌ Gagal membuat notifikasi (${payload.type}):`, err.message),
    );
}

// Kirim notif ke SATU user tertentu, non-blocking.
function notifyUser(userId, payload) {
  if (!userId) return;
  notificationsService
    .notify({ ...payload, userId })
    .catch((err) =>
      console.error(`❌ Gagal membuat notifikasi user (${payload.type}):`, err.message),
    );
}

module.exports = { notifyAdmins, notifyUser };