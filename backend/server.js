import env from "./config/env.js";
import connectDB from "./config/db.js";
import { isStripeEnabled } from "./config/stripe.js";
import { seedFoods } from "./seed/seed.js";
import app from "./app.js";

const start = async () => {
  try {
    await connectDB();

    if (env.autoSeed) {
      const seeded = await seedFoods();
      if (seeded) console.log(`Seeded ${seeded} demo dishes`);
    }

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`Payments: ${isStripeEnabled() ? "Stripe + Cash on Delivery" : "Cash on Delivery only (no STRIPE_SECRET_KEY)"}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();
