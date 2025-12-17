const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// one user should review a book only once
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// for making fetching reviews for a book simple
reviewSchema.index({ book: 1 });

const Review = model("Review", reviewSchema);
module.exports = Review