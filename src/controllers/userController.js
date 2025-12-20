const User = require("../models/user");
const AppError = require("../utils/AppError");

async function getAllUsers(req, res, next) {
  const users = await User.find().select("-password -refreshTokenHash -__v");
  return res.status(200).json({ success: true, users });
}

async function getUserById(req, res, next) {
  const { id } = req.params;
  const user = await User.findById(id).select("-password -refreshTokenHash -__v");
  if (!user) throw new AppError("User not found", 404);
  return res.status(200).json({ success: true, user });
}

async function updateUser(req, res, next) {
  const { id } = req.params;
  const allowed = ["role", "isBlocked", "name", "email"];
  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });
  if (Object.keys(updates).length === 0) throw new AppError("No valid fields to update", 400);
  const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).select("-password -refreshTokenHash -__v");
  if (!user) throw new AppError("User not found", 404);
  return res.status(200).json({ success: true, user });
}

async function deleteUser(req, res, next) {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", 404);
  await user.deleteOne();
  return res.status(200).json({ success: true, message: "User deleted" });
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
