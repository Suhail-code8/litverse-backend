const razorpay = require("../config/razorpay");

const crypto = require("crypto");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Book = require("../models/book");
const AppError = require("../utils/AppError");

exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;


    if (!amount || amount <= 0) {
      throw new AppError("Invalid payment amount", 400);
    }

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), 
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Razorpay create order error:", err);
    next(err);
  }
};


exports.verifyPayment = async (req, res) => {
  const userId = req.user.id;
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    single,
    bookId,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new AppError("Invalid payment signature", 400);
  }

  let items = [];
  let total = 0;

  if (single && bookId) {
    const book = await Book.findById(bookId);
    if (!book || book.stock < 1) {
      throw new AppError("Book unavailable", 400);
    }

    items.push({
      book: book._id,
      qty: 1,
      price: book.price,
    });

    total = book.price;
    await Book.findByIdAndUpdate(book._id, { $inc: { stock: -1 } });
  } else {
    const cart = await Cart.findOne({ user: userId }).populate("items.book");
    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart empty", 400);
    }

    for (const item of cart.items) {
      total += item.qty * item.book.price;
      items.push({
        book: item.book._id,
        qty: item.qty,
        price: item.book.price,
      });

      await Book.findByIdAndUpdate(item.book._id, {
        $inc: { stock: -item.qty },
      });
    }

    cart.items = [];
    await cart.save();
  }

  const order = await Order.create({
    user: userId,
    items,
    total,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    paymentId: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
  });

  res.json({ success: true, order });
};

