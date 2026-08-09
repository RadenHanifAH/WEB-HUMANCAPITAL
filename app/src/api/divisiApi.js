import axiosInstance from "./axiosInstance";

// ─── Dashboard ──────────────────────────────────────────────
export const getDivisiDashboard = () =>
  axiosInstance.get("/divisi/dashboard");

// ─── Pengajuan SDM ──────────────────────────────────────────
export const getPengajuanList = (params) =>
  axiosInstance.get("/divisi/pengajuan", { params });

export const getPengajuanById = (id) =>
  axiosInstance.get(`/divisi/pengajuan/${id}`);

export const createPengajuan = (data) =>
  axiosInstance.post("/divisi/pengajuan", data);

export const updatePengajuan = (id, data) =>
  axiosInstance.put(`/divisi/pengajuan/${id}`, data);

export const deletePengajuan = (id) =>
  axiosInstance.delete(`/divisi/pengajuan/${id}`);

export const submitPengajuan = (id) =>
  axiosInstance.post(`/divisi/pengajuan/${id}/submit`);