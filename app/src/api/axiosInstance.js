import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://web-humancapital-production.up.railway.app/api",
  withCredentials: true,
});

const isExpectedError = (err) => {
  const status = err?.response?.status;
  const msg = err?.response?.data?.message;

  // ✅ auth "expected"
  if (status === 401 && msg === "Unauthorized - No access token provided") return true;
  if (status === 401 && msg === "Unauthorized - Access token expired") return true;
  if (status === 401 && msg === "Unauthorized - Invalid access token") return true;

  // ✅ refresh "expected"
  if (status === 400 && msg === "No refresh token provided") return true;

  // ✅ reset password: email tidak ditemukan (sesuaikan jika message backend beda)
  if (status === 404 && (msg || "").toLowerCase().includes("email")) return true;
  if (status === 400 && (msg || "").toLowerCase().includes("email")) return true;

  return false;
};

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    // ✅ hanya log error yang benar-benar "unexpected"
    if (!isExpectedError(err)) {
      console.log(
        "API Error:",
        err?.response?.status,
        err?.response?.data?.message || err?.message
      );
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
