import express from "express";
import { getProfile, loginUser, registerUser } from "../controllers/userController.js";
import { requireUser } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/me", requireUser, getProfile);

export default userRouter;
