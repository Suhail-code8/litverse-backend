const mongoose = require("mongoose");
const Book = require("../src/models/book");
const Review = require("../src/models/review");


async function migrateReviews() {
  const books = await Book.find({ reviews: { $exists: true, $ne: [] } });
  console.log("Books found:", books.length);


  for (const book of books) {
    console.log("Migrating review for book:", book._id);
    for (const review of book.reviews) {
      try {
        await Review.create({
          user: review.user,
          book: book._id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        });
      } catch (err) {
        // ignore duplicate reviews
        if (err.code !== 11000) {
          console.error(err);
        }
      }
    }
  }

  console.log("Review migration completed");
  process.exit();
}

require("dotenv").config();
mongoose.connect(process.env.MONGO_URI)
  .then(migrateReviews)
  .catch(console.error);
