import Stripe from "stripe";
import env from "./env.js";

// Stripe is optional: without a key the app runs with Cash on Delivery only.
const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

export const isStripeEnabled = () => Boolean(stripe);

export default stripe;
