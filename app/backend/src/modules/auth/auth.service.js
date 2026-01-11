const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const redisClient = require("../../config/redis");
const authRepository = require("./auth.repository");
const { sendResetPasswordEmail } = require("./mail.service");

/* =========================
   Token helpers (login)
   ========================= */
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  // refresh token cukup id saja
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redisClient.set(`refresh_token:${userId}`, refreshToken, {
    EX: 7 * 24 * 60 * 60, // 7 hari
  });
};

/* =========================
   Register
   ========================= */
const register = async (name, email, password, NIK, nomorHp) => {
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) throw new Error("Email sudah digunakan");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await authRepository.createUser({
    name,
    email,
    password: hashedPassword,
    profile: {
      create: { NIK, nomorHp },
    },
  });

  const { accessToken, refreshToken } = generateTokens(user);
  await storeRefreshToken(user.id, refreshToken);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    profile: user.profile
      ? {
          id: user.profile.id,
          NIK: user.profile.NIK,
          nomorHp: user.profile.nomorHp,
        }
      : null,
  };

  return { user: safeUser, accessToken, refreshToken };
};

/* =========================
   Login
   ========================= */
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

/* =========================
   Logout
   ========================= */
const logout = async (refreshToken) => {
  if (!refreshToken) return;

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  await redisClient.del(`refresh_token:${decoded.id}`);
};

/* =========================
   Refresh access token ✅ FIX
   ========================= */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new Error("No refresh token provided");

  // verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  // cek token tersimpan di redis
  const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);
  if (!storedToken || storedToken !== refreshToken) {
    throw new Error("Invalid refresh token");
  }

  // ✅ ambil user dari DB supaya email & role valid
  const user = await authRepository.findUserById(decoded.id);
  if (!user) throw new Error("User not found");

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  return { accessToken };
};

/* =========================
   Profile
   ========================= */
const getProfile = async (userId) => {
  return authRepository.findUserById(userId);
};

const updateProfile = async (userId, data) => {
  const existingUser = await authRepository.findUserById(userId);
  if (!existingUser) throw new Error("Profile not found");

  const updatedProfile = await authRepository.updateProfile(userId, data);
  return updatedProfile;
};

/* =========================================================
   ✅ RESET PASSWORD (UPDATED)
   - kalau email tidak ada -> THROW "Email tidak ditemukan"
   ========================================================= */
const requestPasswordReset = async (email) => {
  const user = await authRepository.findUserByEmail(email);

  // ✅ kamu minta dibedakan:
  if (!user) {
    throw new Error("Email tidak ditemukan");
  }

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

  // ✅ samakan rule kamu (8 char + uppercase + number + symbol) jika mau
  if (!newPassword || newPassword.length < 6)
    throw new Error("Password minimal 6 karakter");

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await authRepository.findUserByValidResetTokenHash(tokenHash);
  if (!user) throw new Error("Token reset tidak valid atau sudah kadaluarsa.");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await authRepository.updatePasswordAndClearReset(user.id, hashedPassword);

  return { message: "Password berhasil direset. Silakan login." };
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getProfile,
  updateProfile,
  requestPasswordReset,
  confirmPasswordReset,
};
