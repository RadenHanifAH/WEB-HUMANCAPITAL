const jobRepository = require("./job.repository");

const getAllJobs = async (filter = {}) => {
  try {
    const jobs = await jobRepository.getAllJobs(filter);

    res.json({
      jobs,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};


module.exports = {
    getAllJobs,
}
