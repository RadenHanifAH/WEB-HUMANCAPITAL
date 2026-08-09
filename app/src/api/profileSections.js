// src/api/profileSections.js
import axiosInstance from "./axiosInstance";

const BASE = "/profile";

/* ============================
   FULL PROFILE
   ============================ */
export const fetchFullProfile = () =>
  axiosInstance.get(`${BASE}/full`).then((r) => r.data.data);

/* ============================
   WORK EXPERIENCE
   ============================ */
export const fetchWorkExperiences = () =>
  axiosInstance.get(`${BASE}/work-experience`).then((r) => r.data.data);

export const createWorkExperience = (data) =>
  axiosInstance.post(`${BASE}/work-experience`, data).then((r) => r.data);

export const updateWorkExperience = (id, data) =>
  axiosInstance.put(`${BASE}/work-experience/${id}`, data).then((r) => r.data);

export const deleteWorkExperience = (id) =>
  axiosInstance.delete(`${BASE}/work-experience/${id}`).then((r) => r.data);

/* ============================
   EDUCATION
   ============================ */
export const fetchEducations = () =>
  axiosInstance.get(`${BASE}/education`).then((r) => r.data.data);

export const createEducation = (data) =>
  axiosInstance.post(`${BASE}/education`, data).then((r) => r.data);

export const updateEducation = (id, data) =>
  axiosInstance.put(`${BASE}/education/${id}`, data).then((r) => r.data);

export const deleteEducation = (id) =>
  axiosInstance.delete(`${BASE}/education/${id}`).then((r) => r.data);

/* ============================
   ORGANIZATION
   ============================ */
export const fetchOrganizations = () =>
  axiosInstance.get(`${BASE}/organization`).then((r) => r.data.data);

export const createOrganization = (data) =>
  axiosInstance.post(`${BASE}/organization`, data).then((r) => r.data);

export const updateOrganization = (id, data) =>
  axiosInstance.put(`${BASE}/organization/${id}`, data).then((r) => r.data);

export const deleteOrganization = (id) =>
  axiosInstance.delete(`${BASE}/organization/${id}`).then((r) => r.data);

/* ============================
   CERTIFICATE
   ============================ */
export const fetchCertificates = () =>
  axiosInstance.get(`${BASE}/certificate`).then((r) => r.data.data);

export const createCertificate = (data) =>
  axiosInstance.post(`${BASE}/certificate`, data).then((r) => r.data);

export const updateCertificate = (id, data) =>
  axiosInstance.put(`${BASE}/certificate/${id}`, data).then((r) => r.data);

export const deleteCertificate = (id) =>
  axiosInstance.delete(`${BASE}/certificate/${id}`).then((r) => r.data);

/* ============================
   SKILLS
   ============================ */
export const fetchSkills = () =>
  axiosInstance.get(`${BASE}/skills`).then((r) => r.data.data);

export const replaceSkills = (skills) =>
  axiosInstance.put(`${BASE}/skills`, { skills }).then((r) => r.data);