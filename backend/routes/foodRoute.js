import express from "express";
import { addFood, listCategories, listFood, removeFood } from "../controllers/foodController.js";
import { requireAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const foodRouter = express.Router();

foodRouter.get("/list", listFood);
foodRouter.get("/categories", listCategories);
foodRouter.post("/add", requireAdmin, upload.single("image"), addFood);
foodRouter.post("/remove", requireAdmin, removeFood);

export default foodRouter;
