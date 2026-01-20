const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const redisClient = require("../../config/redis");
const authRepository = require("./auth.repository");
const { sendResetPasswordEmail, sendOtpEmail } = require("./mail.service");

/* =========================
   Token helpers
   ========================= */
const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redisClient.set(`refresh_token:${userId}`, refreshToken, {
    EX: 7 * 24 * 60 * 60,
  });
};

/* =========================================================
   ✅ OTP REGISTER FLOW (FAST + NON-BLOCKING EMAIL)
   ========================================================= */
const OTP_TTL_SEC = 5 * 60;
const makeOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const normEmail = (email) => String(email || "").trim().toLowerCase();

const otpKey = (email) => `otp_register:${normEmail(email)}`;
const pendingKey = (email) => `otp_register_payload:${normEmail(email)}`;

/**
 * STEP 1: request OTP (cepat)
 * - simpan OTP + payload (Redis) -> cepat
 * - kirim email OTP: NON-BLOCKING (tidak await)
 */
const requestRegisterOtp = async ({ name, email, password, NIK, nomorHp }) => {
  if (!name || !email || !password) {
    throw new Error("Nama, email, dan password wajib diisi");
  }

  const cleanEmail = normEmail(email);

  const existingUser = await authRepository.findUserByEmail(cleanEmail);
  if (existingUser) throw new Error("Email sudah digunakan");

  const otp = makeOtp();

  // ✅ 1) simpan OTP + payload dulu (ini yang harus cepat)
  await redisClient.set(otpKey(cleanEmail), otp, { EX: OTP_TTL_SEC });
  await redisClient.set(
    pendingKey(cleanEmail),
    JSON.stringify({
      name,
      email: cleanEmail,
      password, // plaintext sementara (TTL 5 menit)
      NIK,
      nomorHp,
    }),
    { EX: OTP_TTL_SEC }
  );

  // ✅ 2) kirim email OTP TIDAK blocking
  // backend akan balas cepat tanpa menunggu SMTP
  sendOtpEmail(cleanEmail, otp)
    .then((info) => {
      console.log("[OTP EMAIL] SENT", {
        to: cleanEmail,
        messageId: info?.messageId,
        accepted: info?.accepted,
        rejected: info?.rejected,
        response: info?.response,
      });
    })
    .catch((e) => {
      console.error("[OTP EMAIL] FAILED", {
        to: cleanEmail,
        message: e?.message,
        code: e?.code,
        responseCode: e?.responseCode,
        command: e?.command,
        response: e?.response,
      });
    });

  return { email: cleanEmail };
};

/**
 * STEP 2: verify OTP -> create user
 */
const verifyRegisterOtpAndCreateUser = async ({ email, otp }) => {
  if (!email || !otp) throw new Error("Email dan OTP wajib diisi");

  const cleanEmail = normEmail(email);

  const storedOtp = await redisClient.get(otpKey(cleanEmail));
  if (!storedOtp)
    throw new Error("OTP sudah kadaluarsa. Silakan kirim ulang OTP.");

  if (String(storedOtp) !== String(otp)) throw new Error("OTP salah.");

  const payloadStr = await redisClient.get(pendingKey(cleanEmail));
  if (!payloadStr)
    throw new Error("Data pendaftaran tidak ditemukan / kadaluarsa. Ulangi daftar.");

  const payload = JSON.parse(payloadStr);

  // double check email belum terpakai
  const existingUser = await authRepository.findUserByEmail(payload.email);
  if (existingUser) {
    await redisClient.del(otpKey(cleanEmail));
    await redisClient.del(pendingKey(cleanEmail));
    throw new Error("Email sudah digunakan");
  }

  // ✅ hash dilakukan di sini (setelah OTP benar)
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await authRepository.createUser({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
    profile: { create: { NIK: payload.NIK, nomorHp: payload.nomorHp } },
  });

  await redisClient.del(otpKey(cleanEmail));
  await redisClient.del(pendingKey(cleanEmail));

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

/**
 * Resend OTP (tetap await biar user yakin)
 * + log error detail kalau gagal
 */
const resendRegisterOtp = async (email) => {
  const cleanEmail = normEmail(email);
  if (!cleanEmail) throw new Error("Email wajib diisi");

  const payloadStr = await redisClient.get(pendingKey(cleanEmail));
  if (!payloadStr)
    throw new Error("Tidak ada proses pendaftaran aktif. Silakan isi form daftar lagi.");

  const otp = makeOtp();
  await redisClient.set(otpKey(cleanEmail), otp, { EX: OTP_TTL_SEC });

  try {
    await sendOtpEmail(cleanEmail, otp);
  } catch (e) {
    console.error("[RESEND OTP EMAIL] FAILED", {
      to: cleanEmail,
      message: e?.message,
      code: e?.code,
      responseCode: e?.responseCode,
      command: e?.command,
      response: e?.response,
    });
    throw new Error("Gagal mengirim OTP. Silakan coba lagi beberapa saat.");
  }

  return true;
};

/* =========================================================
   ✅ LOGIN / LOGOUT / REFRESH
   ========================================================= */
const login = async (email, password) => {
  const user = await authRepository.findUserByEmail(normEmail(email));
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
  if (!storedToken || storedToken !== refreshToken)
    throw new Error("Invalid refresh token");

  const user = await authRepository.findUserById(decoded.id);
  if (!user) throw new Error("User not found");

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  return { accessToken };
};

/* =========================================================
   ✅ PROFILE / CHANGE PASSWORD / RESET PASSWORD
   ========================================================= */
const getProfile = async (userId) => authRepository.findUserById(userId);

/**
 * ✅ FIX: Sinkronkan Profile.fullName dengan User.name
 * - kalau frontend kirim "fullName" => update Profile.fullName & User.name
 * - kalau frontend kirim "name"     => update User.name & Profile.fullName
 */
const updateProfile = async (userId, data) => {
  const existingUser = await authRepository.findUserById(userId);
  if (!existingUser) throw new Error("Profile not found");

  // ✅ nama baru bisa datang dari "name" atau "fullName"
  const incomingName =
    (data?.name && String(data.name).trim()) ||
    (data?.fullName && String(data.fullName).trim()) ||
    null;

  // ✅ payload update Profile
  const profilePayload = { ...data };

  // Profile tidak punya kolom "name"
  if (profilePayload?.name !== undefined) delete profilePayload.name;

  // kalau ada incomingName, pastikan profile.fullName ter-update
  if (incomingName) {
    profilePayload.fullName = incomingName;
  }

  // 1) update Profile
  const updatedProfile = await authRepository.updateProfile(userId, profilePayload);

  // 2) sync ke User.name
  if (incomingName) {
    await authRepository.updateUserName(userId, incomingName);
  }

  return updatedProfile;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword)
    throw new Error("Password saat ini & password baru wajib diisi");
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

const requestPasswordReset = async (email) => {
  const user = await authRepository.findUserByEmail(normEmail(email));
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
