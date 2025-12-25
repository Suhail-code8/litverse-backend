const { Schema, model } = require("mongoose");

const BookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    category: { type: String, required: true },
    description: { type: String },
    stock: { type: Number, default: 0 },
    pages: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    language: { type: String, default: "English" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Book = model("Book", BookSchema);

module.exports = Book;
