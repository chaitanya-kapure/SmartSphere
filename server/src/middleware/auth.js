const jwt = require("jsonwebtoken");
const config = require("../config/env");
const { AppError } = require("../utils/errors");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Access token required", 401));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      department: decoded.department || null,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Access token expired", 401));
    }
    return next(new AppError("Invalid access token", 401));
  }
};

module.exports = { authenticate };
