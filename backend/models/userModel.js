import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    // { [foodId]: quantity }
    cartData: { type: Object, default: {} },
  },
  { timestamps: true, minimize: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
