const authService = require("./auth.service");

const isProd = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

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
   ✅ OTP REGISTER FLOW
   ========================================================= */
const register = async (req, res) => {
  try {
    const { name, email, password, NIK, nomorHp } = req.body;

    const result = await authService.requestRegisterOtp({
      name,
      email,
      password,
      NIK,
      nomorHp,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sudah dikirim ke email. Silakan verifikasi OTP untuk menyelesaikan pendaftaran.",
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

/* =========================================================
   ✅ LOGIN FLOW
   ========================================================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await authService.login(email, password);

    setCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login Success",
      user,
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
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ success: true, message: "Token refreshed successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* =========================================================
   ✅ PROFILE
   ========================================================= */
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const profile = await authService.getProfile(userId);

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const data = req.body;
    if (data.tanggalLahir) data.tanggalLahir = new Date(data.tanggalLahir);

    const updatedProfile = await authService.updateProfile(userId, data);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
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

/* =========================================================
   ✅ RESET PASSWORD
   ========================================================= */
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
