const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
  {
    reviewer: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    date: {
      type: Date,
      required: true,
    },
    review: {
      type: String,
      default: "",
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const BookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 }, // 👈 for profit calc
    image: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    language: { type: String, default: "English" },
    isActive: { type: Boolean, default: true },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

const Book = model("Book", BookSchema);

module.exports = Book;
