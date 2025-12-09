const Book = require("../models/book");

async function getAllBooks(req, res) {
  try {
    const books = await Book.find({ isActive: true });

    return res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch books" });
  }
}

async function getBookById(req, res) {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);

    if (!book || !book.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    return res.status(200).json({
      success: true,
      book,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Invalid book id" });
  }
}

async function createBook(req, res) {
  try {
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
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
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
    res.status(201).json({ success: true, book });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create book" });
  }
}

async function updateBook(req, res) {
  try {
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
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    return res.status(200).json({
      success: true,
      book,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ success: false, message: "Failed to update book" });
  }
}

async function deleteBook(req, res) {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: "Failed to delete book",
    });
  }
}

module.exports = { getAllBooks, getBookById, createBook, updateBook,deleteBook };
