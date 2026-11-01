import fs from "fs/promises";
import path from "path";
import Food, { FOOD_CATEGORIES } from "../models/foodModel.js";
import ApiError, { asyncHandler } from "../utils/ApiError.js";
import { UPLOAD_DIR } from "../middleware/upload.js";

const removeImage = async (filename) => {
  if (!filename) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(filename)));
  } catch {
    /* file already gone – ignore */
  }
};

// GET /api/food/list?category=Salad&search=pasta
export const listFood = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = {};
  if (category && category !== "All") filter.category = category;
  if (search) {
    const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: safe, $options: "i" };
  }
  const foods = await Food.find(filter).sort({ createdAt: 1 }).lean();
  res.json({ success: true, data: foods });
});

// GET /api/food/categories
export const listCategories = (_req, res) => {
  res.json({ success: true, data: FOOD_CATEGORIES });
};

// POST /api/food/add  (admin, multipart/form-data)
export const addFood = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Food image is required");
  const { name, description, price, category } = req.body;
  const numericPrice = Number(price);

  if (!name || !description || !category || Number.isNaN(numericPrice) || numericPrice <= 0) {
    await removeImage(req.file.filename);
    throw new ApiError(400, "Name, description, category and a valid price are required");
  }

  try {
    const food = await Food.create({
      name,
      description,
      price: numericPrice,
      category,
      image: req.file.filename,
    });
    res.status(201).json({ success: true, message: "Food added", data: food });
  } catch (err) {
    await removeImage(req.file.filename);
    throw err;
  }
});

// POST /api/food/remove  { id }  (admin)
export const removeFood = asyncHandler(async (req, res) => {
  const id = req.body?.id;
  if (!id) throw new ApiError(400, "Food id is required");
  const food = await Food.findByIdAndDelete(id);
  if (!food) throw new ApiError(404, "Food not found");
  await removeImage(food.image);
  res.json({ success: true, message: "Food removed" });
});
