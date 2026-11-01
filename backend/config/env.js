import "dotenv/config";

const toList = (value) =>
  (value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tomato",
  jwtSecret: process.env.JWT_SECRET || "dev_only_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  adminEmail: (process.env.ADMIN_EMAIL || "admin@tomato.com").toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  adminUrl: process.env.ADMIN_URL || "http://localhost:5174",
  extraOrigins: toList(process.env.CORS_ORIGINS),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  currency: (process.env.CURRENCY || "usd").toLowerCase(),
  deliveryFee: Number(process.env.DELIVERY_FEE ?? 2),
  autoSeed: (process.env.AUTO_SEED ?? "true") === "true",
};

if (env.nodeEnv === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production");
}

export default env;
