const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  getUser,
  googleAuth,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const asyncWrapper = require("../utils/asyncWrapper");

router.post("/register", asyncWrapper(register));
router.post("/login", asyncWrapper(login));
router.post("/logout", asyncWrapper(logout));
router.post("/refresh", asyncWrapper(refresh));
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/user", authMiddleware, asyncWrapper(getUser));
router.post("/google", asyncWrapper(googleAuth));

// router.get("/admin/users", authMiddleware, isAdmin, getAllUsers)



module.exports = router;
