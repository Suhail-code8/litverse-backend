const { Schema, model, Types } = require("mongoose");
const bcrypt = require('bcryptjs')

const WishlistSchema = Schema(
  {
    book: {
      type: Types.ObjectId,
      ref: "Book",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    refreshTokenHash: { type: String ,default:null},
    isBlocked: { type: Boolean, default: false },
    wishlist: { type: [WishlistSchema], default: [] },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


UserSchema.methods.comparePassword  = function (typedPassword){
    return bcrypt.compare(typedPassword,this.password)
}

const User = model("User", UserSchema);

module.exports = User;
