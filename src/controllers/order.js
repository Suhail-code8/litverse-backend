const Cart = require("../models/cart");
const Order = require("../models/order");
const Book = require("../models/book");
const AppError = require("../utils/AppError");

// =========================
// CREATE ORDER (USER)
// =========================
async function createOrder(req, res) {
  const userId = req.user.id;

  const cart = await Cart.findOne({ user: userId }).populate("items.book");

  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  let total = 0;

  const orderItems = cart.items.map((item) => {
    if (item.qty > item.book.stock) {
      throw new AppError(
        `Insufficient stock for ${item.book.title}`,
        400
      );
    }

    total += item.qty * item.book.price;

    return {
      book: item.book._id,
      qty: item.qty,
      price: item.book.price,
    };
  });

  // Reduce stock
  for (const item of cart.items) {
    await Book.findByIdAndUpdate(item.book._id, {
      $inc: { stock: -item.qty },
    });
  }

  const order = await Order.create({
    user: userId,
    items: orderItems,
    total,
  });

  // Clear cart
  cart.items = [];
  await cart.save();

  return res.status(201).json({
    success: true,
    order,
  });
}

// =========================
// USER ORDERS
// =========================
async function getUserOrders(req, res) {
  const orders = await Order.find({ user: req.user.id })
    .populate("items.book")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
}

// =========================
// ADMIN ORDERS
// =========================
async function getAllOrders(req, res) {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.book")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
}

// =========================
// UPDATE STATUS (ADMIN)
// =========================
async function updateOrderStatus(req, res) {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json({ success: true, order });
}

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};
