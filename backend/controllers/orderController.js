import mongoose from "mongoose";
import Order, { ORDER_STATUSES } from "../models/orderModel.js";
import Food from "../models/foodModel.js";
import User from "../models/userModel.js";
import env from "../config/env.js";
import stripe, { isStripeEnabled } from "../config/stripe.js";
import ApiError, { asyncHandler } from "../utils/ApiError.js";

const ADDRESS_FIELDS = ["firstName", "lastName", "email", "street", "city", "state", "zipcode", "country", "phone"];
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Builds order lines from the client's cart using prices from the database,
 * so the client can never change what it pays.
 */
const buildOrderItems = async (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new ApiError(400, "Your cart is empty");

  const quantities = new Map();
  for (const item of rawItems) {
    const id = item?._id || item?.foodId;
    const qty = Math.floor(Number(item?.quantity));
    if (!mongoose.isValidObjectId(id) || !(qty > 0)) continue;
    quantities.set(String(id), (quantities.get(String(id)) || 0) + Math.min(qty, 99));
  }
  if (quantities.size === 0) throw new ApiError(400, "Your cart is empty");

  const foods = await Food.find({ _id: { $in: [...quantities.keys()] } }).lean();
  if (foods.length !== quantities.size) throw new ApiError(400, "Some items in your cart are no longer available");

  const items = foods.map((f) => ({
    foodId: f._id,
    name: f.name,
    price: f.price,
    image: f.image,
    quantity: quantities.get(f._id.toString()),
  }));
  const subtotal = round2(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  return { items, subtotal };
};

const validateAddress = (address = {}) => {
  const missing = ADDRESS_FIELDS.filter((f) => !String(address[f] ?? "").trim());
  if (missing.length) throw new ApiError(400, `Missing delivery details: ${missing.join(", ")}`);
  return Object.fromEntries(ADDRESS_FIELDS.map((f) => [f, String(address[f]).trim()]));
};

const clearCart = (userId) => User.findByIdAndUpdate(userId, { cartData: {} });

// GET /api/order/config – tells the client which payment options exist
export const getCheckoutConfig = (_req, res) => {
  res.json({
    success: true,
    data: {
      stripeEnabled: isStripeEnabled(),
      currency: env.currency,
      deliveryFee: env.deliveryFee,
    },
  });
};

// POST /api/order/place  { address, items: [{ _id, quantity }], paymentMethod: "stripe" | "cod" }
export const placeOrder = asyncHandler(async (req, res) => {
  const { address, items: rawItems } = req.body || {};
  const paymentMethod = req.body?.paymentMethod === "cod" ? "cod" : "stripe";

  if (paymentMethod === "stripe" && !isStripeEnabled()) {
    throw new ApiError(400, "Online payment is not configured. Please choose Cash on Delivery.");
  }

  const cleanAddress = validateAddress(address);
  const { items, subtotal } = await buildOrderItems(rawItems);
  const deliveryFee = env.deliveryFee;

  const order = await Order.create({
    userId: req.userId,
    items,
    subtotal,
    deliveryFee,
    amount: round2(subtotal + deliveryFee),
    address: cleanAddress,
    paymentMethod,
  });

  if (paymentMethod === "cod") {
    await clearCart(req.userId);
    return res.status(201).json({ success: true, message: "Order placed", orderId: order._id });
  }

  try {
    const lineItems = items.map((i) => ({
      price_data: {
        currency: env.currency,
        product_data: { name: i.name },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.quantity,
    }));
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: env.currency,
          product_data: { name: "Delivery Charges" },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: cleanAddress.email,
      metadata: { orderId: order._id.toString() },
      success_url: `${env.frontendUrl}/verify?success=true&orderId=${order._id}`,
      cancel_url: `${env.frontendUrl}/verify?success=false&orderId=${order._id}`,
    });

    order.stripeSessionId = session.id;
    await order.save();
    res.status(201).json({ success: true, session_url: session.url, orderId: order._id });
  } catch (err) {
    await Order.findByIdAndDelete(order._id);
    throw new ApiError(502, `Payment gateway error: ${err.message}`);
  }
});

// POST /api/order/verify  { orderId, success }
// Payment status is confirmed with Stripe itself – the query string is never trusted.
export const verifyOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body || {};
  if (!mongoose.isValidObjectId(orderId)) throw new ApiError(400, "Invalid order id");

  const order = await Order.findOne({ _id: orderId, userId: req.userId });
  if (!order) throw new ApiError(404, "Order not found");

  if (order.paymentMethod === "cod" || order.payment) {
    return res.json({ success: true, message: "Order confirmed" });
  }

  let paid = false;
  if (isStripeEnabled() && order.stripeSessionId) {
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    paid = session.payment_status === "paid";
  }

  if (paid) {
    order.payment = true;
    await order.save();
    await clearCart(req.userId);
    return res.json({ success: true, message: "Payment successful" });
  }

  await Order.findByIdAndDelete(order._id);
  res.json({ success: false, message: "Payment not completed, order cancelled" });
});

// POST /api/order/userorders
export const userOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: orders });
});

// GET /api/order/list  (admin)  ?status=Delivered
export const listOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && ORDER_STATUSES.includes(req.query.status)) filter.status = req.query.status;
  // Hide abandoned Stripe checkouts
  filter.$or = [{ paymentMethod: "cod" }, { payment: true }];
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: orders });
});

// POST /api/order/status  { orderId, status }  (admin)
export const updateStatus = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) throw new ApiError(400, "Invalid status");

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  order.status = status;
  // Cash is collected on delivery
  if (status === "Delivered" && order.paymentMethod === "cod") order.payment = true;
  await order.save();

  res.json({ success: true, message: "Status updated", data: order });
});
