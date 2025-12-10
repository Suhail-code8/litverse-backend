const Book = require("../models/book");
const User = require("../models/user");

async function getWishlist(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: "wishlist.book",
      match: { isActive: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const wishlist = user.wishlist.filter((item) => item.book);
    res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (err) {
    console.error("Get wishlist error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch wishlist" });
  }
}

async function addToWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;
    if (!bookId) {
    return  res.status(400).json({
        success: false,
        message: "Book-Id not provided",
      });
    }
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
    return res.status(404).json({
        success: false,
        message: "Book not found or is inactive",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
    return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const existance = user.wishlist.some(
      (item) => item.book.toString() === bookId
    );

    if (existance) {
      await user.populate("wishlist.book");
    return res.status(200).json({
        success: true,
        message: "Alredy exists in Wishlist",
        wishlist: user.wishlist,
      });
    }
    user.wishlist.push({ book: bookId });
    await user.save();
    await user.populate("wishlist.book");
    res.status(200).json({
      success: true,
      message: "Book added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to add product to wishlist" });
  }
}

async function removeFromWishlist(req, res) {
  try {
    const userId = req.user.id;
    const {bookId} = req.params
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.wishlist = user.wishlist.filter(item => item.book.toString() !== bookId)

    await user.save()
    await user.populate('wishlist.book')

    res.status(200).json({
        success : true,
        message : "Wishlist updated",
        wishlist : user.wishlist
    })

  } catch (err) {
    console.error("Remove from wishlist error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to remove from wishlist" });
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
