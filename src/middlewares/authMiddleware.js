const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
require("dotenv").config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Checking existance of toke starts with Bearer keyword
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  // Try catch will catch error if token verification fails
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    throw new AppError("Invalid or expired access token", 401);
  }
}

module.exports = authMiddleware;
