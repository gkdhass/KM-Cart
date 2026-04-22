<p align="center">
  <img src="https://img.shields.io/badge/🛒_K_M_Cart-Shop_Smart._Shop_Fast.-4F46E5?style=for-the-badge&labelColor=1e1b4b" alt="G_K_Cart Banner" height="60" />
</p>

<h1 align="center">🛒 K_M_Cart — Shop Smart. Shop Fast.</h1>

<p align="center">
  A modern, full-stack e-commerce platform built with the MERN stack.<br/>
  Sleek UI · Secure Payments · AI-Powered Chatbot · Blazing Fast
</p>

<p align="center">
  <a href="https://g-k-cart.vercel.app"><img src="https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-brightgreen?style=for-the-badge" alt="Live Demo" /></a>
  <a href="https://github.com/gkdhass/GK-Cart/stargazers"><img src="https://img.shields.io/github/stars/gkdhass/GK-Cart?style=for-the-badge&color=f59e0b&logo=github" alt="Stars" /></a>
  <a href="https://github.com/gkdhass/GK-Cart/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-0C2451?style=flat-square&logo=razorpay&logoColor=white" alt="Razorpay" />
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)
- [Acknowledgements](#-acknowledgements)

---

## 🎯 About

**K_M_Cart** is a feature-rich, production-ready e-commerce platform built from scratch using the **MERN stack** (MongoDB, Express, React, Node.js). It delivers a premium shopping experience with a beautiful, responsive UI, secure JWT authentication, Razorpay payment integration, and an AI-powered shopping assistant chatbot.

Whether you're a developer looking for a reference MERN project, a student building your portfolio, or an entrepreneur launching an online store — G_K_Cart has everything you need to get started.

---

## 🌐 Live Demo

<table>
  <tr>
    <td><strong>🖥️ Frontend</strong></td>
    <td><a href="https://g-k-cart.vercel.app">https://g-k-cart.vercel.app</a></td>
  </tr>
  <tr>
    <td><strong>⚡ Backend API</strong></td>
    <td><a href="https://g-k-cart-server.vercel.app/api/health">https://g-k-cart-server.vercel.app/api/health</a></td>
  </tr>
</table>

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👤 User | `demo@gkcart.com` | `Demo@123` |

> **Note:** Use Razorpay test card `4111 1111 1111 1111` with any future expiry and any 3-digit CVV for payment testing.

---

## ✨ Features

### 🛍️ Customer Features

| Feature | Description |
|---------|-------------|
| 🏠 Dynamic Homepage | Hero banner, featured products, category browsing, and deals section |
| 🔍 Smart Search & Filters | Search by name, filter by category, price range, and sort options |
| 📄 Product Details | Image gallery, specifications, reviews with ratings, and like system |
| 🛒 Cart System | Slide-out cart drawer with quantity controls and live price updates |
| 💳 Razorpay Payments | Secure online payments via UPI, Cards, and Net Banking |
| 💵 Cash on Delivery | Full COD support with order tracking |
| 📦 Order Management | Order history, order details, tracking with status updates |
| 🤖 AI Chatbot | Smart shopping assistant powered by NLP intent detection |
| 🔐 Secure Authentication | JWT-based login/register with password hashing (bcrypt) |
| 🔑 Forgot Password | Password recovery flow |
| 📱 Fully Responsive | Pixel-perfect design on mobile, tablet, and desktop |
| ⚡ Blazing Fast | Vite-powered frontend with optimized builds |

### 🔧 Technical Highlights

| Feature | Description |
|---------|-------------|
| 🛡️ Protected Routes | Auth guards with automatic redirect |
| 🔄 Auto Token Management | Axios interceptors for JWT handling & 401 auto-logout |
| 💾 Persistent Auth | Token persistence across browser sessions |
| 🌐 CORS Configured | Production-ready cross-origin handling |
| ☁️ Serverless Backend | Deployed as Vercel serverless functions |
| 🗄️ Cached DB Connection | MongoDB connection reuse across serverless invocations |

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | React 18 + Vite 5 | UI framework with fast HMR |
| **Styling** | TailwindCSS 3 | Utility-first CSS framework |
| **Routing** | React Router v6 | Client-side navigation |
| **State** | React Context API | Auth & Cart state management |
| **HTTP Client** | Axios | API calls with interceptors |
| **Icons** | React Icons | UI iconography |
| **Backend** | Node.js + Express 4 | REST API server |
| **Database** | MongoDB Atlas | Cloud NoSQL database |
| **ODM** | Mongoose 8 | MongoDB object modeling |
| **Auth** | JWT + bcryptjs | Token-based authentication |
| **Payments** | Razorpay | Payment gateway integration |
| **AI Chatbot** | Custom NLP Engine | Intent detection & response |
| **Hosting** | Vercel | Frontend + Serverless backend |

---

## 📸 Screenshots

### 🏠 Home Page
> Dynamic homepage with hero banner, featured products, and category browsing

![Home Page](screenshots/home.png)

### 🛍️ Product Listing
> Search, filter, and browse products with responsive grid layout

![Products](screenshots/products.png)

### 📄 Product Detail
> Detailed product view with image gallery, reviews, and ratings

![Product Detail](screenshots/detail.png)

### 🛒 Cart Drawer
> Slide-out cart with quantity controls and live totals

![Cart](screenshots/cart.png)

### 💳 Checkout & Payment
> Multi-step checkout with Razorpay integration (UPI/Card/NetBanking/COD)

![Checkout](screenshots/checkout.png)

### 🔐 Login / Register
> Split-layout authentication with form validation

![Auth](screenshots/auth.png)

### 📦 Order History
> Track and manage your orders with status indicators

![Orders](screenshots/orders.png)

### 🤖 AI Chatbot
> Smart shopping assistant with quick replies and product suggestions

![Chatbot](screenshots/chatbot.png)

> 📌 **To add screenshots:** Create a `screenshots/` folder in the project root and add your images. Recommended size: 1280×720px.

---

## 📁 Project Structure

```
G_K_Cart/
│
├── client/                        # ⚛️ React Frontend (Vite)
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/              # Login, Register forms
│   │   │   ├── Cart/              # CartDrawer component
│   │   │   ├── Chatbot/           # ChatbotButton, ChatbotModal,
│   │   │   │                      #   ChatMessage, TypingIndicator
│   │   │   ├── Layout/            # Navbar, Footer
│   │   │   └── Products/          # ProductCard component
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   └── CartContext.jsx    # Shopping cart state
│   │   ├── hooks/
│   │   │   └── useChatbot.js      # Chatbot logic hook
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── Products.jsx       # Product listing
│   │   │   ├── ProductDetail.jsx  # Single product view
│   │   │   ├── Checkout.jsx       # Checkout + payment
│   │   │   ├── Orders.jsx         # Order history
│   │   │   ├── OrderSuccess.jsx   # Order confirmation
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Registration page
│   │   │   ├── ForgotPassword.jsx # Password recovery
│   │   │   ├── ContactUs.jsx      # Contact page
│   │   │   ├── PrivacyPolicy.jsx  # Privacy policy
│   │   │   └── TermsOfService.jsx # Terms of service
│   │   ├── utils/
│   │   │   └── api.js             # Axios instance + interceptors
│   │   ├── App.jsx                # Root component + routing
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json                # SPA rewrite config
│   └── package.json
│
├── server/                        # 🟢 Node.js Backend (Express)
│   ├── api/
│   │   └── index.js               # Vercel serverless entry
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Forgot Password
│   │   ├── productController.js   # CRUD + reviews
│   │   ├── orderController.js     # Place & fetch orders
│   │   ├── paymentController.js   # Razorpay integration
│   │   └── chatbotController.js   # AI chat handler
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Product.js             # Product schema + reviews
│   │   ├── Order.js               # Order schema
│   │   └── FAQ.js                 # Chatbot FAQ schema
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   ├── productRoutes.js       # /api/products/*
│   │   ├── orderRoutes.js         # /api/orders/*
│   │   ├── paymentRoutes.js       # /api/payment/*
│   │   └── chatbotRoutes.js       # /api/chatbot/*
│   ├── seed/
│   │   └── seedData.js            # Database seeding script
│   ├── utils/
│   │   └── intentDetector.js      # NLP intent detection
│   ├── server.js                  # Local dev entry point
│   ├── vercel.json                # Serverless config
│   ├── .env.example               # Environment template
│   └── package.json
│
├── vercel.json                    # Root monorepo config
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Download |
|------------|---------|----------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| npm | v9+ | Comes with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com) |
| MongoDB Atlas | Free M0 | [mongodb.com/atlas](https://www.mongodb.com/atlas) |

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/gkdhass/GK-Cart.git
cd GK-Cart
```

**2. Install backend dependencies**
```bash
cd server
npm install
```

**3. Install frontend dependencies**
```bash
cd ../client
npm install
```

**4. Set up environment variables**
```bash
# In the server/ directory
cp .env.example .env
# Open .env and fill in your values (see Environment Variables section below)
```

**5. Seed the database (optional)**
```bash
# From the server/ directory
npm run seed
```

**6. Start the development servers**

Open **two terminal windows**:

```bash
# Terminal 1 — Backend (from server/)
npm run dev
# ✅ Server running at http://localhost:5000

# Terminal 2 — Frontend (from client/)
npm run dev
# ✅ App running at http://localhost:5173
```

**7. Open in browser**
```
🌐 Frontend  → http://localhost:5173
📡 API Base  → http://localhost:5000/api
🏥 Health    → http://localhost:5000/api/health
```

---

## 🔐 Environment Variables

Create a `.env` file in the `server/` directory:

```env
# ═══════════════════════════════════════════════
# G_K_Cart Server Environment Variables
# ═══════════════════════════════════════════════

# ── SERVER ──────────────────────────────────────
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gkcart
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# ── RAZORPAY ────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# ── GEMINI AI (Optional) ───────────────────────
# GEMINI_API_KEY=your_gemini_api_key
```

For **production deployment** on Vercel, also set these in the **client** project:

```env
# ── CLIENT (Vercel Environment Variables) ───────
# All frontend vars MUST start with VITE_
VITE_API_URL=https://your-backend.vercel.app
```

> ⚠️ **Never commit `.env` files to Git!** The `.gitignore` is already configured to exclude them.

---

## 📡 API Documentation

### Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:5000/api` |
| Production | `https://g-k-cart-server.vercel.app/api` |

### 🏥 Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server status check |

### 🔐 Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/auth/register` | Register a new user account | ❌ |
| `POST` | `/api/auth/login` | Login with email & password | ❌ |
| `POST` | `/api/auth/forgot-password` | Send password reset link | ❌ |

### 🛍️ Product Routes — `/api/products`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/products` | Get all products (with filters) | ❌ |
| `GET` | `/api/products/:id` | Get single product by ID | ❌ |
| `POST` | `/api/products/:id/reviews` | Submit a product review | ✅ |
| `PUT` | `/api/products/:id/reviews/:reviewId/like` | Toggle review like | ✅ |

**Query Parameters** for `GET /api/products`:

| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `search` | String | Search by product name | `?search=laptop` |
| `category` | String | Filter by category | `?category=Electronics` |
| `maxPrice` | Number | Maximum price filter | `?maxPrice=5000` |
| `page` | Number | Page number (pagination) | `?page=2` |
| `limit` | Number | Items per page | `?limit=12` |

### 📦 Order Routes — `/api/orders`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/orders/place` | Place a new order | ✅ |
| `GET` | `/api/orders/my-orders` | Get authenticated user's orders | ✅ |
| `GET` | `/api/orders/:orderId` | Get order by order ID | ✅ |

### 💳 Payment Routes — `/api/payment`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/payment/create-order` | Create Razorpay order | ✅ |
| `POST` | `/api/payment/verify` | Verify payment & save order | ✅ |

### 🤖 Chatbot Routes — `/api/chatbot`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/chatbot` | Send message to AI chatbot | ❌ |

**Request Body:**
```json
{
  "message": "Show me laptops under 50000",
  "userId": "optional_user_id_for_order_tracking"
}
```

---

## ☁️ Deployment

G_K_Cart is deployed on **Vercel** as two separate projects:

### Deploy Backend

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Set **Root Directory** → `server`
4. Set **Framework Preset** → `Other`
5. Leave Build & Output commands **empty**
6. Add all server environment variables
7. Deploy ✅

### Deploy Frontend

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the **same** GitHub repo
3. Set **Root Directory** → `client`
4. Set **Framework Preset** → `Vite`
5. Set **Build Command** → `npm run build`
6. Set **Output Directory** → `dist`
7. Add `VITE_API_URL` = your backend URL
8. Deploy ✅

### Post-Deployment

- Set `CLIENT_URL` in backend env vars to your frontend URL
- Redeploy the backend
- Whitelist `0.0.0.0/0` in MongoDB Atlas → Network Access

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions are **greatly appreciated**.

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m "Add some AmazingFeature"
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

```
MIT License

Copyright (c) 2025 G_K_Cart

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 👨‍💻 Author

<p align="center">
  <strong>Built with ❤️ by G_K_Dhass</strong>
</p>

<p align="center">
  <a href="https://github.com/gkdhass"><img src="https://img.shields.io/badge/GitHub-gkdhass-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
</p>

---

## 🙏 Acknowledgements

| Service | Purpose |
|---------|---------|
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Free cloud database hosting |
| [Vercel](https://vercel.com) | Free frontend & serverless hosting |
| [Razorpay](https://razorpay.com) | Payment gateway integration |
| [TailwindCSS](https://tailwindcss.com) | Utility-first CSS framework |
| [React Icons](https://react-icons.github.io) | Beautiful icon library |
| [Vite](https://vitejs.dev) | Lightning-fast build tool |
| [Mongoose](https://mongoosejs.com) | Elegant MongoDB ODM |

---

<p align="center">
  <img src="https://img.shields.io/badge/⭐_Star_this_repo_if_you_found_it_helpful!-F59E0B?style=for-the-badge" alt="Star" />
</p>

<p align="center">
  <strong>G_K_Cart — Shop Smart. Shop Fast. 🛒</strong><br/>
  <sub>Made with ☕ and lots of JavaScript</sub>
</p>
