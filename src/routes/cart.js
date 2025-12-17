const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const { getCart, removeFromCart, updateQty, addToCart } = require('../controllers/cart')
const asyncWrapper = require('../utils/asyncWrapper')

router.get("/",authMiddleware,asyncWrapper( getCart))
router.post("/",authMiddleware,asyncWrapper(addToCart))
router.put("/",authMiddleware,asyncWrapper(updateQty))
router.delete("/",authMiddleware,asyncWrapper(removeFromCart))

module.exports = router