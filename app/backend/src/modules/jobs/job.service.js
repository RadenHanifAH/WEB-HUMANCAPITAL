const jobRepository = require("./job.repository");

const getAllJobs = async (filter = {}, page = 1, limit = 5, isPublic = true) => {
  const skip = (page - 1) * limit;

  const whereClause = { ...filter };

  if (isPublic) {
    whereClause.status = "active";
    whereClause.OR = [{ tenggat: null }, { tenggat: { gte: new Date() } }];
  }

  const jobs = await jobRepository.findJobs(whereClause, skip, limit);
  const totalItems = await jobRepository.countJobs(whereClause);

  const totalPages = Math.ceil(totalItems / limit) || 1;

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
  if (!data.judul) throw new Error("Judul lowongan wajib diisi");

  const validJobTypes = ["FullTime", "PartTime", "Contract", "Internship", "Freelance"];
  if (data.jenis && !validJobTypes.includes(data.jenis)) throw new Error("Tipe pekerjaan tidak valid");

  // ✅ Hapus validasi pengalaman & pendidikan
  // const validExperienceLevels = ["FreshGraduate", "Junior", "MidLevel", "Senior"];
  // if (data.pengalaman && !validExperienceLevels.includes(data.pengalaman)) throw new Error("Level pengalaman tidak valid");

  // const validEducationLevels = ["SMA", "D3", "D4", "S1", "S2", "S3"];
  // if (data.pendidikan && !validEducationLevels.includes(data.pendidikan)) throw new Error("Level pendidikan tidak valid");

  if (data.tenggat) {
    const deadlineDate = new Date(data.tenggat);
    if (deadlineDate < new Date()) throw new Error("Deadline tidak boleh di masa lalu");
  }

  return jobRepository.createJob(data);
};

const getJobById = async (id) => {
  const job = await jobRepository.findJobById(id);
  if (!job) {
    const err = new Error("Lowongan tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }
  return job;
};

const updateJob = async (id, data) => {
  return jobRepository.updateJob(id, data);
};

const deleteJob = async (id) => {
  return jobRepository.deleteJob(id);
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};