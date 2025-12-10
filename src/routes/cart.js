const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const { getCart, removeFromCart, updateQty, addToCart } = require('../controllers/cart')

router.get("/",authMiddleware,getCart)
router.post("/",authMiddleware,addToCart)
router.put("/",authMiddleware,updateQty)
router.delete("/",authMiddleware,removeFromCart)

module.exports = router