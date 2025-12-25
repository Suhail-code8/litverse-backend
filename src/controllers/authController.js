const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { signAccess, signRefresh } = require("../utils/token");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
require("dotenv").config();

// Cookies options for reusing
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
};


// controller function for register route
async function register(req, res, next) {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("name, email and password are required", 400);
  }

  // Checking if email already existing in db
  const exist = await User.findOne({ email });
  if (exist) {
    throw new AppError("username or email already exist", 409);
  }

  // creating user model
  const user = new User({ name, email, password });

  const payload = { id: user._id.toString(), role: user.role };

  // creating tokens
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  // hashing refreshToken before saving in to db
  const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  user.refreshTokenHash = hash;

  await user.save();

  // Sending refresh in cokies and access in response
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
}


// controller function for login route
async function login(req, res, next) {

  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("email and password are required", 400);
  }

  // checking user existance
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }
    if (user.isBlocked === true) {
    throw new AppError("User is blocked", 403);
  }

  // verifiying password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  // creting , hashing , sending tokens                                
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
}


// controller for sending access by using refresh token(Refershes refresh token too);
async function refresh(req, res, next) {

  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new AppError("No refresh token", 401);
  }

  //Try catch below will catch error if jwt token is not valid;
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    console.error(error);
    res.clearCookie("refreshToken", cookieOptions);
    throw new AppError("Invalid refresh token", 401);
  }

  // clearing cookie if user is not on db
  const user = await User.findById(payload.id);
  if (!user) {
    res.clearCookie("refreshToken", cookieOptions);
    throw new AppError("User not found for this token", 401);
  }

  // hashing incoming token to compare with the one in DB 
  const incomingHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  if (user.refreshTokenHash !== incomingHash) {
    user.refreshTokenHash = null;
    await user.save();
    res.clearCookie("refreshToken", cookieOptions);
    throw new AppError("Refresh token reuse detected", 401);
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

  //Sending refreshToken in cookies and accessToken in responce
  res.cookie("refreshToken", newRefreshToken, cookieOptions);

  return res.status(200).json({
    success: true,
    accessToken,
  });
}


// controller for logout route
async function logout(req, res, next) {

  const token = req.cookies?.refreshToken;
  console.log("Logout called")
  if (token) {
            
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(payload.id);
      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }
    } catch (err) {
      console.error("Logout token verify error:", err);
      // logout should always succeed
    }
  }

  res.clearCookie("refreshToken",cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

module.exports = { register, login, refresh, logout };
