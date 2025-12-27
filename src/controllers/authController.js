const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { signAccess, signRefresh } = require("../utils/token");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const sendMail = require("../utils/sendMail");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


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



// FORGOT PASSWORD

async function forgotPassword(req, res, next) {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });

  // Always respond success
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If this email exists, a reset link has been sent",
    });
  }


  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token for DB
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordTokenHash = resetTokenHash;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min expiry time

  await user.save();

  const resetUrl = `${process.env.CLIENT_URI}/reset-password/${resetToken}`;

  await sendMail({
    to: user.email,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <p>This link is valid for 15 minutes.</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn’t request this, ignore this email.</p>
    `,
  });

  return res.status(200).json({
    success: true,
    message: "If this email exists, a reset link has been sent",
  });
}



// RESET PASSWORD 

async function resetPassword(req, res, next) {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordTokenHash: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired reset link", 400);
  }

  // Update password 
  user.password = password;

  // Clear reset datas
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpires = null;

  // deactivate existing sessions so user should need to login again
  user.refreshTokenHash = null;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successful. Please login again.",
  });
}

async function getUser (req, res){
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt : user.createdAt
    },
  });
}


// GOOGLE AUTH

async function googleAuth(req, res, next) {
  const { credential } = req.body; // ID token from frontend

  if (!credential) {
    throw new AppError("Google credential missing", 400);
  }

  // 1️⃣ Verify token with Google
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub, email, name, email_verified } = payload;

  if (!email_verified) {
    throw new AppError("Google email not verified", 401);
  }

  // 2️⃣ Find or create user
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      name,
      email,
      password: crypto.randomBytes(32).toString("hex"), // dummy
      googleId: sub,
    });
  }

  if (user.isBlocked) {
    throw new AppError("User is blocked", 403);
  }

  // 3️⃣ Issue tokens (same as normal login)
  const jwtPayload = { id: user._id.toString(), role: user.role };

  const accessToken = signAccess(jwtPayload);
  const refreshToken = signRefresh(jwtPayload);

  const hash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

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


module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getUser,
  googleAuth
};
