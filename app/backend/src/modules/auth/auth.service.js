const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../../config/redis");
const authRepository = require("./auth.repository");

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redisClient.set(`refresh_token:${userId}`, refreshToken, {
    EX: 7 * 24 * 60 * 60, // 7 hari
  });
};

const register = async (name, email, password) => {
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) throw new Error(" Email sudah digunakan");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await authRepository.createUser({ name, email, password: hashedPassword });
  const { accessToken, refreshToken } = generateTokens(user);
  await storeRefreshToken(user.id, refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

const login = async (email, password) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw new Error(" Email tidak ditemukan");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Password Salah");
  const { accessToken, refreshToken } = generateTokens(user);
  await storeRefreshToken(user.id, refreshToken);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

const logout = async (refreshToken) => {
  if (!refreshToken) return;

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  await redisClient.del(`refresh_token:${decoded.id}`);
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new Error(" No refresh token provided");

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);

  if (storedToken !== refreshToken) throw new Error(" Invalid refresh token");

  const accessToken = jwt.sign(
    { id: decoded.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  return accessToken;
};


const getProfile = async (userId) => {
  const user = await authRepository.findUserById(userId);

  return user;
};

const updateProfile = async (userId, data) => {
  const existingProfile = await authRepository.findUserById(userId);

  if (!existingProfile) throw new Error("Profile not found");

  const updatedProfile = await authRepository.updateProfile(userId, data);

  return updatedProfile;
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getProfile,
  updateProfile,
};
