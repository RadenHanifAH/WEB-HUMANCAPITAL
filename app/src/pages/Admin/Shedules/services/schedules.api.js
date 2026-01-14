// src/services/schedules.api.js
import axiosInstance from "../../../../api/axiosInstance"; // ✅ sesuaikan path kalau beda

export async function fetchSchedules({
  date = "",
  type = "all",
  page = 1,
  pageSize = 3,
} = {}) {
  const res = await axiosInstance.get("/schedules", {
    params: { date, type, page, pageSize },
  });
  return res.data;
}

export async function fetchApplicants({ q = "" } = {}) {
  const res = await axiosInstance.get("/schedules/applicants", {
    params: { q },
  });
  return res.data;
}

export async function createSchedule(payload) {
  const res = await axiosInstance.post("/schedules", payload);
  return res.data;
}

export async function completeSchedule(id) {
  const res = await axiosInstance.patch(`/schedules/${id}/complete`, {});
  return res.data;
}

export async function deleteSchedule(id) {
  const res = await axiosInstance.delete(`/schedules/${id}`);
  return res.data;
}
