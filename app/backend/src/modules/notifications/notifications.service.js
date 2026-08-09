// app/backend/src/modules/notifications/notifications.service.js
const prisma = require("../../config/prisma");
const notificationsRepository = require("./notifications.repository");

const NOTIFICATION_TYPES = {
  INTERVIEW_SCHEDULED: "interview_scheduled",
  NEW_APPLICANT: "new_applicant",
  APPLICATION_REJECTED: "application_rejected",
  APPLICATION_ACCEPTED: "application_accepted",
  NO_SHOW: "no_show",
  SYSTEM_UPDATE: "system_update",

  // ✅ Pengajuan SDM
  PENGAJUAN_SUBMITTED: "pengajuan_submitted",
  PENGAJUAN_APPROVED: "pengajuan_approved",
  PENGAJUAN_REJECTED: "pengajuan_rejected",

  // ✅ Lowongan Kerja
  JOB_CREATED: "job_created",
  JOB_UPDATED: "job_updated",
  JOB_DELETED: "job_deleted",

  // ✅ Manajemen User
  USER_CREATED: "user_created",
  USER_DELETED: "user_deleted",

  // ✅ Penilaian (Psikotest & Interview)
  ASSESSMENT_SAVED: "assessment_saved",
};

const notificationsService = {
  async getRecent(userId, limit = 5) {
    const [items, unreadCount] = await Promise.all([
      notificationsRepository.findRecent(userId, limit),
      notificationsRepository.countUnread(userId),
    ]);
    return { items, unreadCount };
  },

  async getAll({ userId, page = 1, pageSize = 20, isRead, type }) {
    const [items, total] = await notificationsRepository.findAllPaginated({
      userId,
      page,
      pageSize,
      isRead,
      type,
    });
    return { items, total, page, pageSize };
  },

  markAsRead(id) {
    return notificationsRepository.markAsRead(id);
  },

  markAllAsRead(userId) {
    return notificationsRepository.markAllAsRead(userId);
  },

  remove(id) {
    return notificationsRepository.remove(id);
  },

  // Notif ke SATU user spesifik (mis. divisi yang pengajuannya di-approve)
  notify({ userId = null, type, title, message, actionUrl = null, metadata = null }) {
    return notificationsRepository.create({
      userId,
      type,
      title,
      message,
      actionUrl,
      metadata,
    });
  },

  // Broadcast ke SEMUA admin
  // ⚠️ FIX: model di schema kamu bernama `pengguna` (bukan `user`),
  // dan field peran bernama `peran` (enum peran_pengguna: admin | pelamar | divisi)
  async notifyAllAdmins({ type, title, message, actionUrl = null, metadata = null }) {
    const admins = await prisma.pengguna.findMany({
      where: { peran: "admin" },
      select: { id: true },
    });
    return notificationsRepository.createManyForUsers(
      admins.map((a) => a.id),
      { type, title, message, actionUrl, metadata }
    );
  },
};

module.exports = { notificationsService, NOTIFICATION_TYPES };