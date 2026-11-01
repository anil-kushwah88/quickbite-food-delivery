# 🍅 Tomato – Full-Stack Food Delivery App (MERN)

A production-style food ordering platform with a **customer website**, an **admin panel** and a **REST API**, built with **MongoDB, Express, React and Node.js**. Customers can browse the menu, search, manage a cart, and check out with **Stripe** or **Cash on Delivery**; admins manage the menu and track orders from a dashboard.

![Node](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

### Customer website (`/frontend`)
- Browse 30+ dishes across 8 categories with category filter and live search
- Cart with quantity controls, persisted to the user's account and merged after login
- JWT sign-up / login (bcrypt-hashed passwords)
- Checkout with delivery details and **Stripe Checkout** or **Cash on Delivery**
- "My Orders" page with live order status and payment status
- Loading skeletons, toasts, 404 page, responsive layout

### Admin panel (`/admin`)
- Secure admin login (separate admin role in the JWT)
- Dashboard: revenue, orders, menu size, customers, status breakdown, recent orders
- Add dishes with image upload (preview, type/size validation)
- List / search / delete dishes (image is removed from disk too)
- Manage orders: filter by status, update status, see payment method and status

### Backend API (`/backend`)
- Layered structure: routes → controllers → models, with central error handling
- **Server-side price calculation** – the client only sends item ids and quantities
- **Stripe payments verified with Stripe's API** (`payment_status`), not with URL params
- Role-based auth middleware (`user` / `admin`), CORS allow-list, upload limits
- Auto-seeds a demo menu of 32 dishes on first start
- Works without Stripe keys (Cash on Delivery only) for easy local demos

---

## 🏗 Architecture

```
┌──────────────┐     ┌──────────────┐
│  frontend    │     │    admin     │   React 19 + Vite + React Router
│  :5173       │     │    :5174     │
└──────┬───────┘     └──────┬───────┘
       │   REST / JSON + JWT│
       └─────────┬──────────┘
          ┌──────▼───────┐        ┌──────────┐
          │   backend    │───────▶│  Stripe  │
          │ Express :4000│        └──────────┘
          └──────┬───────┘
          ┌──────▼───────┐
          │   MongoDB    │  users · foods · orders
          └──────────────┘
```

```
tomato-food-delivery/
├── backend/            # Express REST API
│   ├── config/         # env, database, stripe
│   ├── controllers/    # food, user, cart, order, admin
│   ├── middleware/     # auth (user/admin), multer upload, error handler
│   ├── models/         # Mongoose schemas
│   ├── routes/
│   ├── seed/           # demo menu + images
│   ├── app.js          # express app
│   └── server.js       # entry point
├── frontend/           # customer React app
├── admin/              # admin React app
└── package.json        # scripts to run everything together
```

---

## 🚀 Getting started

### Prerequisites
- **Node.js 20.19+** (22 recommended)
- **MongoDB** – local install, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- *(optional)* a [Stripe](https://dashboard.stripe.com/test/apikeys) test secret key

### 1. Clone and install
```bash
git clone https://github.com/<your-username>/tomato-food-delivery.git
cd tomato-food-delivery
npm run install:all
```

### 2. Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
```
Edit `backend/.env` – at minimum set `MONGO_URI` and `JWT_SECRET`. Add `STRIPE_SECRET_KEY` to enable card payments.

### 3. Run all three apps
```bash
npm run dev
```

| App | URL |
|-----|-----|
| Customer website | http://localhost:5173 |
| Admin panel | http://localhost:5174 |
| API | http://localhost:4000 |

The demo menu is seeded automatically on first start. Default admin login (change it in `.env`):

```
email:    admin@tomato.com
password: admin123
```

**Stripe test card:** `4242 4242 4242 4242`, any future date, any CVC.

---

## 🔌 API reference

Protected routes accept the JWT in a `token` header or `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | – | Health check |
| GET | `/api/food/list?category=&search=` | – | List dishes |
| GET | `/api/food/categories` | – | List categories |
| POST | `/api/food/add` | admin | Add dish (multipart: `image`, `name`, `description`, `price`, `category`) |
| POST | `/api/food/remove` | admin | Delete dish `{ id }` |
| POST | `/api/user/register` | – | `{ name, email, password }` → `{ token, user }` |
| POST | `/api/user/login` | – | `{ email, password }` → `{ token, user }` |
| GET | `/api/user/me` | user | Current user profile |
| POST | `/api/cart/add` | user | `{ itemId }` |
| POST | `/api/cart/remove` | user | `{ itemId }` |
| POST | `/api/cart/get` | user | Get saved cart |
| POST | `/api/cart/sync` | user | Merge guest cart `{ cartData }` |
| GET | `/api/order/config` | – | Payment options and delivery fee |
| POST | `/api/order/place` | user | `{ address, items: [{ _id, quantity }], paymentMethod: "stripe" \| "cod" }` |
| POST | `/api/order/verify` | user | Confirm Stripe payment `{ orderId }` |
| POST | `/api/order/userorders` | user | Orders of the logged-in user |
| GET | `/api/order/list?status=` | admin | All orders |
| POST | `/api/order/status` | admin | `{ orderId, status }` |
| POST | `/api/admin/login` | – | `{ email, password }` → `{ token }` |
| GET | `/api/admin/stats` | admin | Dashboard metrics |

---

## ☁️ Deployment

| Part | Suggested host | Notes |
|------|----------------|-------|
| Database | MongoDB Atlas (free tier) | Copy the connection string into `MONGO_URI` |
| Backend | Render / Railway | Root dir `backend`, start command `npm start`, add env vars, set `NODE_ENV=production` |
| Frontend & admin | Vercel / Netlify | Root dir `frontend` or `admin`, set `VITE_API_URL` to the backend URL |

After deploying, set `FRONTEND_URL` and `ADMIN_URL` in the backend env so CORS and Stripe redirects use the live URLs. SPA rewrites are already included (`vercel.json`, `public/_redirects`).

> Free hosts like Render have an ephemeral disk, so admin-uploaded images reset on redeploy (seed images are restored on start). For production, move uploads to a service like Cloudinary or S3.

---

## 🧭 Roadmap
- Cloudinary image storage and edit-dish support
- Real-time order tracking with Socket.IO
- Promo codes and ratings/reviews
- Unit and integration tests (Jest + Supertest)

## 📄 License
[MIT](LICENSE)
