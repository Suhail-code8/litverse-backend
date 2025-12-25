const Cart = require("../models/cart");
const Order = require("../models/order");
const Book = require("../models/book");
const AppError = require("../utils/AppError");

// =========================
// CREATE ORDER (USER)
// =========================
async function createOrder(req, res) {
  const userId = req.user.id;
  const { single, bookId, paymentMethod, paymentStatus, paymentId } = req.body;

  let orderItems = [];
  let total = 0;

  // =========================
  // 🟢 SINGLE PRODUCT ORDER
  // =========================
  if (single && bookId) {
    const book = await Book.findById(bookId);

    if (!book) {
      throw new AppError("Book not found", 404);
    }

    if (book.stock < 1) {
      throw new AppError("Book out of stock", 400);
    }

    orderItems.push({
      book: book._id,
      qty: 1,
      price: book.price,
    });

    total = book.price;

    // Reduce stock
    await Book.findByIdAndUpdate(book._id, {
      $inc: { stock: -1 },
    });
  }

  // =========================
  // 🟢 CART BASED ORDER
  // =========================
  else {
    const cart = await Cart.findOne({ user: userId }).populate("items.book");

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    for (const item of cart.items) {
      if (item.qty > item.book.stock) {
        throw new AppError(`Insufficient stock for ${item.book.title}`, 400);
      }

      total += item.qty * item.book.price;

      orderItems.push({
        book: item.book._id,
        qty: item.qty,
        price: item.book.price,
      });
    }

    // Reduce stock
    for (const item of cart.items) {
      await Book.findByIdAndUpdate(item.book._id, {
        $inc: { stock: -item.qty },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();
  }

  // =========================
  // 🟢 CREATE ORDER
  // COD ONLY
  const order = await Order.create({
    user: userId,
    items: orderItems,
    total,
    paymentMethod: "cod",
    paymentStatus: "pending",
  });

  return res.status(201).json({
    success: true,
    order,
  });
}

async function getUserOrders(req, res) {
  const orders = await Order.find({ user: req.user.id })
    .populate("items.book")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
}

async function getAllOrders(req, res) {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.book")
    .sort({ createdAt: -1 });
console.log(orders);

  res.json({ success: true, orders });
}

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
