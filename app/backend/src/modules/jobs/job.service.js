const jobRepository = require("./job.repository");

const getAllJobs = async (
  filter = {},
  page = 1,
  limit = 5,
  isPublic = true
) => {
  const skip = (page - 1) * limit;


  const whereClause = { ...filter };

  if (isPublic) {

    whereClause.status = "open";

    whereClause.OR = [{ deadline: null }, { deadline: { gte: new Date() } }];
  }

  const jobs = await jobRepository.findJobs(whereClause, skip, limit);
  const totalItems = await jobRepository.countJobs(whereClause);

  if (jobs.length === 0) {
    throw new Error("Lowongan tidak ditemukan");
  }

  const totalPages = Math.ceil(totalItems / limit);

  return {
    jobs,
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const createJob = async (data) => {
  if (!data.title) {
    throw new Error("Judul lowongan wajib diisi");
  }

  const validJobTypes = [
    "FullTime",
    "PartTime",
    "Contract",
    "Internship",
    "Freelance",
  ];
  if (data.type && !validJobTypes.includes(data.type)) {
    throw new Error("Tipe pekerjaan tidak valid");
  }

  const validExperienceLevels = [
    "FreshGraduate",
    "Junior",
    "MidLevel",
    "Senior",
  ];
  if (data.experience && !validExperienceLevels.includes(data.experience)) {
    throw new Error("Level pengalaman tidak valid");
  }

  const validEducationLevels = ["SMA", "D3", "D4" ,"S1", "S2", "S3"];
  if (data.education && !validEducationLevels.includes(data.education)) {
    throw new Error("Level pendidikan tidak valid");
  }

  if (data.deadline) {
    const deadlineDate = new Date(data.deadline);
    if (deadlineDate < new Date()) {
      throw new Error("Deadline tidak boleh di masa lalu");
    }
  }

  const newJob = await jobRepository.createJob(data);

  if (!newJob) {
    throw new Error("Gagal membuat lowongan baru");
  }

  return newJob;
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

const deleteJob = async (id) => {
  const deletedJob = await jobRepository.deleteJob(id);

  if(!deletedJob){
    throw new Error("Lowongan gagal dihapus")
  }

  return deletedJob
}

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
