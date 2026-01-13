import axios from "axios";

const API = "https://web-humancapital-production.up.railway.app/api/schedules";

export async function fetchSchedules({ date = "", type = "all", page = 1, pageSize = 3 }) {
  const res = await axios.get(API, { params: { date, type, page, pageSize }, withCredentials: true });
  return res.data;
}

export async function fetchApplicants({ q = "" } = {}) {
  const res = await axios.get(`${API}/applicants`, { params: { q }, withCredentials: true });
  return res.data;
}

export async function createSchedule(payload) {
  const res = await axios.post(API, payload, { withCredentials: true });
  return res.data;
}

export async function completeSchedule(id) {
  const res = await axios.patch(`${API}/${id}/complete`, {}, { withCredentials: true });
  return res.data;
}

export async function deleteSchedule(id) {
  const res = await axios.delete(`${API}/${id}`, { withCredentials: true });
  return res.data;
}
