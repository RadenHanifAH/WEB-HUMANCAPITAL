const jobService = require("./job.service");

const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      department,
      location,
      type,
      experience,
      education,
      isPublic = "true", 
      ...otherFilters
    } = req.query;

    const filter = {};

    if (department) filter.department = department;
    if (location) filter.location = { contains: location.toLowerCase() };
    if (type) filter.type = type;
    if (experience) filter.experience = experience;
    if (education) filter.education = education;

    const result = await jobService.getAllJobs(
      filter,
      parseInt(page),
      parseInt(limit),
      isPublic === "true"
    );

    res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan data lowongan",
      data: result.jobs,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        itemsPerPage: result.itemsPerPage,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await jobService.getJobById(id);

    res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan data lowongan",
      data: job,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const createJob = async (req, res) => {
  try {
    const jobData = req.body;
    const newJob = await jobService.createJob(jobData);

    res.status(201).json({
      success: true,
      message: "Berhasil membuat lowongan baru",
      data: newJob,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const jobData = req.body;
    const updatedJob = await jobService.updateJob(id, jobData);

    res.status(200).json({
      success: true,
      message: "Berhasil memperbarui lowongan",
      data: updatedJob,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedJob = await jobService.deleteJob(id);

    res.status(200).json({
      success: true,
      message: "Berhasil menghapus lowongan",
      data: deletedJob,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};