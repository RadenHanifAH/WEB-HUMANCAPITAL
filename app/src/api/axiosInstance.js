import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api", // sesuaikan dengan backend kamu
  withCredentials: true, // penting agar cookie dikirim!
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
