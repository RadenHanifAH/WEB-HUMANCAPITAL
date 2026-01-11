// src/pages/Admin/messages/services/messages.api.js
import axiosInstance from "../../../../api/axiosInstance";

export async function fetchMessages({ q = "", status = "all", page = 1, pageSize = 10 } = {}) {
  const params = {
    q: q?.trim() ? q.trim() : undefined,
    status: status !== "all" ? status : undefined,
    page,
    pageSize,
  };

  const res = await axiosInstance.get("/messages", { params });
  return res.data;
}

export async function sendMessage({ recipientEmail, subject, body }) {
  const res = await axiosInstance.post("/messages/send", { recipientEmail, subject, body });
  return res.data; // { ok, message, data, error }
}

export async function deleteMessage(id) {
  const res = await axiosInstance.delete(`/messages/${id}`);
  return res.data;
}

export async function deleteAllMessages({ q = "", status = "all" } = {}) {
  const params = {
    q: q?.trim() ? q.trim() : undefined,
    status: status !== "all" ? status : undefined,
  };

  const res = await axiosInstance.delete("/messages/bulk", { params });
  return res.data;
}
