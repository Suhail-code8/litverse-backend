const express = require("express");
const router = express.Router();

const {
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  createBook,
} = require("../controllers/bookController");

const authMiddleware = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");

router.get("/", getAllBooks);
router.post("/", authMiddleware, isAdmin, createBook);
router.put("/:id", authMiddleware, isAdmin, updateBook);
router.get("/:id", getBookById);
router.delete("/:id/delete", authMiddleware, isAdmin, deleteBook);
module.exports = router;
