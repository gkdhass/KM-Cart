# K_M_Cart API Endpoints Reference

## Base URL
- **Development:** `http://localhost:5000`
- **Production:** `https://your-backend.vercel.app`

---

## 🏠 Root & Health Endpoints

### GET `/`
**Description:** API overview with all available endpoints  
**Authentication:** None  
**Response:**
```json
{
  "success": true,
  "message": "KM Cart API is running 🚀",
  "version": "1.0.0",
  "timestamp": "2026-04-17T12:00:00.000Z",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "products": "/api/products",
    "orders": "/api/orders",
    "payment": "/api/payment",
    "chatbot": "/api/chatbot",
    "admin": "/api/admin"
  }
}
```

### GET `/api`
**Description:** Basic health check (no DB connection required)  
**Authentication:** None  
**Response:**
```json
{
  "success": true,
  "message": "K_M_Cart API is running on Vercel! 🚀",
  "version": "1.0.0",
  "timestamp": "2026-04-17T12:00:00.000Z",
  "environment": "production",
  "dbConnected": true
}
```

### GET `/api/health`
**Description:** Full health check including database connection  
**Authentication:** None  
**Response:**
```json
{
  "success": true,
  "message": "K_M_Cart API + Database are healthy! ✅",
  "timestamp": "2026-04-17T12:00:00.000Z",
  "database": "connected"
}
```

---

## 🔐 Authentication Endpoints (`/api/auth`)

### POST `/api/auth/register`
**Description:** Register a new user  
**Authentication:** None  
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### POST `/api/auth/login`
**Description:** Login user  
**Authentication:** None  
**Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### POST `/api/auth/forgot-password`
**Description:** Request password reset  
**Authentication:** None  
**Body:**
```json
{
  "email": "john@example.com"
}
```

### GET `/api/auth/me`
**Description:** Get current user profile  
**Authentication:** Required (JWT)  
**Headers:** `Authorization: Bearer <token>`

---

## 🛍️ Product Endpoints (`/api/products`)

### GET `/api/products`
**Description:** Get all products with filters  
**Authentication:** None  
**Query Parameters:**
- `category` - Filter by category
- `search` - Search by name
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sort` - Sort order (newest, price_asc, price_desc)
- `page` - Page number
- `limit` - Items per page

### GET `/api/products/:id`
**Description:** Get single product by ID  
**Authentication:** None

### GET `/api/products/category/:category`
**Description:** Get products by category  
**Authentication:** None

### GET `/api/products/featured`
**Description:** Get featured products  
**Authentication:** None

---

## 📦 Order Endpoints (`/api/orders`)

### POST `/api/orders`
**Description:** Create a new order  
**Authentication:** Required (JWT)  
**Body:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 999
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phone": "9876543210"
  },
  "paymentMethod": "razorpay",
  "totalAmount": 1998
}
```

### GET `/api/orders/my-orders`
**Description:** Get current user's orders  
**Authentication:** Required (JWT)

### GET `/api/orders/:id`
**Description:** Get single order by ID  
**Authentication:** Required (JWT)

---

## 💳 Payment Endpoints (`/api/payment`)

### POST `/api/payment/create-order`
**Description:** Create Razorpay order  
**Authentication:** Required (JWT)  
**Body:**
```json
{
  "amount": 1998
}
```

### POST `/api/payment/verify`
**Description:** Verify Razorpay payment  
**Authentication:** Required (JWT)  
**Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "orderId": "mongodb_order_id"
}
```

---

## 🤖 Chatbot Endpoints (`/api/chatbot`)

### POST `/api/chatbot/chat`
**Description:** Send message to AI chatbot  
**Authentication:** None  
**Body:**
```json
{
  "message": "Show me laptops under 50000"
}
```

---

## 👨‍💼 Admin Endpoints (`/api/admin`)

**Note:** All admin endpoints require authentication with admin role.

### Dashboard & Analytics

#### GET `/api/admin/stats`
**Description:** Get dashboard statistics  
**Authentication:** Required (Admin JWT)  
**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 150,
    "totalOrders": 320,
    "totalUsers": 450,
    "totalRevenue": 1250000,
    "recentOrders": [...],
    "lowStockProducts": [...]
  }
}
```

#### GET `/api/admin/charts/piedata`
**Description:** Get chart data for dashboard  
**Authentication:** Required (Admin JWT)

#### GET `/api/admin/analytics`
**Description:** Get detailed analytics  
**Authentication:** Required (Admin JWT)

### Product Management

#### GET `/api/admin/products`
**Description:** Get all products (admin view)  
**Authentication:** Required (Admin JWT)  
**Query Parameters:**
- `search` - Search products
- `sort` - Sort order
- `page` - Page number
- `limit` - Items per page

#### POST `/api/admin/products`
**Description:** Create new product  
**Authentication:** Required (Admin JWT)  
**Body:**
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone",
  "price": 129900,
  "category": "mobile",
  "brand": "Apple",
  "stock": 50,
  "images": ["url1", "url2"],
  "isFeatured": true
}
```

#### PUT `/api/admin/products/:id`
**Description:** Update product  
**Authentication:** Required (Admin JWT)

#### DELETE `/api/admin/products/:id`
**Description:** Delete product  
**Authentication:** Required (Admin JWT)

### Order Management

#### GET `/api/admin/orders`
**Description:** Get all orders  
**Authentication:** Required (Admin JWT)  
**Query Parameters:**
- `status` - Filter by status
- `page` - Page number
- `limit` - Items per page

#### PUT `/api/admin/orders/:id/status`
**Description:** Update order status  
**Authentication:** Required (Admin JWT)  
**Body:**
```json
{
  "status": "Shipped"
}
```

### User Management

#### GET `/api/admin/users`
**Description:** Get all users  
**Authentication:** Required (Admin JWT)  
**Query Parameters:**
- `search` - Search by name/email
- `page` - Page number
- `limit` - Items per page

#### PUT `/api/admin/users/:id/role`
**Description:** Change user role  
**Authentication:** Required (Admin JWT)  
**Body:**
```json
{
  "role": "admin"
}
```

#### PUT `/api/admin/users/:id/ban`
**Description:** Ban/unban user  
**Authentication:** Required (Admin JWT)

#### DELETE `/api/admin/users/:id`
**Description:** Delete user  
**Authentication:** Required (Admin JWT)

#### GET `/api/admin/users/:id/orders`
**Description:** Get user's orders  
**Authentication:** Required (Admin JWT)

---

## 🔑 Authentication

### JWT Token
All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token
1. Register or login via `/api/auth/register` or `/api/auth/login`
2. Response includes a `token` field
3. Use this token in subsequent requests

### Token Expiry
- Tokens expire after 30 days (configurable)
- Refresh by logging in again

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🚨 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (Admin only) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get Products
```bash
curl https://your-backend.vercel.app/api/products
```

### Get Admin Stats (with token)
```bash
curl https://your-backend.vercel.app/api/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- All prices are in Indian Rupees (₹)
- Image URLs should be publicly accessible
- File uploads go to Firebase Storage
- Maximum request body size: 10MB

---

**Last Updated:** April 2026  
**API Version:** 1.0.0
