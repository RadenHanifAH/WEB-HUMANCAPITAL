const prisma = require("../../config/prisma");

const findJobs = async (filter = {}) => {
  return await prisma.job.findMany(filter);
};

const createJob = async (data) => {
  return await prisma.job.create(data);
};

const findJobById = async (id) => {
  return await prisma.job.findUnique({
    where: {
      id,
    },
  });
};

const updateJob = async (id, data) =>{
    return await prisma.job.update({
        where:{
            id
        },
        data,
    })
}

const deleteJob = async (id) => {
    return await prisma.job.delete({
        where: {
            id,
        }
    })
}

module.exports = {
    findJobs,
    findJobById,
    createJob,
    updateJob,
    deleteJob,
}