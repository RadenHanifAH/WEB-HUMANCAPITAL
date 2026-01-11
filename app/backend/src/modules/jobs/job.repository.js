// src/modules/jobs/job.repository.js
const prisma = require("../../config/prisma");

const toIntId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) ? n : NaN;
};

const createJob = async (data) => {
  return prisma.job.create({
    data: {
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.type,
      experience: data.experience,
      education: data.education,
      description: data.description,
      requirements: data.requirements,
      deadline: data.deadline ? new Date(data.deadline) : null,

      // ✅ penting biar job admin/public konsisten
      status: data.status || "active",
    },
  });
};

const findJobById = async (id) => {
  const jobId = toIntId(id);
  if (!jobId) return null;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      _count: { select: { applications: true } },
      applications: true,
    },
  });

  if (!job) return null;

  return {
    ...job,
    applicants: job._count?.applications ?? (job.applications?.length ?? 0),
  };
};

const updateJob = async (id, data) => {
  const jobId = toIntId(id);
  if (!jobId) {
    const err = new Error("Job ID tidak valid");
    err.statusCode = 400;
    throw err;
  }

  const payload = {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.department !== undefined && { department: data.department }),
    ...(data.location !== undefined && { location: data.location }),
    ...(data.type !== undefined && { type: data.type }),
    ...(data.experience !== undefined && { experience: data.experience }),
    ...(data.education !== undefined && { education: data.education }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.requirements !== undefined && { requirements: data.requirements }),
    ...(data.deadline !== undefined && { deadline: data.deadline ? new Date(data.deadline) : null }),
    ...(data.status !== undefined && { status: data.status }),
  };

  // ✅ FIX UTAMA: updateMany agar tidak P2025
  const updated = await prisma.job.updateMany({
    where: { id: jobId },
    data: payload,
  });

  if (updated.count === 0) {
    const err = new Error("Lowongan tidak ditemukan (ID tidak ada)");
    err.statusCode = 404;
    throw err;
  }

  // kembalikan data yang sudah diupdate + applicants count
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { _count: { select: { applications: true } } },
  });

  return {
    ...job,
    applicants: job?._count?.applications ?? 0,
  };
};

const deleteJob = async (id) => {
  const jobId = toIntId(id);
  if (!jobId) {
    const err = new Error("Job ID tidak valid");
    err.statusCode = 400;
    throw err;
  }

  // optional: pakai deleteMany biar aman
  const deleted = await prisma.job.deleteMany({ where: { id: jobId } });

  if (deleted.count === 0) {
    const err = new Error("Lowongan tidak ditemukan (ID tidak ada)");
    err.statusCode = 404;
    throw err;
  }

  return { id: jobId };
};

const findJobs = async (filter, skip, limit) => {
  const jobs = await prisma.job.findMany({
    where: filter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { applications: true } },
    },
  });

  return jobs.map((j) => ({
    ...j,
    applicants: j._count?.applications ?? 0,
  }));
};

const countJobs = async (filter) => {
  return prisma.job.count({ where: filter });
};

module.exports = {
  findJobs,
  findJobById,
  createJob,
  countJobs,
  updateJob,
  deleteJob,
};
