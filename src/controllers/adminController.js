const User = require("../models/user");
const Book = require("../models/book");
const Order = require("../models/order");

async function getStats(req, res, next) {
  const usersCount = await User.countDocuments();
  const productsCount = await Book.countDocuments();
  const ordersCount = await Order.countDocuments();

  const revenueAgg = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  const revenue = (revenueAgg[0] && revenueAgg[0].total) || 0;

  return res.status(200).json({
    success: true,
    stats: { usersCount, productsCount, ordersCount, revenue },
  });
}

module.exports = { getStats };
