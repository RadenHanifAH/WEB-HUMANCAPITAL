import axiosInstance from "../../../../api/axiosInstance"; 
// sesuaikan path relatifnya dengan struktur folder kamu

export const fetchDashboardData = async () => {
  // axiosInstance sudah baseURL http://localhost:4000/api
  const res = await axiosInstance.get("/dashboard/data"); 
  return res.data;
};

export const fetchMyProfile = async () => {
  const res = await axiosInstance.get("/auth/profile"); 
  return res.data;
};
