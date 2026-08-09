// src/services/archives.api.js
import axiosInstance from "../../../../api/axiosInstance"; // ✅ sesuaikan path kalau berbeda

export async function fetchArchives({
  q = "",
  status = "all",
  position = "all",
  page = 1,
  pageSize = 10,
}) {
  const res = await axiosInstance.get("/archives", {
    params: { q, status, position, page, pageSize },
  });
  return res.data;
}

// ✅ NEW: daftar posisi unik untuk dropdown "Semua Posisi"
export async function fetchArchivePositions() {
  const res = await axiosInstance.get("/archives/positions");
  return res.data?.items || [];
}

export async function fetchArchiveDetail(id) {
  const res = await axiosInstance.get(`/archives/${id}`);
  return res.data;
}

export async function exportArchivesCSV({ q = "", status = "all", position = "all" }) {
  // ✅ responseType blob untuk download file
  const res = await axiosInstance.get("/archives/export", {
    params: { q, status, position },
    responseType: "blob",
  });
  return res; // tetap return res (bukan res.data), sesuai pola aslimu
}

export async function deleteArchive(id) {
  const res = await axiosInstance.delete(`/archives/${id}`);
  return res.data;
}