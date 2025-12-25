const Book = require("../models/book");
const AppError = require("../utils/AppError");
const mongoose = require("mongoose");
const cloudinary = require('../config/cloudinary')

async function getAllBooks(req, res, next) {
  let books;
  if (req.query.role === "admin") {
    books = await Book.find();
  } else {
    books = await Book.find({ isActive: true });
  }

  return res.status(200).json({
    success: true,
    count: books.length,
    books,
  });
}

async function getBookById(req, res, next) {
  const { id } = req.params;
  console.log(id);

  const book = await Book.findById(id);

  if (!book || !book.isActive) {
    throw new AppError("Book not found", 404);
  }

  return res.status(200).json({
    success: true,
    book,
  });
}

async function createBook(req, res, next) {
  const {
    title,
    author,
    price,
    costPrice,
    category,
    description,
    stock,
    rating,
    language,
    pages,
  } = req.body;

  if (!title || !author || !price || !category) {
    throw new AppError("Required fields are missing", 400);
  }

  if (!req.file) {
    throw new AppError("Book image is required", 400);
  }

  // Check duplicate title
  const existingBook = await Book.findOne({
    title: { $regex: `^${title}$`, $options: "i" },
  });
  if (existingBook) {
    throw new AppError(`Book with title "${title}" already exists`, 409);
  }

  // Upload image to Cloudinary
  const uploadResult = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
    { folder: "books" }
  );

  const book = await Book.create({
    title,
    author,
    price,
    costPrice: costPrice || 0,
    category,
    description,
    stock,
    rating,
    language,
    pages,
    image: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    },
  });

  return res.status(201).json({
    success: true,
    book,
  });
}


async function updateBook(req, res, next) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid book id", 400);
  }

  const book = await Book.findById(id);
  if (!book) {
    throw new AppError("Book not found", 404);
  }

  const allowedFields = [
    "title",
    "author",
    "price",
    "costPrice",
    "category",
    "description",
    "stock",
    "rating",
    "language",
    "pages",
    "isActive",
  ];

  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  // If new image uploaded → replace old image
  if (req.file) {
    if (book.image?.publicId) {
      await cloudinary.uploader.destroy(book.image.publicId);
    }

    const uploadResult = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      { folder: "books" }
    );

    updates.image = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError("No valid fields provided for update", 400);
  }

  const updatedBook = await Book.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    book: updatedBook,
  });
}


async function deleteBook(req, res, next) {
  const { id } = req.params;

  const book = await Book.findById(id);
  if (!book) {
    throw new AppError("Book not found", 404);
  }

  if (book.image?.publicId) {
    await cloudinary.uploader.destroy(book.image.publicId);
  }

  await book.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Book deleted successfully",
  });
}


module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
