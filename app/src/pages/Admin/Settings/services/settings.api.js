import axios from "../../../../api/axiosInstance";

export async function getSettings() {
  const res = await axios.get("/settings");
  return res.data;
}

export async function updateGeneralSettings(payload) {
  const res = await axios.put("/settings/general", payload);
  return res.data;
}

export async function updateNotificationSettings(payload) {
  const res = await axios.put("/settings/notifications", payload);
  return res.data;
}
