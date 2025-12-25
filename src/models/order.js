const { Schema, model, Types } = require("mongoose");

const OrderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        book: {
          type: Types.ObjectId,
          ref: "Book",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    // 🔥 NEW — PAYMENT INFO
    paymentMethod: {
      type: String,
      enum: ["cod", "razorpay"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    paymentId: {
      type: String, // Razorpay payment id
    },

    // 🔥 ORDER STATUS (SHIPPING)
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = model("Order", OrderSchema);

module.exports = Order
