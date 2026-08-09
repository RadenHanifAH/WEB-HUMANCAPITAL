// src/modules/auth/auth.service.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authRepository = require("./auth.repository");
const { sendResetPasswordEmail, sendOtpEmail } = require("./mail.service");

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.peran };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
  );

  return { accessToken, refreshToken };
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const storeRefreshToken = async (userId, refreshToken) => {
  await authRepository.saveRefreshTokenHash(userId, hashToken(refreshToken));
};

// Field profil dikirim/diterima PERSIS sesuai nama kolom model `profil`
// di schema.prisma: nik, jenis_kelamin, nomor_hp, tempat_lahir,
// tanggal_lahir, alamat, foto_profil, tentang.

// Whitelist kolom `profil` yang boleh di-upsert lewat PUT /auth/profile,
// supaya body request tidak bisa menulis kolom lain sembarangan.
const ALLOWED_PROFIL_FIELDS = [
  "nik",
  "jenis_kelamin",
  "nomor_hp",
  "tempat_lahir",
  "tanggal_lahir",
  "alamat",
  "foto_profil",
  "tentang",
];

function pickAllowedProfilFields(data) {
  const result = {};
  for (const key of ALLOWED_PROFIL_FIELDS) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
}

// Bentuk "safeUser" final, dipakai di login, verifyRegisterOtpAndCreateUser,
// getProfile, DAN updateProfile, supaya bentuknya SELALU sama persis di
// semua endpoint. Field mengikuti nama kolom Prisma langsung (nama,
// peran, divisi, created_at), dan `profil` dikirim nested apa adanya
// (nik, jenis_kelamin, nomor_hp, dst — persis nama kolom model `profil`).
function toSafeUser(user) {
  const profil = user.profil
    ? {
        nik: user.profil.nik,
        jenis_kelamin: user.profil.jenis_kelamin,
        nomor_hp: user.profil.nomor_hp,
        tempat_lahir: user.profil.tempat_lahir,
        tanggal_lahir: user.profil.tanggal_lahir,
        alamat: user.profil.alamat,
        foto_profil: user.profil.foto_profil,
        tentang: user.profil.tentang,
      }
    : {
        nik: null,
        jenis_kelamin: null,
        nomor_hp: null,
        tempat_lahir: null,
        tanggal_lahir: null,
        alamat: null,
        foto_profil: null,
        tentang: null,
      };

  return {
    id: user.id,
    nama: user.nama,
    email: user.email,
    peran: user.peran,
    divisi: user.divisi,
    created_at: user.created_at,
    profil,
  };
}

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const makeOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const normEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const requestRegisterOtp = async ({
  nama,
  email,
  password,
  nik,
  nomor_hp,
}) => {
  if (!nama || !email || !password) {
    throw new Error("Nama lengkap, email, dan password wajib diisi");
  }

  const cleanEmail = normEmail(email);

  const existingUser = await authRepository.findUserByEmail(cleanEmail);
  if (existingUser) throw new Error("Email sudah digunakan");

  const otp = makeOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const passwordHash = await bcrypt.hash(password, 10);

  await authRepository.upsertPendingRegistration(cleanEmail, {
    nama,
    hash_password: passwordHash,
    nik: nik || "",
    nomor_hp: nomor_hp || "",
    hash_otp: otpHash,
    otp_kadaluarsa: new Date(Date.now() + OTP_TTL_MS),
    percobaan: 0,
  });

  sendOtpEmail(cleanEmail, otp).catch(console.error);

  return { email: cleanEmail };
};

const verifyRegisterOtpAndCreateUser = async ({ email, otp }) => {
  if (!email || !otp) throw new Error("Email dan OTP wajib diisi");

  const cleanEmail = normEmail(email);

  const pending = await authRepository.findPendingByEmail(cleanEmail);
  if (!pending) {
    throw new Error(
      "Data pendaftaran tidak ditemukan / kadaluarsa. Ulangi daftar.",
    );
  }

  if (pending.otp_kadaluarsa.getTime() < Date.now()) {
    await authRepository.deletePendingByEmail(cleanEmail);
    throw new Error("OTP sudah kadaluarsa. Silakan kirim ulang OTP.");
  }

  if (pending.percobaan >= MAX_OTP_ATTEMPTS) {
    await authRepository.deletePendingByEmail(cleanEmail);
    throw new Error("Terlalu banyak percobaan salah. Silakan daftar ulang.");
  }

  const isOtpValid = await bcrypt.compare(String(otp), pending.hash_otp);
  if (!isOtpValid) {
    await authRepository.incrementPendingAttempt(cleanEmail);
    throw new Error("OTP salah.");
  }

  const existingUser = await authRepository.findUserByEmail(pending.email);
  if (existingUser) {
    await authRepository.deletePendingByEmail(cleanEmail);
    throw new Error("Email sudah digunakan");
  }

  const user = await authRepository.createUser({
    nama: pending.nama,
    email: pending.email,
    password: pending.hash_password,
    profil: {
      create: {
        nik: pending.nik,
        nomor_hp: pending.nomor_hp,
      },
    },
  });

  // ⚠️ FIX: pendaftaran_tertunda TIDAK dihapus lagi setelah user berhasil
  // dibuat. Record-nya cuma disambungkan ke user baru lewat pengguna_id,
  // supaya riwayat proses pendaftaran (OTP) tetap ada & tersambung ke akun.
  await authRepository.linkPendingToUser(cleanEmail, user.id);

  return { user: toSafeUser(user) };
};

