const jobService = require("./job.service");
const { notifyAdmins } = require("../notifications/notify.helper");
const { NOTIFICATION_TYPES } = require("../notifications/notifications.service");

const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      department,
      location,
      type,
      isPublic = "true",
    } = req.query;

    const filter = {};
    
    // ✅ KEMBALIKAN FILTER LAMA
    if (department) filter.departemen = department;
    
    if (location) filter.lokasi = { contains: location };
    if (type) filter.jenis = type;

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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(error.statusCode || 404).json({
      success: false,
      message: error.message,
    });
  }
};

const createJob = async (req, res) => {
  try {
    const newJob = await jobService.createJob(req.body);

    notifyAdmins({
      type: NOTIFICATION_TYPES.JOB_CREATED,
      title: `Lowongan Baru Dibuat - ${newJob.judul}`,
      message: `Lowongan untuk posisi ${newJob.judul} di departemen ${newJob.departemen || "-"} telah dibuat.`,
      actionUrl: "jobs",
      metadata: { jobId: newJob.id },
    });

    res.status(201).json({
      success: true,
      message: "Berhasil membuat lowongan baru",
      data: newJob,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedJob = await jobService.updateJob(id, req.body);

    notifyAdmins({
      type: NOTIFICATION_TYPES.JOB_UPDATED,
      title: `Lowongan Diperbarui - ${updatedJob.judul}`,
      message: `Detail lowongan untuk posisi ${updatedJob.judul} telah diperbarui.`,
      actionUrl: "jobs",
      metadata: { jobId: updatedJob.id },
    });

    res.status(200).json({
      success: true,
      message: "Berhasil memperbarui lowongan",
      data: updatedJob,
    });
  } catch (error) {
    res.status(error.statusCode || 404).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedJob = await jobService.deleteJob(id);

    notifyAdmins({
      type: NOTIFICATION_TYPES.JOB_DELETED,
      title: `Lowongan Dihapus - ${deletedJob.judul}`,
      message: `Lowongan untuk posisi ${deletedJob.judul} telah dihapus dari sistem.`,
      actionUrl: "jobs",
      metadata: { jobId: deletedJob.id },
    });

    res.status(200).json({
      success: true,
      message: "Berhasil menghapus lowongan",
      data: deletedJob,
    });
  } catch (error) {
    res.status(error.statusCode || 404).json({
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