import express from "express";
import {
  getCheckoutConfig,
  listOrders,
  placeOrder,
  updateStatus,
  userOrders,
  verifyOrder,
} from "../controllers/orderController.js";
import { requireAdmin, requireUser } from "../middleware/auth.js";

const orderRouter = express.Router();

// Public
orderRouter.get("/config", getCheckoutConfig);

// Customer
orderRouter.post("/place", requireUser, placeOrder);
orderRouter.post("/verify", requireUser, verifyOrder);
orderRouter.post("/userorders", requireUser, userOrders);

// Admin
orderRouter.get("/list", requireAdmin, listOrders);
orderRouter.post("/status", requireAdmin, updateStatus);

export default orderRouter;
