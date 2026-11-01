import mongoose from "mongoose";
import User from "../models/userModel.js";
import Food from "../models/foodModel.js";
import ApiError, { asyncHandler } from "../utils/ApiError.js";

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const assertItemId = (itemId) => {
  if (!itemId || !mongoose.isValidObjectId(itemId)) throw new ApiError(400, "Valid itemId is required");
};

// POST /api/cart/add  { itemId }
export const addToCart = asyncHandler(async (req, res) => {
  const { itemId } = req.body || {};
  assertItemId(itemId);
  if (!(await Food.exists({ _id: itemId }))) throw new ApiError(404, "Food not found");

  const user = await getUser(req.userId);
  const cart = { ...user.cartData };
  cart[itemId] = (cart[itemId] || 0) + 1;
  user.cartData = cart;
  await user.save();

  res.json({ success: true, message: "Added to cart", cartData: cart });
});

// POST /api/cart/remove  { itemId }
export const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.body || {};
  assertItemId(itemId);

  const user = await getUser(req.userId);
  const cart = { ...user.cartData };
  if (cart[itemId] > 1) cart[itemId] -= 1;
  else delete cart[itemId];
  user.cartData = cart;
  await user.save();

  res.json({ success: true, message: "Removed from cart", cartData: cart });
});

// POST /api/cart/get
export const getCart = asyncHandler(async (req, res) => {
  const user = await getUser(req.userId);
  const cart = user.cartData || {};

  // Drop items whose food was deleted by the admin
  const ids = Object.keys(cart).filter((id) => mongoose.isValidObjectId(id));
  const existing = new Set((await Food.find({ _id: { $in: ids } }, "_id").lean()).map((f) => f._id.toString()));
  const cleaned = Object.fromEntries(Object.entries(cart).filter(([id, qty]) => existing.has(id) && qty > 0));

  if (Object.keys(cleaned).length !== Object.keys(cart).length) {
    user.cartData = cleaned;
    await user.save();
  }

  res.json({ success: true, cartData: cleaned });
});

// POST /api/cart/sync  { cartData }  – merges a guest cart after login
export const syncCart = asyncHandler(async (req, res) => {
  const incoming = req.body?.cartData || {};
  const user = await getUser(req.userId);
  const cart = { ...user.cartData };

  const ids = Object.keys(incoming).filter((id) => mongoose.isValidObjectId(id));
  const existing = new Set((await Food.find({ _id: { $in: ids } }, "_id").lean()).map((f) => f._id.toString()));

  for (const [id, qty] of Object.entries(incoming)) {
    const n = Math.floor(Number(qty));
    if (existing.has(id) && n > 0) cart[id] = Math.max(cart[id] || 0, Math.min(n, 99));
  }

  user.cartData = cart;
  await user.save();
  res.json({ success: true, cartData: cart });
});
