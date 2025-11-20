const prisma = require("../../config/prisma");

const getAllUser = async (filter = {}) => {
  return await prisma.user.findMany(filter);
};

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

const createUser = async (data) => {
  return await prisma.user.create({ data });
};

const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      profile: true, 
    },
  });
};

const updateProfile = async (
  userId ,
  data,
) => {
  return await prisma.profile.update({
    where: { userId: userId },
    data: data, // langsung pakai object dari request
  });

};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
  getAllUser,
  updateProfile
};
