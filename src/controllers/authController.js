const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { signAccess, signRefresh } = require("../utils/token");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
};

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are required",
      });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res
        .status(409)
        .json({ success: false, message: "email already in use" });
    }

    const user = new User({ name, email, password });

    const payload = { id: user._id.toString(), role: user.role };

    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    user.refreshTokenHash = hash;

    await user.save();

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const payload = { id: user._id.toString(), role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    user.refreshTokenHash = hash;
    await user.save();

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      console.error(error);
      res.clearCookie("refreshToken", cookieOptions);
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      res.clearCookie("refreshToken", cookieOptions);
      return res
        .status(401)
        .json({ success: false, message: "User not found for this token" });
    }

    // converting incoming token to the one in DB after hashing
    const incomingHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    if (user.refreshTokenHash !== incomingHash) {
      user.refreshTokenHash = null;
      await user.save();
      res.clearCookie("refreshToken", cookieOptions);
      return res
        .status(401)
        .json({ success: false, message: "Refresh token reuse detected" });
    }

    // refreshing the refreshToken after all validations
    const newPayload = { id: user._id.toString(), role: user.role };
    const accessToken = signAccess(newPayload);
    const newRefreshToken = signRefresh(newPayload);

    const newHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    user.refreshTokenHash = newHash;
    await user.save();
    
    res.cookie("refreshToken", newRefreshToken, cookieOptions);
     return res.status(200).json({
      success: true,
      accessToken,
    });

  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

module.exports = { register, login, refresh };
