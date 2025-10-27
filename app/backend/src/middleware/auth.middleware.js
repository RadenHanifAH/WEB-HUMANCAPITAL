const jwt = require("jsonwebtoken");
const { findUserById } = require("../modules/auth/auth.repository");

const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        message: "Unauthorized - No access token provided",
      });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      if (user.password) delete user.password;

      req.user = user;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Unauthorized - Access token expired",
        });
      }
      throw error;
    }
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized - Invalid access token",
    });
  }
};

const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied - admin only",
    });
  }
};

module.exports = {
  protectRoute,
  adminRoute,
};
