// src/api/axiosInstance.js

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

/* =========================
   Request Interceptor
   ========================= */
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================
   Helper
   ========================= */
const isExpectedError = (err) => {
  const status = err?.response?.status;
  const msg = err?.response?.data?.message;

  if (status === 401 && msg === "Unauthorized - No access token provided")
    return true;

  if (status === 401 && msg === "Unauthorized - Access token expired")
    return true;

  if (status === 401 && msg === "Unauthorized - Invalid access token")
    return true;

  if (status === 400 && msg === "No refresh token provided") return true;

  if (status === 404 && (msg || "").toLowerCase().includes("email"))
    return true;

  if (status === 400 && (msg || "").toLowerCase().includes("email"))
    return true;

  return false;
};

/* =========================
   Response Interceptor
   ========================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // abaikan request yang dibatalkan
    if (error.code === "ERR_CANCELED" || error.message === "canceled") {
      return Promise.reject(error);
    }

    if (!isExpectedError(error)) {
      console.error(
        "API Error:",
        error?.response?.status,
        error?.response?.data?.message || error?.message,
      );
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
