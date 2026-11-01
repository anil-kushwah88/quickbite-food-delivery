import express from "express";
import { adminLogin, getStats } from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/auth.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/stats", requireAdmin, getStats);

export default adminRouter;
