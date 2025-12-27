const Book = require("../models/book");
const Cart = require("../models/cart");
const AppError = require("../utils/AppError");

async function getCart(req, res, next) {

  const userId = req.user.id;

  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.book",
    match: { isActive: true },
  });

  // return empty if no items in cart
  if (!cart) {
    return res.status(200).json({
      success: true,
      items: [],
      count: 0,
    });
  }

  cart.items = cart.items.filter((item) => item.book);

  return res.status(200).json({
    success: true,
    items: cart.items,
    count: cart.items.length,
  });
}

async function addToCart(req, res, next) {

  const userId = req.user.id;
  const { bookId } = req.body;

  if (!bookId) {
    throw new AppError("bookId is required", 400);
  }

  const book = await Book.findById(bookId);

  if (!book || !book.isActive) {
    throw new AppError("Book not found or inactive", 404);
  }

  // Checking availability
  if (book.stock !== undefined && book.stock < 1) {
    throw new AppError("Not enough stock", 400);
  }

  let cart = await Cart.findOne({ user: userId });

  // Creating cart if doesnt have
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [
        {
          book: bookId,
          qty: 1,
          priceAtAdd: book.price,
        },
      ],
    });

    await cart.populate("items.book");

    return res.status(200).json({
      success: true,
      message: "Cart created and added Item",
      cart,
    });
  }

  const existingItem = cart.items.find(
    (item) => item.book.toString() === bookId
  );

  // If user tries to add to cart the same item, we will show an alert "already added"
  if (existingItem) {
    throw new AppError("Product is already in the cart", 400);
  } else {
    cart.items.push({
      book: bookId,
      qty: 1, 
      priceAtAdd: book.price,
    });
  }

  await cart.save();
  await cart.populate("items.book");

  return res.status(200).json({
    success: true,
    messsage: "Product added",
    cart,
  });
}

async function updateQty(req, res, next) {

  const userId = req.user.id;
  const { bookId, qty } = req.body;
  const quantity = Number(qty);

  if (!bookId) {
    throw new AppError("bookId is required", 400);
  }

  if (Number.isNaN(quantity)) {
    throw new AppError("qty must be a number", 400);
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.book");

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const item = cart.items.find(
    (item) => item.book && item.book._id.toString() === bookId
  );

  if (!item) {
    throw new AppError("Item not found in cart", 404);
  }

  // remove item when quantity <= 0
  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (item) => item.book._id.toString() !== bookId
    );
  } else {
    if (
      item.book.stock !== undefined &&
      quantity > item.book.stock
    ) {
      throw new AppError("Not enough stock for this quantity", 400);
    }
    item.qty = quantity;
  }

  await cart.save();
  await cart.populate("items.book");

  return res.status(200).json({
    success: true,
    message: "Cart quantity updated",
    cart,
  });
}

async function removeFromCart(req, res, next) {

  const userId = req.user.id;
  const { bookId } = req.body;

  if (!bookId) {
    throw new AppError("bookId is required", 400);
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const countBefore = cart.items.length;
  cart.items = cart.items.filter((item) => item.book.toString() !== bookId);

  // countBefore will be same to cartLength if product not in the cart
  if (countBefore === cart.items.length) {
    await cart.populate("items.book");
    return res.status(200).json({
      success: true,
      message: "No changes (item not in the cart)",
      cart,
    });
  }

  await cart.save();
  await cart.populate("items.book");

  return res.status(200).json({
    success: true,
    message: "Product removed",
    cart,
  });
}

module.exports = { getCart, addToCart, updateQty, removeFromCart };
