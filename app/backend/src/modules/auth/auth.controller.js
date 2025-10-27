const authService = require("./auth.service");

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent CSRF attacks
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 15 minutes
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const { user, accessToken, refreshToken } = await authService.register(
      name,
      email,
      password
    );

    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password
    );

    setCookies(res, accessToken, refreshToken);

    res.json({
      message: "Login Success",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    await authService.logout(refreshToken);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
      message: "Logged Out Successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const accessToken = await authService.refreshAccessToken(refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getProfile,
};
