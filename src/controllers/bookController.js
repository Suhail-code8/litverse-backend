const Book = require("../models/book");
const AppError = require("../utils/AppError");

async function getAllBooks(req, res, next) {

  const books = await Book.find({ isActive: true });

  return res.status(200).json({
    success: true,
    count: books.length,
    books,
  });
}

async function getBookById(req, res, next) {

  const { id } = req.params;

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
    image,
    category,
    description,
    stock,
    rating,
    language,
  } = req.body;

  if (!title || !author || !price || !costPrice || !image || !category) {
    throw new AppError("Required fields are missing", 400);
  }

  const book = await Book.create({
    title,
    author,
    price,
    costPrice,
    image,
    category,
    description,
    stock,
    rating,
    language,
  });

  return res.status(201).json({
    success: true,
    book,
  });
}

async function updateBook(req, res, next) {

  const { id } = req.params;

  const updates = {
    title: req.body.title,
    author: req.body.author,
    price: req.body.price,
    costPrice: req.body.costPrice,
    image: req.body.image,
    category: req.body.category,
    description: req.body.description,
    stock: req.body.stock,
    rating: req.body.rating,
    language: req.body.language,
    isActive: req.body.isActive,
  };

  const book = await Book.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!book) {
    throw new AppError("Book not found", 404);
  }

  return res.status(200).json({
    success: true,
    book,
  });
}

async function deleteBook(req, res, next) {

  const { id } = req.params;

  const book = await Book.findById(id);
  if (!book) {
    throw new AppError("Book not found", 404);
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
