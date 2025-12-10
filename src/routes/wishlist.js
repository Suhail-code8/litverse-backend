const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlist')

const router = express.Router()

router.get('/',authMiddleware,getWishlist)
router.post('/',authMiddleware,addToWishlist)
router.delete('/:bookId',authMiddleware,removeFromWishlist)

module.exports = router