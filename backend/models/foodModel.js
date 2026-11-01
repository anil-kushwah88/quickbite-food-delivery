import mongoose from "mongoose";

export const FOOD_CATEGORIES = [
  "Salad",
  "Rolls",
  "Deserts",
  "Sandwich",
  "Cake",
  "Pure Veg",
  "Pasta",
  "Noodles",
];

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true, enum: FOOD_CATEGORIES },
  },
  { timestamps: true }
);

const Food = mongoose.models.Food || mongoose.model("Food", foodSchema);

export default Food;
