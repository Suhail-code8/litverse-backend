const express = require("express");
const router = express.Router();
const asyncWrapper = require("../utils/asyncWrapper");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");
const { getStats } = require("../controllers/adminController");

router.get("/stats", auth, isAdmin, asyncWrapper(getStats));

module.exports = router;
