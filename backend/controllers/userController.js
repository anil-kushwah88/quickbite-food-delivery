import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../models/userModel.js";
import ApiError, { asyncHandler } from "../utils/ApiError.js";
import { signToken } from "../utils/token.js";

const createUserToken = (user) => signToken({ id: user._id.toString(), role: "user" });

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

// POST /api/user/register
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name?.trim() || !email || !password) throw new ApiError(400, "All fields are required");
  if (!validator.isEmail(email)) throw new ApiError(400, "Please enter a valid email");
  if (password.length < 8) throw new ApiError(400, "Password must be at least 8 characters");

  const exists = await User.exists({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "An account with this email already exists");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name: name.trim(), email, password: hashed });

  res.status(201).json({ success: true, token: createUserToken(user), user: publicUser(user) });
});

// POST /api/user/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  res.json({ success: true, token: createUserToken(user), user: publicUser(user) });
});

// GET /api/user/me
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, user: publicUser(user) });
});
