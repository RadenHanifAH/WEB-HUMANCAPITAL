// app/src/pages/Admin/Pengajuan/pengajuanService.js
import axiosInstance from "../../../api/axiosInstance";

const ENDPOINT = "/admin/pengajuan";

export async function getPengajuanList({ search = "", status = "", page = 1, limit = 10 } = {}) {
  const params = {
    page,
    limit,
    ...(search && { search }),
    ...(status && { status }),
  };
  const { data } = await axiosInstance.get(ENDPOINT, { params });
  return {
    items: data.data.items || [],
    total: data.data.total,
  };
}

export async function getPengajuanStats() {
  const { data } = await axiosInstance.get(`${ENDPOINT}/stats`);
  return data.data;
}

export async function getPengajuanById(id) {
  const { data } = await axiosInstance.get(`${ENDPOINT}/${id}`);
  return data.data;
}

export async function approvePengajuan(id, catatan = "") {
  const { data } = await axiosInstance.post(`${ENDPOINT}/${id}/approve`, { catatan });
  return data;
}

export async function rejectPengajuan(id, catatan) {
  const { data } = await axiosInstance.post(`${ENDPOINT}/${id}/reject`, { catatan });
  return data;
}