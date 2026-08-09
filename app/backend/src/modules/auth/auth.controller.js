// src/modules/auth/auth.controller.js
const authService = require("./auth.service");

const isProd = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

const LONG_LIVED_MAX_AGE = 10 * 365 * 24 * 60 * 60 * 1000;

const setCookies = (res, accessToken, refreshToken) => {
  if (accessToken) {
    res.cookie("accessToken", accessToken, {
      ...baseCookieOptions,
      maxAge: LONG_LIVED_MAX_AGE,
    });
  }
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      ...baseCookieOptions,
      maxAge: LONG_LIVED_MAX_AGE,
    });
  }
};

// ⚠️ FIX: body sekarang dibaca dengan nama kolom Prisma (nama, nik, nomor_hp)
const register = async (req, res) => {
  try {
    const { nama, email, password, nik, nomor_hp } = req.body;
    const result = await authService.requestRegisterOtp({ nama, email, password, nik, nomor_hp });
    return res.status(200).json({
      success: true,
      message: "OTP sedang dikirim. Silakan cek email kamu (dan folder spam).",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const { user } = await authService.verifyRegisterOtpAndCreateUser({ email, otp });
    return res.status(200).json({
      success: true,
      message: "Email berhasil diverifikasi. Akun berhasil dibuat. Silakan login.",
      user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.resendRegisterOtp(email);
    return res.status(200).json({
      success: true,
      message: "OTP baru sudah dikirim ke email.",
      data: { email },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    setCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login Success",
      user,
      accessToken,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    await authService.logout(refreshToken);
    res.clearCookie("accessToken", baseCookieOptions);
    res.clearCookie("refreshToken", baseCookieOptions);
    return res.status(200).json({ success: true, message: "Logged Out Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const result = await authService.refreshAccessToken(refreshToken);
    const accessToken = result?.accessToken;

    if (!accessToken) {
      return res.status(400).json({ success: false, message: "Failed to refresh access token" });
    }

    res.cookie("accessToken", accessToken, {
      ...baseCookieOptions,
      maxAge: LONG_LIVED_MAX_AGE,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const profile = await authService.getProfile(userId);
    return res.status(200).json({ success: true, message: "Profile fetched successfully", data: profile });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ⚠️ FIX: `data.tanggalLahir` -> `data.tanggal_lahir` (nama kolom Prisma)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const data = req.body;
    if (data.tanggal_lahir) data.tanggal_lahir = new Date(data.tanggal_lahir);
    const updatedProfile = await authService.updateProfile(userId, data);
    return res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedProfile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(userId, currentPassword, newPassword);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const requestReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email wajib diisi" });
    const result = await authService.requestPasswordReset(email);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.message === "Email tidak ditemukan") {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const confirmReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token & password baru wajib diisi" });
    }
    const result = await authService.confirmPasswordReset(token, newPassword);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  logout,
  refreshAccessToken,
  getProfile,
  updateProfile,
  changePassword,
  requestReset,
  confirmReset,
};