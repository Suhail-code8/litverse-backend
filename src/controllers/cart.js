const Book = require("../models/book");
const Cart = require("../models/cart");

async function getCart(req, res) {
  try {
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
  } catch (err) {
    console.error("Get cart error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch cart" });
  }
}

async function addToCart(req, res) {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "bookId is required",
      });
    }

    const book = await Book.findById(bookId);

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: "Book not found or inactive",
      });
    }

    // Checking availability
    if (book.stock !== undefined && book.stock < 1) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock",
      });
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
        cart
      });
    }

    const existingItem = cart.items.find(
      (item) => item.book.toString() === bookId
    );
    // If user tries to add to cart the same item, we will show an alert "already added"
    if (existingItem) {
    return res.status(400).json({
        success: false,
        message: "Product is already in the cart",
      });
    } else {
      cart.items.push({
        book: bookId,
        qty: 1,
        priceAtAdd: book.price,
      });
    }

    await cart.save();
    await cart.populate("items.book");

    res.status(200).json({
      success: true,
      messsage: "Product added",
      cart,
    });
  } catch (err) {
    console.error("Add to Cart error : ", err);
    return res.status(500).json({
      success: false,
      message: "Adding to cart failed",
    });
  }
}

async function updateQty(req, res) {
  try {
    const userId = req.user.id;
    const { bookId, qty } = req.body;
    const quantity = Number(qty);

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "bookId is required",
      });
    }

    if (Number.isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: "qty must be a number",
      });
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.book");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.book && item.book._id.toString() === bookId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
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
        return res.status(400).json({
          success: false,
          message: "Not enough stock for this quantity",
        });
      }
      item.qty = quantity;
    }

    await cart.save();
    await cart.populate("items.book");

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart,
    });
  } catch (err) {
    console.error("Update cart item error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart item",
    });
  }
}

async function removeFromCart(req, res) {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "bookId is required",
      });
    }
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
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

    res.status(200).json({
      success: true,
      message: "Product removed",
      cart,
    });
  } catch (err) {
    console.error("Remove from cart error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to remove from cart" });
  }
}

module.exports = { getCart, addToCart, updateQty, removeFromCart };
