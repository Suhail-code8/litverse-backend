const express = require("express");
const router = express.Router();

const { addReview,getReviewsByBook } = require("../controllers/review");
const authMiddleware = require("../middlewares/authMiddleware");
const asyncWrapper = require("../utils/asyncWrapper");

// route to add review for a book
router.post("/", authMiddleware, asyncWrapper(addReview));
router.get("/:bookId", asyncWrapper(getReviewsByBook));


module.exports = router;
