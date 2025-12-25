const express = require("express");
const { createPaymentOrder, verifyPayment } = require("../controllers/paymentController");
const  auth  = require("../middlewares/authMiddleware");
const asyncWrapper = require("../utils/asyncWrapper");

const router = express.Router();

router.post("/create-order", auth, asyncWrapper(createPaymentOrder));
router.post("/verify", auth, asyncWrapper(verifyPayment));

module.exports = router;
