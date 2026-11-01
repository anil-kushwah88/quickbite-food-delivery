import express from "express";
import cors from "cors";
import env from "./config/env.js";
import ApiError from "./utils/ApiError.js";
import { UPLOAD_DIR } from "./middleware/upload.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();

const allowedOrigins = new Set([env.frontendUrl, env.adminUrl, ...env.extraOrigins]);

app.disable("x-powered-by");
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow tools like Postman/curl (no origin) and any localhost port in development
      if (!origin || allowedOrigins.has(origin)) return cb(null, true);
      if (env.nodeEnv !== "production" && /^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
      cb(new ApiError(403, `CORS blocked for origin ${origin}`));
    },
  })
);
app.use(express.json({ limit: "1mb" }));

// Static food images
app.use("/images", express.static(UPLOAD_DIR, { maxAge: "7d" }));

app.get("/", (_req, res) => res.send("Tomato API is running 🍅"));
app.get("/api/health", (_req, res) => res.json({ success: true, status: "ok", uptime: process.uptime() }));

app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
