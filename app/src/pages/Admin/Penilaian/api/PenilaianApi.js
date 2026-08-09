// src/pages/Admin/Penilaian/api/PenilaianApi.js
import axiosInstance from "../../../../api/axiosInstance";
// ✅ PenilaianApi.js ada di Admin/Penilaian/api/, jadi naik 4 level ke src/
// lalu masuk /api/axiosInstance.js — beda dengan DokumenPenilaian.jsx yang
// cuma naik 3 level karena posisinya langsung di folder Penilaian/

const BASE = "/penilaian";
// ✅ axiosInstance sudah punya baseURL "http://localhost:4000/api",
// jadi di sini cukup "/penilaian" saja, JANGAN tulis "/api/penilaian"
// (kalau ditulis begitu hasilnya jadi dobel: .../api/api/penilaian)

// ---------- PREFILL ----------

export const fetchPrefillData = async (applicationId) => {
  const res = await axiosInstance.get(`${BASE}/prefill/${applicationId}`);
  return res.data;
};

// ---------- SEARCH KANDIDAT ----------

export const searchCandidates = async (q, stage) => {
  const params = { q };
  if (stage) params.stage = stage;
  const res = await axiosInstance.get(`${BASE}/search-candidates`, { params });
  return res.data;
};

// ---------- PSIKOTEST ----------

export const fetchPsikotestList = async ({ q = "", page = 1, pageSize = 10 } = {}) => {
  const res = await axiosInstance.get(`${BASE}/psikotest`, {
    params: { q, page, pageSize },
  });
  return res.data;
};

export const fetchPsikotestById = async (id) => {
  const res = await axiosInstance.get(`${BASE}/psikotest/${id}`);
  return res.data;
};

export const fetchPsikotestByApplication = async (applicationId) => {
  const res = await axiosInstance.get(
    `${BASE}/psikotest/by-application/${applicationId}`,
  );
  return res.data;
};

export const createPsikotest = async (payload) => {
  const res = await axiosInstance.post(`${BASE}/psikotest`, payload);
  return res.data;
};

export const updatePsikotest = async (id, payload) => {
  const res = await axiosInstance.put(`${BASE}/psikotest/${id}`, payload);
  return res.data;
};

export const deletePsikotest = async (id) => {
  const res = await axiosInstance.delete(`${BASE}/psikotest/${id}`);
  return res.data;
};

// ---------- INTERVIEW ----------
// stage: 1 = Interview Tahap Pertama, 2 = Interview Tahap Kedua

export const fetchInterviewList = async ({ q = "", page = 1, pageSize = 10, stage } = {}) => {
  const params = { q, page, pageSize };
  if (stage) params.stage = stage;
  const res = await axiosInstance.get(`${BASE}/interview`, { params });
  return res.data;
};

export const fetchInterviewById = async (id) => {
  const res = await axiosInstance.get(`${BASE}/interview/${id}`);
  return res.data;
};

export const fetchInterviewByApplication = async (applicationId, stage) => {
  const params = stage ? { stage } : {};
  const res = await axiosInstance.get(
    `${BASE}/interview/by-application/${applicationId}`,
    { params },
  );
  return res.data;
};

export const createInterview = async (payload) => {
  const res = await axiosInstance.post(`${BASE}/interview`, payload);
  return res.data;
};

export const updateInterview = async (id, payload) => {
  const res = await axiosInstance.put(`${BASE}/interview/${id}`, payload);
  return res.data;
};

export const deleteInterview = async (id) => {
  const res = await axiosInstance.delete(`${BASE}/interview/${id}`);
  return res.data;
};

// ---------- DOKUMEN PENILAIAN ----------

export const fetchAssessmentDocuments = async (q = "") => {
  const res = await axiosInstance.get(`${BASE}/documents`, { params: { q } });
  return res.data;
};