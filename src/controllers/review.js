const Review = require("../models/review");
const Book = require("../models/book");
const AppError = require("../utils/AppError");

// controller to add review for a book
async function addReview(req, res, next) {

  const userId = req.user.id;
  const { bookId, rating, comment } = req.body;

  if (!bookId || !rating) {
    throw new AppError("bookId and rating are required", 400);
  }

  // checking book existance
  const book = await Book.findById(bookId);
  if (!book || !book.isActive) {
    throw new AppError("Book not found or inactive", 404);
  }

  try {
    // creating review 
    await Review.create({
      user: userId,
      book: bookId,
      rating,
      comment,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this book",
      });
    }
    throw err;
  }

  return res.status(201).json({
    success: true,
    message: "Review added successfully",
  });
}

// controller to get reviews for a book
async function getReviewsByBook(req, res, next) {

  const { bookId } = req.params;

  if (!bookId) {
    throw new AppError("Book-Id not provided", 400);
  }

  // fetching reviews for this book
  const reviews = await Review.find({ book: bookId })
    .populate({
      path: "user",
      select: "name", // minimal user info
    })
    .sort({ createdAt: -1 }); // latest first

  return res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
}


module.exports = { addReview,getReviewsByBook};
