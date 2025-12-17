const {Schema,model} = require("mongoose");

const wishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
  },
  { timestamps: true }
);

// avoid same user adding same book multiple times
wishlistSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = model("Wishlist", wishlistSchema);
