// src/services/jobs.api.js
import axiosInstance from "../../../../api/axiosInstance"; 
// ⬆️ sesuaikan path jika file ini ada di folder berbeda

/**
 * GET jobs
 * ADMIN: isPublic=false supaya tidak difilter status=active
 */
export const fetchJobs = async () => {
  try {
    const res = await axiosInstance.get("/jobs", {
      params: {
        limit: 9999,
        isPublic: false,
      },
    });

    const data = res.data?.data || [];

    return data.map((job) => ({
      ...job,
      applicants: job.applicants ?? 0, // fallback aman
    }));
  } catch (err) {
    console.error("Fetch Error:", err);
    return [];
  }
};

/**
 * CREATE / UPDATE job
 * - POST jika id null
 * - PUT jika id ada
 */
export const saveJob = async (jobData, id = null) => {
  const res = id
    ? await axiosInstance.put(`/jobs/${id}`, jobData)
    : await axiosInstance.post("/jobs", jobData);

  return res.data;
};

/**
 * DELETE job
 */
export const deleteJob = async (id) => {
  const res = await axiosInstance.delete(`/jobs/${id}`);
  return res.data;
};
