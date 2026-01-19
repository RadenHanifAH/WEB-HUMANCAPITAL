// src/modules/auth/auth.service.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const redisClient = require("../../config/redis");
const authRepository = require("./auth.repository");

const { sendResetPasswordEmail, sendOtpEmail } = require("./mail.service");

/* =========================
   Token helpers (login)
   ========================= */
const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redisClient.set(`refresh_token:${userId}`, refreshToken, {
    EX: 7 * 24 * 60 * 60,
  });
};

/* =========================================================
   ✅ OTP REGISTER FLOW (Redis) - CEPAT
   ========================================================= */
const OTP_TTL_SEC = 5 * 60;

const makeOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const otpKey = (email) => `otp_register:${String(email || "").toLowerCase()}`;
const pendingKey = (email) =>
  `otp_register_payload:${String(email || "").toLowerCase()}`;

// ✅ Kirim OTP async (agar endpoint register cepat)
const sendOtpAsync = (email, otp) => {
  Promise.resolve()
    .then(() => sendOtpEmail(email, otp))
    .then(() => console.log("[OTP] sent to:", email))
    .catch((err) => console.error("[OTP] send failed:", email, err?.message || err));
};

// STEP 1: request OTP (belum create user)
const requestRegisterOtp = async ({ name, email, password, NIK, nomorHp }) => {
  if (!name || !email || !password) {
    throw new Error("Nama, email, dan password wajib diisi");
  }

  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) throw new Error("Email sudah digunakan");

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = makeOtp();

  await redisClient.set(otpKey(email), otp, { EX: OTP_TTL_SEC });
  await redisClient.set(
    pendingKey(email),
    JSON.stringify({ name, email, password: hashedPassword, NIK, nomorHp }),
    { EX: OTP_TTL_SEC }
  );

  // ✅ kirim otp tanpa await (biar cepat)
  sendOtpAsync(email, otp);

  return { email };
};

// STEP 2: verify OTP -> create user
const verifyRegisterOtpAndCreateUser = async ({ email, otp }) => {
  if (!email || !otp) throw new Error("Email dan OTP wajib diisi");

  const storedOtp = await redisClient.get(otpKey(email));
  if (!storedOtp) throw new Error("OTP sudah kadaluarsa. Silakan kirim ulang OTP.");

  if (String(storedOtp) !== String(otp)) throw new Error("OTP salah.");

  const payloadStr = await redisClient.get(pendingKey(email));
  if (!payloadStr) throw new Error("Data pendaftaran tidak ditemukan / kadaluarsa. Ulangi daftar.");

  const payload = JSON.parse(payloadStr);

  // double check email belum terpakai
  const existingUser = await authRepository.findUserByEmail(payload.email);
  if (existingUser) {
    await redisClient.del(otpKey(email));
    await redisClient.del(pendingKey(email));
    throw new Error("Email sudah digunakan");
  }

  const user = await authRepository.createUser({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    profile: { create: { NIK: payload.NIK, nomorHp: payload.nomorHp } },
  });

  await redisClient.del(otpKey(email));
  await redisClient.del(pendingKey(email));

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    profile: user.profile || null,
  };

  return { user: safeUser };
};

// resend OTP
const resendRegisterOtp = async (email) => {
  if (!email) throw new Error("Email wajib diisi");

  const payloadStr = await redisClient.get(pendingKey(email));
  if (!payloadStr) throw new Error("Tidak ada proses pendaftaran aktif. Silakan isi form daftar lagi.");

  const otp = makeOtp();
  await redisClient.set(otpKey(email), otp, { EX: OTP_TTL_SEC });

  // ✅ kirim otp tanpa await
  sendOtpAsync(email, otp);

  return true;
};

/* =========================================================
   ✅ LOGIN / LOGOUT / REFRESH (tetap)
   ========================================================= */
const login = async (email, password) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw new Error("Email tidak ditemukan");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Password Salah");

  const { accessToken, refreshToken } = generateTokens(user);
  await storeRefreshToken(user.id, refreshToken);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile || null,
  };

  return { user: safeUser, accessToken, refreshToken };
};

const logout = async (refreshToken) => {
  if (!refreshToken) return;
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  await redisClient.del(`refresh_token:${decoded.id}`);
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new Error("No refresh token provided");

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);
  if (!storedToken || storedToken !== refreshToken) throw new Error("Invalid refresh token");

  const user = await authRepository.findUserById(decoded.id);
  if (!user) throw new Error("User not found");

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  return { accessToken };
};

/* =========================================================
   ✅ PROFILE
   ========================================================= */
const getProfile = async (userId) => authRepository.findUserById(userId);

const updateProfile = async (userId, data) => {
  const existingUser = await authRepository.findUserById(userId);
  if (!existingUser) throw new Error("Profile not found");
  return authRepository.updateProfile(userId, data);
};

/* =========================================================
   ✅ CHANGE PASSWORD
   ========================================================= */
const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error("Password saat ini & password baru wajib diisi");
  }
  if (newPassword.length < 6) throw new Error("Password baru minimal 6 karakter");

  const user = await authRepository.findUserById(userId);
  if (!user) throw new Error("User tidak ditemukan");

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw new Error("Password saat ini salah");

  const sameAsOld = await bcrypt.compare(newPassword, user.password);
  if (sameAsOld) throw new Error("Password baru tidak boleh sama dengan password lama");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await authRepository.updateUserPassword(userId, hashedPassword);

  return { message: "Password berhasil diganti" };
};

/* =========================================================
   ✅ RESET PASSWORD
   ========================================================= */
const requestPasswordReset = async (email) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw new Error("Email tidak ditemukan");

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await authRepository.saveResetToken(user.id, tokenHash, expiresAt);

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
  await sendResetPasswordEmail(user.email, resetLink);

  return { message: "Link reset password telah dikirim ke email kamu." };
};

const confirmPasswordReset = async (rawToken, newPassword) => {
  if (!rawToken) throw new Error("Token reset wajib diisi");
  if (!newPassword || newPassword.length < 6) throw new Error("Password minimal 6 karakter");

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const user = await authRepository.findUserByValidResetTokenHash(tokenHash);
  if (!user) throw new Error("Token reset tidak valid atau sudah kadaluarsa.");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await authRepository.updatePasswordAndClearReset(user.id, hashedPassword);

  return { message: "Password berhasil direset. Silakan login." };
};

module.exports = {
  requestRegisterOtp,
  verifyRegisterOtpAndCreateUser,
  resendRegisterOtp,

  login,
  refreshAccessToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,

  requestPasswordReset,
  confirmPasswordReset,
};
