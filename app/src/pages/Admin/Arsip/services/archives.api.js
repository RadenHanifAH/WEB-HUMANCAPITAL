// src/services/archives.api.js
import axiosInstance from "../../../../api/axiosInstance"; // ✅ sesuaikan path kalau berbeda

export async function fetchArchives({
  q = "",
  status = "all",
  page = 1,
  pageSize = 10,
}) {
  const res = await axiosInstance.get("/archives", {
    params: { q, status, page, pageSize },
  });
  return res.data;
}

export async function exportArchivesCSV({ q = "", status = "all" }) {
  // ✅ responseType blob untuk download file
  const res = await axiosInstance.get("/archives/export", {
    params: { q, status },
    responseType: "blob",
  });
  return res; // kamu sebelumnya return res (bukan res.data) -> tetap sama
}

export async function deleteArchive(id) {
  const res = await axiosInstance.delete(`/archives/${id}`);
  return res.data;
}
