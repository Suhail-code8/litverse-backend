const express = require("express");
const router = express.Router();
const asyncWrapper = require("../utils/asyncWrapper");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");
const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");

router.get("/", auth, isAdmin, asyncWrapper(getAllUsers));
router.get("/:id", auth, isAdmin, asyncWrapper(getUserById));
router.patch("/:id", auth, isAdmin, asyncWrapper(updateUser));
router.delete("/:id", auth, isAdmin, asyncWrapper(deleteUser));

module.exports = router;
