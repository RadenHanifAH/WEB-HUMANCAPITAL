const prisma = require("../../config/prisma");


const createJob = async (data) => {
  return await prisma.job.create({
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
      status: data.status || "open",
    },
  });
};

const findJobById = async (id) => {
  return await prisma.job.findUnique({
    where: { id: parseInt(id) },
    include: {
      applications: true,
    },
  });
};

const updateJob = async (id, data) => {
  return await prisma.job.update({
    where: { id: parseInt(id) },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.department && { department: data.department }),
      ...(data.location && { location: data.location }),
      ...(data.type && { type: data.type }),
      ...(data.experience && { experience: data.experience }),
      ...(data.education && { education: data.education }),
      ...(data.description && { description: data.description }),
      ...(data.requirements && { requirements: data.requirements }),
      ...(data.deadline && { deadline: new Date(data.deadline) }),
      ...(data.status && { status: data.status }),
    },
  });
};


const deleteJob = async (id) => {
  return await prisma.job.delete({
    where: { id: parseInt(id) },
  });
};

const findJobs = async (filter, skip, limit) => {
  return await prisma.job.findMany({
    where: filter,
    skip: skip,
    take: limit,
  });
};

const countJobs = async (filter) => {
  return await prisma.job.count({
    where: filter,
  });
};

module.exports = {
  findJobs,
  findJobById,
  createJob,
  countJobs,
  updateJob,
  deleteJob,
};