const resendRegisterOtp = async (email) => {
  const cleanEmail = normEmail(email);
  if (!cleanEmail) throw new Error("Email wajib diisi");

  const pending = await authRepository.findPendingByEmail(cleanEmail);
  if (!pending) {
    throw new Error(
      "Tidak ada proses pendaftaran aktif. Silakan isi form daftar lagi.",
    );
  }

  const otp = makeOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  await authRepository.updatePendingOtp(cleanEmail, {
    hash_otp: otpHash,
    otp_kadaluarsa: new Date(Date.now() + OTP_TTL_MS),
  });

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

const login = async (email, password) => {
  const user = await authRepository.findUserByEmail(normEmail(email));
  if (!user) throw new Error("Email tidak ditemukan");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Password Salah");

  const { accessToken, refreshToken } = generateTokens(user);
  await storeRefreshToken(user.id, refreshToken);

  authRepository.updateLastLogin(user.id).catch((err) => {
    console.error("Gagal update lastLoginAt:", err.message);
  });

  return { user: toSafeUser(user), accessToken, refreshToken };
};

const logout = async (refreshToken) => {
  if (!refreshToken) return;
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  await authRepository.clearRefreshTokenHash(decoded.id);
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new Error("No refresh token provided");

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await authRepository.findUserById(decoded.id);
  if (!user) throw new Error("User not found");

  const incomingHash = hashToken(refreshToken);
  if (!user.hash_refresh_token || user.hash_refresh_token !== incomingHash) {
    throw new Error("Invalid refresh token");
  }

  const payload = { id: user.id, email: user.email, role: user.peran };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);

  return { accessToken };
};

const getProfile = async (userId) => {
  const userData = await authRepository.findUserByIdSafe(userId);
  if (!userData) return null;
  return toSafeUser(userData);
};

// ⚠️ FIX: body request dibaca langsung dengan nama kolom Prisma.
// `nama` tetap dipisah (kolom tabel pengguna, bukan tabel profil),
// sisanya (nik, jenis_kelamin, nomor_hp, tempat_lahir, tanggal_lahir,
// alamat, foto_profil, tentang) di-upsert ke tabel profil apa adanya.
//
// ✅ FIX: return value sekarang HARUS bentuk `toSafeUser()` yang sama
// persis dengan login()/getProfile() — { id, nama, email, peran, divisi,
// created_at, profil: { nik, jenis_kelamin, ... } } — bukan object flat
// seperti sebelumnya. Ini supaya frontend (ProfilePage.jsx) bisa
// langsung `setUser(res.data.data)` tanpa perlu menyusun ulang manual
// jadi nested, dan bentuk `user` di store selalu konsisten di semua
// endpoint (login, checkAuth, updateProfile).
const updateProfile = async (userId, data) => {
  const existingUser = await authRepository.findUserById(userId);

  if (!existingUser) {
    throw new Error("Profile not found");
  }

  const { nama, ...restFrontendData } = data;

  if (nama?.trim()) {
    await authRepository.updateUserFullName(userId, nama.trim());
  }

  const profilData = pickAllowedProfilFields(restFrontendData);
  await authRepository.updateProfile(userId, profilData);

  const refreshedUser = await authRepository.findUserById(userId);
  return toSafeUser(refreshedUser);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error("Password saat ini & password baru wajib diisi");
  }
  if (newPassword.length < 6)
    throw new Error("Password baru minimal 6 karakter");

  const user = await authRepository.findUserById(userId);
  if (!user) throw new Error("User tidak ditemukan");

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw new Error("Password saat ini salah");

  const sameAsOld = await bcrypt.compare(newPassword, user.password);
  if (sameAsOld)
    throw new Error("Password baru tidak boleh sama dengan password lama");

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

  const FE = String(process.env.FRONTEND_URL || "").replace(/\/$/, "");
  if (!FE) throw new Error("FRONTEND_URL belum di-set");

  const resetLink = `${FE}/reset-password/${rawToken}`;
  await sendResetPasswordEmail(user.email, resetLink);

  return { message: "Link reset password telah dikirim ke email kamu." };
};

const confirmPasswordReset = async (rawToken, newPassword) => {
  if (!rawToken) throw new Error("Token reset wajib diisi");
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

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