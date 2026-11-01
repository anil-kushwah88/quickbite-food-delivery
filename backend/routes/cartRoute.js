import express from "express";
import { addToCart, getCart, removeFromCart, syncCart } from "../controllers/cartController.js";
import { requireUser } from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.use(requireUser);
cartRouter.post("/add", addToCart);
cartRouter.post("/remove", removeFromCart);
cartRouter.post("/get", getCart);
cartRouter.post("/sync", syncCart);

export default cartRouter;
