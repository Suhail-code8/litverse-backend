const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");
const asyncWrapper = require("../utils/asyncWrapper");

const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order");

// USER
router.post("/", auth, asyncWrapper(createOrder));
router.get("/my", auth, asyncWrapper(getUserOrders));

// ADMIN
router.get("/", auth, isAdmin, asyncWrapper(getAllOrders));
router.patch("/:id", auth, isAdmin, asyncWrapper(updateOrderStatus));

module.exports = router;
