const Book = require("../models/book");
const User = require("../models/user");
const Wishlist = require("../models/wishlist");
const AppError = require("../utils/AppError");

// controller to get wishlist items
async function getWishlist(req, res, next) {

  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // fetching wishlist items for this user
  const wishlistItems = await Wishlist.find({ user: userId }).populate({
    path: "book",
    match: { isActive: true }, // filtering inactive books
  });

  // removing items where book is not available
  const wishlist = wishlistItems.filter((item) => item.book);

  return res.status(200).json({
    success: true,
    count: wishlist.length,
    wishlist,
  });
}

// controller to add book to wishlist
async function addToWishlist(req, res, next) {

  const userId = req.user.id;
  const { bookId } = req.body;

  if (!bookId) {
    throw new AppError("Book-Id not provided", 400);
  }

  // checking book existance and status
  const book = await Book.findById(bookId);
  if (!book || !book.isActive) {
    throw new AppError("Book not found or is inactive", 404);
  }

  try {
    // creating wishlist entry 
    await Wishlist.create({
      user: userId,
      book: bookId,
    });
  } catch (err) {
    // if book already exists in wishlist
    if (err.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Already exists in Wishlist",
      });
    }
    throw err;
  }

  return res.status(200).json({
    success: true,
    message: "Book added to wishlist",
  });
}

// controller to remove book from wishlist
async function removeFromWishlist(req, res, next) {

  const userId = req.user.id;
  const { bookId } = req.params;

  // removing wishlist item for this user and book
  const result = await Wishlist.findOneAndDelete({
    user: userId,
    book: bookId,
  });

  // if item is not present, still return success
  if (!result) {
    return res.status(200).json({
      success: true,
      message: "No changes (item not in wishlist)",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Wishlist updated",
  });
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
