// src/modules/auth/auth.controller.js
const authService = require("./auth.service");

const isProd = process.env.NODE_ENV === "production";

/**
 * ✅ Cookie options harus konsisten untuk:
 * - set cookie (login/register/refresh)
 * - clear cookie (logout)
 */
const baseCookieOptions = {
  httpOnly: true,
  secure: isProd, // DEV: false | PROD: true
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

/**
 * ✅ SATU pintu untuk set cookie
 */
const setCookies = (res, accessToken, refreshToken) => {
  if (accessToken) {
    res.cookie("accessToken", accessToken, {
      ...baseCookieOptions,
      maxAge: 2 * 60 * 60 * 1000,
    });
  }

  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      ...baseCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
};

/* =========================================================
   ✅ OTP REGISTER FLOW (BARU)
   - POST /auth/register      -> kirim OTP
   - POST /auth/verify-otp    -> verifikasi OTP & create user
   - POST /auth/resend-otp    -> kirim ulang OTP
   ========================================================= */

// STEP 1: request OTP (BELUM create user)
const register = async (req, res) => {
  try {
    const { name, email, password, NIK, nomorHp } = req.body;

    // ✅ minta OTP
    await authService.requestRegisterOtp({ name, email, password, NIK, nomorHp });

    return res.status(200).json({
      message: "OTP sudah dikirim ke email. Silakan verifikasi OTP untuk menyelesaikan pendaftaran.",
      data: { email },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// STEP 2: verify OTP -> create user
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { user } = await authService.verifyRegisterOtpAndCreateUser({ email, otp });

    // ✅ OPSIONAL: kalau kamu MAU auto-login setelah verify
    // (wajib auth.service.js mengembalikan token juga)
    // Jika kamu tidak auto-login, biarkan tidak set cookie.
    // Contoh kalau kamu ubah service untuk return tokens:
    // const { user, accessToken, refreshToken } =
    //   await authService.verifyRegisterOtpAndCreateUser({ email, otp });
    // setCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      message: "Email berhasil diverifikasi. Akun berhasil dibuat. Silakan login.",
      user,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// resend OTP
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.resendRegisterOtp(email);

    return res.status(200).json({
      message: "OTP baru sudah dikirim ke email.",
      data: { email },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/* =========================================================
   ✅ LOGIN FLOW (tetap)
   ========================================================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await authService.login(email, password);

    setCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      message: "Login Success",
      user,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    await authService.logout(refreshToken);

    res.clearCookie("accessToken", baseCookieOptions);
    res.clearCookie("refreshToken", baseCookieOptions);

    return res.status(200).json({
      message: "Logged Out Successfully",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    const result = await authService.refreshAccessToken(refreshToken);
    const accessToken = typeof result === "string" ? result : result?.accessToken;

    if (!accessToken) {
      return res.status(400).json({ message: "Failed to refresh access token" });
    }

    res.cookie("accessToken", accessToken, {
      ...baseCookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/* =========================================================
   ✅ PROFILE (tetap)
   ========================================================= */
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const profile = await authService.getProfile(userId);

    return res.status(200).json({
      status: "success",
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Failed to fetched profile",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const data = req.body;
    if (data.tanggalLahir) data.tanggalLahir = new Date(data.tanggalLahir);

    const updatedProfile = await authService.updateProfile(userId, data);

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

/* =========================================================
   ✅ CHANGE PASSWORD (tetap)  <-- ini yang bikin error kalau service tidak export
   ========================================================= */
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/* =========================================================
   ✅ RESET PASSWORD (tetap)
   ========================================================= */
const requestReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email wajib diisi" });

    const result = await authService.requestPasswordReset(email);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Email tidak ditemukan") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(400).json({ message: error.message });
  }
};

const confirmReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token & password baru wajib diisi" });
    }

    const result = await authService.confirmPasswordReset(token, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  // OTP register
  register,
  verifyOtp,
  resendOtp,

  // auth existing
  login,
  logout,
  refreshAccessToken,
  getProfile,
  updateProfile,
  changePassword,
  requestReset,
  confirmReset,
};
