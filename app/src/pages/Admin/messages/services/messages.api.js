import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/messages";

export async function fetchMessages({
  q = "",
  status = "all",
  page = 1,
  pageSize = 10,
} = {}) {
  const params = {
    q: q || undefined,
    status: status !== "all" ? status : undefined,
    direction: undefined, // kalau butuh nanti
    page,
    pageSize,
  };

  const res = await axios.get(API_BASE_URL, { params, withCredentials: true });
  return res.data;
}

export async function sendMessage({ recipientEmail, subject, body }) {
  const res = await axios.post(
    `${API_BASE_URL}/send`,
    { recipientEmail, subject, body },
    { withCredentials: true }
  );
  return res.data;
}

// ✅ hapus 1 pesan
export async function deleteMessage(id) {
  const res = await axios.delete(`${API_BASE_URL}/${id}`, {
    withCredentials: true,
  });
  return res.data;
}

// ✅ hapus all / bulk (bisa sesuai filter)
export async function deleteAllMessages({ q = "", status = "all" } = {}) {
  const params = {
    q: q || undefined,
    status: status !== "all" ? status : undefined,
  };

  const res = await axios.delete(`${API_BASE_URL}/bulk`, {
    params,
    withCredentials: true,
  });
  return res.data;
}
