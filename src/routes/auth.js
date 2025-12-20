const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  refresh,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const asyncWrapper = require("../utils/asyncWrapper");

router.post("/register", asyncWrapper(register));
router.post("/login", asyncWrapper(login));
router.post("/logout", asyncWrapper(logout));
router.post("/refresh", asyncWrapper(refresh));
// router.get("/admin/users", authMiddleware, isAdmin, getAllUsers)



router.get("/user", authMiddleware, asyncWrapper(async (req, res) => {
  const User = require("../models/user");
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}));




module.exports = router;
