import crypto from "crypto";
import env from "../config/env.js";
import Order from "../models/orderModel.js";
import Food from "../models/foodModel.js";
import User from "../models/userModel.js";
import ApiError, { asyncHandler } from "../utils/ApiError.js";
import { signToken } from "../utils/token.js";

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

// POST /api/admin/login  { email, password }
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  if (!safeEqual(email.toLowerCase(), env.adminEmail) || !safeEqual(password, env.adminPassword)) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  res.json({ success: true, token: signToken({ role: "admin", email: env.adminEmail }) });
});

// GET /api/admin/stats
export const getStats = asyncHandler(async (_req, res) => {
  const validOrders = { $or: [{ paymentMethod: "cod" }, { payment: true }] };

  const [foods, users, orders, revenueAgg, byStatus, recent] = await Promise.all([
    Food.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(validOrders),
    Order.aggregate([
      { $match: { payment: true } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Order.aggregate([{ $match: validOrders }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.find(validOrders).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  res.json({
    success: true,
    data: {
      foods,
      users,
      orders,
      revenue: Math.round((revenueAgg[0]?.total || 0) * 100) / 100,
      byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      recentOrders: recent,
    },
  });
});
