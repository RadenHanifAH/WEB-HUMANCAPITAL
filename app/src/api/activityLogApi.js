import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function fetchActivityLogs(params = {}) {
  const { data } = await api.get("/activity-logs", { params });
  return data;
}

export async function fetchActivityLogById(id) {
  const { data } = await api.get(`/activity-logs/${id}`);
  return data;
}

export async function fetchActivityLogStats() {
  const { data } = await api.get("/activity-logs/stats");
  return data;
}
// ✅ exportActivityLogsUrl sudah dihapus