// src/modules/auth/auth.repository.js
const prisma = require("../../config/prisma");

const getAllUser = async (filter = {}) => prisma.pengguna.findMany(filter);

const findUserByEmail = async (email) => {
  return prisma.pengguna.findUnique({
    where: { email },
    include: { profil: true },
  });
};

const createUser = async (data) => {
  return prisma.pengguna.create({
    data,
    include: { profil: true },
  });
};

const findUserById = async (id) => {
  return prisma.pengguna.findUnique({
    where: { id },
    include: { profil: true },
  });
};

const findUserByIdSafe = async (id) => {
  return prisma.pengguna.findUnique({
    where: { id },
    select: {
      id: true,
      nama: true,
      email: true,
      peran: true,
      divisi: true,
      status_akun: true,
      login_terakhir: true,
      created_at: true,
      profil: true,
    },
  });
};

const updateProfile = async (userId, data) => {
  return prisma.profil.upsert({
    where: { pengguna_id: userId },
    update: data,
    create: { pengguna_id: userId, ...data },
  });
};

const updateUserFullName = async (userId, nama) => {
  return prisma.pengguna.update({
    where: { id: userId },
    data: { nama },
  });
};

const updateUserPassword = async (userId, hashedPassword) => {
  return prisma.pengguna.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

const saveResetToken = async (userId, tokenHash, expiresAt) => {
  return prisma.pengguna.update({
    where: { id: userId },
    data: {
      hash_token_reset_password: tokenHash,
      reset_password_kadaluarsa: expiresAt,
    },
  });
};

const findUserByValidResetTokenHash = async (tokenHash) => {
  return prisma.pengguna.findFirst({
    where: {
      hash_token_reset_password: tokenHash,
      reset_password_kadaluarsa: { gt: new Date() },
    },
    include: { profil: true },
  });
};

const updatePasswordAndClearReset = async (userId, hashedPassword) => {
  return prisma.pengguna.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      hash_token_reset_password: null,
      reset_password_kadaluarsa: null,
    },
  });
};

const updateLastLogin = async (userId) => {
  return prisma.pengguna.update({
    where: { id: userId },
    data: { login_terakhir: new Date() },
  });
};

const saveRefreshTokenHash = async (userId, refreshTokenHash) => {
  return prisma.pengguna.update({
    where: { id: userId },
    data: { hash_refresh_token: refreshTokenHash },
  });
};

const clearRefreshTokenHash = async (userId) => {
  return prisma.pengguna.update({
    where: { id: userId },
    data: { hash_refresh_token: null },
  });
};

const upsertPendingRegistration = async (email, data) => {
  return prisma.pendaftaran_tertunda.upsert({
    where: { email },
    update: { ...data, updated_at: new Date() },
    create: { email, ...data, updated_at: new Date() },
  });
};

const findPendingByEmail = async (email) => {
  return prisma.pendaftaran_tertunda.findUnique({ where: { email } });
};

const updatePendingOtp = async (email, { otpHash, otpExpires }) => {
  return prisma.pendaftaran_tertunda.update({
    where: { email },
    data: { hash_otp: otpHash, otp_kadaluarsa: otpExpires, percobaan: 0, updated_at: new Date() },
  });
};

const incrementPendingAttempt = async (email) => {
  return prisma.pendaftaran_tertunda.update({
    where: { email },
    data: { percobaan: { increment: 1 }, updated_at: new Date() },
  });
};

const deletePendingByEmail = async (email) => {
  return prisma.pendaftaran_tertunda.delete({ where: { email } }).catch(() => null);
};

// ⬅️ BARU: dipakai setelah user berhasil dibuat dari OTP.
// pendaftaran_tertunda TIDAK dihapus, cuma disambungkan (pengguna_id diisi)
// supaya riwayat proses pendaftarannya tetap ada dan tersambung ke akun barunya.
const linkPendingToUser = async (email, userId) => {
  return prisma.pendaftaran_tertunda
    .update({
      where: { email },
      data: { pengguna_id: userId, updated_at: new Date() },
    })
    .catch(() => null);
};

module.exports = {
  getAllUser,
  findUserByEmail,
  createUser,
  findUserById,
  findUserByIdSafe,

  updateProfile,
  updateUserFullName,

  updateUserPassword,

  saveResetToken,
  findUserByValidResetTokenHash,
  updatePasswordAndClearReset,

  updateLastLogin,

  saveRefreshTokenHash,
  clearRefreshTokenHash,

  upsertPendingRegistration,
  findPendingByEmail,
  updatePendingOtp,
  incrementPendingAttempt,
  deletePendingByEmail,
  linkPendingToUser, // ⬅️ BARU
};