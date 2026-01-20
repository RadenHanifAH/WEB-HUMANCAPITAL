// src/modules/auth/auth.repository.js
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

/* =========================
   ✅ SYNC name dari fullName
   ========================= */
const updateUserName = async (userId, name) => {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
  });
};

const updateUserPassword = async (userId, hashedPassword) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
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

/* =========================
   ✅ OTP Register (Pending)
   ========================= */
const upsertPendingRegistration = async (email, data) => {
  return prisma.pendingRegistration.upsert({
    where: { email },
    update: data,
    create: { email, ...data },
  });
};

const findPendingByEmail = async (email) => {
  return prisma.pendingRegistration.findUnique({ where: { email } });
};

const incrementPendingAttempt = async (email) => {
  return prisma.pendingRegistration.update({
    where: { email },
    data: { attempts: { increment: 1 } },
  });
};

const deletePendingByEmail = async (email) => {
  return prisma.pendingRegistration.delete({ where: { email } });
};

module.exports = {
  getAllUser,
  findUserByEmail,
  createUser,
  findUserById,

  updateProfile,
  updateUserName,

  updateUserPassword,

  saveResetToken,
  findUserByValidResetTokenHash,
  updatePasswordAndClearReset,

  upsertPendingRegistration,
  findPendingByEmail,
  incrementPendingAttempt,
  deletePendingByEmail,
};
