// src/api/notificationsApi.js
//
// ⚠️ Sesuaikan path import axiosInstance dengan yang dipakai file lain,
// mis. "../api/axiosInstance" (lihat PsikotestForm.jsx: "../../../api/axiosInstance").
import axiosInstance from "../../../../api/axiosInstance";

export const fetchRecentNotifications = async (limit = 5) => {
  const res = await axiosInstance.get(`/notifications/recent`, {
    params: { limit },
  });
  return res.data; // { items, unreadCount }
};

export const fetchAllNotifications = async ({
  page = 1,
  pageSize = 20,
  isRead,
  type,
} = {}) => {
  const res = await axiosInstance.get(`/notifications`, {
    params: {
      page,
      pageSize,
      ...(isRead !== undefined ? { isRead } : {}),
      ...(type ? { type } : {}),
    },
  });
  return res.data; // { items, total, page, pageSize }
};

export const markNotificationRead = async (id) => {
  const res = await axiosInstance.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axiosInstance.patch(`/notifications/read-all`);
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await axiosInstance.delete(`/notifications/${id}`);
  return res.data;
};
