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
const asyncWrapper = require("../utils/asyncWrapper");
const upload = require("../middlewares/upload");

router.get("/", asyncWrapper(getAllBooks));
router.get("/:id", asyncWrapper(getBookById));

router.post("/", authMiddleware, isAdmin,upload.single("image"), asyncWrapper(createBook));
router.put("/:id", authMiddleware, isAdmin,upload.single("image"), asyncWrapper(updateBook));
router.delete("/:id/delete", authMiddleware, isAdmin,upload.single("image"), asyncWrapper(deleteBook));

module.exports = router;
