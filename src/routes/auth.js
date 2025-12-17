const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  refresh,
} = require("../controllers/authController");

const asyncWrapper = require("../utils/asyncWrapper");

router.post("/register", asyncWrapper(register));
router.post("/login", asyncWrapper(login));
router.post("/logout", asyncWrapper(logout));
router.post("/refresh", asyncWrapper(refresh));

module.exports = router;
