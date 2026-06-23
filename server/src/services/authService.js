const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const config = require("../config/env");
const { AppError } = require("../utils/errors");

const SALT_ROUNDS = 12;

class AuthService {
  async register({ name, email, password, role }) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "citizen",
    });

    const accessToken = this._generateAccessToken(user);
    const refreshToken = await this._generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email, isDeleted: false }).select(
      "+passwordHash"
    );
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const accessToken = this._generateAccessToken(user);
    const refreshToken = await this._generateRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  async logout(refreshTokenValue) {
    await RefreshToken.findOneAndDelete({ token: refreshTokenValue });
  }

  async refreshAccessToken(refreshTokenValue) {
    let decoded;
    try {
      decoded = jwt.verify(refreshTokenValue, config.jwtRefreshSecret);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const stored = await RefreshToken.findOne({ token: refreshTokenValue });
    if (!stored) {
      throw new AppError("Refresh token revoked", 401);
    }

    const user = await User.findById(decoded.sub);
    if (!user || user.isDeleted) {
      await RefreshToken.findOneAndDelete({ token: refreshTokenValue });
      throw new AppError("User not found", 401);
    }

    const accessToken = this._generateAccessToken(user);
    return { accessToken };
  }

  _generateAccessToken(user) {
    return jwt.sign(
      { sub: user._id.toString(), role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );
  }

  async _generateRefreshToken(user) {
    const token = jwt.sign(
      { sub: user._id.toString(), type: "refresh" },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiry }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({ token, user: user._id, expiresAt });

    return token;
  }
}

module.exports = new AuthService();
