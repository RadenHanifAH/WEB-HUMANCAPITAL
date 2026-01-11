const prisma = require("../../config/prisma");

const getAllUser = async (filter = {}) => prisma.user.findMany(filter);

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });
};

const createUser = async (data) => {
  return prisma.user.create({
    data,
    include: { profile: true },
  });
};

const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
};

const updateProfile = async (userId, data) => {
  return prisma.profile.update({
    where: { userId },
    data,
  });
};

// reset password helpers
const saveResetToken = async (userId, tokenHash, expiresAt) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: expiresAt,
    },
  });
};

const findUserByValidResetTokenHash = async (tokenHash) => {
  return prisma.user.findFirst({
    where: {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { gt: new Date() },
    },
    include: { profile: true },
  });
};

const updatePasswordAndClearReset = async (userId, hashedPassword) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      resetPasswordTokenHash: null,
      resetPasswordExpires: null,
    },
  });
};

module.exports = {
  getAllUser,
  findUserByEmail,
  createUser,
  findUserById,
  updateProfile,
  saveResetToken,
  findUserByValidResetTokenHash,
  updatePasswordAndClearReset,
};
