// src/api/axiosInstance.js
import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Tambahkan interceptor request untuk token
axiosInstance.interceptors.request.use((config) => {
  const { user } = useAuthStore.getState(); // ambil user dari store
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default axiosInstance;
