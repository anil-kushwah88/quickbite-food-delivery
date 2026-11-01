import mongoose from "mongoose";

export const ORDER_STATUSES = ["Food Processing", "Out for delivery", "Delivered", "Cancelled"];
export const PAYMENT_METHODS = ["stripe", "cod"];

const orderItemSchema = new mongoose.Schema(
  {
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipcode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    amount: { type: Number, required: true },
    address: { type: addressSchema, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "Food Processing" },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    payment: { type: Boolean, default: false },
    stripeSessionId: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
