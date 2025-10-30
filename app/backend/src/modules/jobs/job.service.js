const jobRepository = require("./job.repository");

const getAllJobs = async (filter = {}) => {
  const jobs = await jobRepository.findJobs(filter);

  if (jobs.length === 0) {
    throw new Error("Lowongan tidak ditemukan");
  }

  return jobs;
};

const getJobById = async (id) => {
  const job = await jobRepository.findJobById(id);

  if (!job) {
    throw new Error("Lowongan tidak ditemukan");
  }

  return job;
};

const updateJob = async (id, data) => {
  const updatedJob = await jobRepository.updateJob(id, data);

  if (!updatedJob) {
    throw new Error("Lowongan tidak ditemukan");
  }

  return updatedJob;
};

const deleteJob = async () => {
  const deletedJob = await jobRepository.deleteJob();

  if(!deletedJob){
    throw new Error("Lowongan gagal dihapus")
  }

}

module.exports = {
  getAllJobs,
  getJobById,
  updateJob,
};
