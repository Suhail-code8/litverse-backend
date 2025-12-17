const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist");
const asyncWrapper = require("../utils/asyncWrapper");

const router = express.Router();

router.get("/", authMiddleware, asyncWrapper(getWishlist));
router.post("/", authMiddleware, asyncWrapper(addToWishlist));
router.delete("/:bookId", authMiddleware, asyncWrapper(removeFromWishlist));

module.exports = router;
