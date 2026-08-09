import axiosInstance from "../../../../api/axiosInstance";

export const fetchSchedules = async ({ date, type, page, pageSize }) => {
  const res = await axiosInstance.get("/schedules", {
    params: { date, type, page, pageSize },
  });
  return res.data;
};

export const fetchApplicants = async (q = "") => {
  const res = await axiosInstance.get("/schedules/applicants", {
    params: { q },
  });
  return res.data;
};

export const fetchApplicantsByStage = async (type) => {
  const res = await axiosInstance.get("/schedules/applicants-by-stage", {
    params: { type },
  });
  return res.data;
};

export const createSchedule = async (payload) => {
  const res = await axiosInstance.post("/schedules", payload);
  return res.data;
};

export const bulkCreateSchedule = async (payload) => {
  const res = await axiosInstance.post("/schedules/bulk", payload);
  return res.data;
};

export const completeSchedule = async (id) => {
  const res = await axiosInstance.patch(`/schedules/${id}/complete`);
  return res.data;
};

export const deleteSchedule = async (id) => {
  const res = await axiosInstance.delete(`/schedules/${id}`);
  return res.data;
};

export const fetchScheduleById = async (id) => {
  const res = await axiosInstance.get(`/schedules/${id}`);
  return res.data;
};

export const confirmScheduleApplicant = async (id, payload) => {
  const res = await axiosInstance.patch(
    `/schedules/${id}/confirm-applicant`,
    payload
  );
  return res.data;
};

export const markScheduleExpired = async (id) => {
  const res = await axiosInstance.patch(`/schedules/${id}/mark-expired`);
  return res.data;
};

export const markNoShowByAdmin = async (id, payload = {}) => {
  const res = await axiosInstance.patch(
    `/schedules/${id}/mark-no-show`,
    payload
  );
  return res.data;
};

// API baru
export const rejectScheduleApplicant = async (id) => {
  const res = await axiosInstance.patch(`/schedules/${id}/reject`);
  return res.data;
};