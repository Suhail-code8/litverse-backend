const { Schema, model, Types } = require("mongoose");

const CartItemSchema = new Schema(
  {
    book: {
      type: Types.ObjectId,
      ref: "Book",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtAdd: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const CartSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Cart = model("Cart", CartSchema);

module.exports = Cart;
