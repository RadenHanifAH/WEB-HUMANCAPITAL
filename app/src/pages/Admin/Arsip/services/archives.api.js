// src/services/archives.api.js
import axios from "axios";

const API_BASE_URL = "web-humancapital-production.up.railway.app/api/archives";

export async function fetchArchives({ q = "", status = "all", page = 1, pageSize = 10 }) {
  const res = await axios.get(API_BASE_URL, {
    params: { q, status, page, pageSize },
    withCredentials: true,
  });
  return res.data;
}

export async function exportArchivesCSV({ q = "", status = "all" }) {
  const res = await axios.get(`${API_BASE_URL}/export`, {
    params: { q, status },
    responseType: "blob",
    withCredentials: true,
  });
  return res;
}

export async function deleteArchive(id) {
  const res = await axios.delete(`${API_BASE_URL}/${id}`, { withCredentials: true });
  return res.data;
}
