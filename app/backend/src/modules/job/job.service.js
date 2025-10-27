const jobRepository = require("./job.repository");

const getAllJobs = async (filter = {}) => {
  try {
    const jobs = await jobRepository.findJobs(filter);

    if (jobs.length === 0) {
      throw new Error("Lowongan tidak ditemukan");
    }

    return jobs;
  } catch (error) {
    console.error("Error in getAllJobs:", error.message);
    throw new Error("Gagal mengambil data lowongan");
  }
};

module.exports = {
  getAllJobs,
};
