const jwt = require("jsonwebtoken");
require("dotenv").config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Checking existance of toke starts with Bearer keyword
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  // Try catch will catch error if token verification fails
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired access token" });
  }
}

module.exports = authMiddleware;
